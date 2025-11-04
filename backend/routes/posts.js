const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const { presignGet, deleteObject } = require('../src/s3')
const mongoose = require('mongoose')
const Post = require('../models/Posts')

const S3_BASE_URL = process.env.S3_BASE_URL || `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`

function joinS3Url(base, key) {
    const b = String(base || '').replace(/\/+$/, '')
    const k = String(key || '').replace(/^\/+/, '')
    return `${b}/${k}`
}

function urlToKey(u) {
    if (!u) return ''
    const s = String(u)
    if (!/^https?:\/\//i.test(s)) return s
    const base = String(S3_BASE_URL || '').replace(/\/+$/, '')
    return s.startsWith(base + '/') ? s.slice(base.length + 1) : s
}

const toArray = (val) => {
    if (!val) return []
    if (Array.isArray(val)) return val.filter(Boolean)
    if (typeof val === 'string') {
        try {
            const parsed = JSON.parse(val); return Array.isArray(parsed) ? parsed.filter(Boolean) : [val]
        }
        catch {
            return [val]
        }
    }
    return []
}

const authenticateToken = (req, res, next) => {
    let token = null
    const h = req.headers.authorization
    if (h && h.toLowerCase().startsWith('bearer')) token = h.slice(7).trim()
    if (req.cookies?.token) token = req.cookies.token
    if (!token) return res.status(401).json({ message: '토큰 없음' })
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET)
        next()
    } catch (error) {
        return res.status(403).json({ message: '유효하지 않은 토큰' })
    }
}
const ensureObjectId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: '잘못된 id' })
    next()
}

const pickDefined = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined))

router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, content, fileUrl = [], imageUrl } = req.body
        let files = toArray(fileUrl)
        if (!files.length && imageUrl) files = toArray(imageUrl)
        const uid = req.user._id || req.user.id
        const latest = await Post.findOne({ user: uid }).sort({ number: -1 })
        const nextNumber = latest ? (Number(latest.number) + 1) : 1
        const post = await Post.create({
            user: uid,
            number: nextNumber,
            title,
            content,
            fileUrl: files,
            imageUrl
        })
        res.status(201).json(post)
    } catch (error) {
        console.error('Post /api/posts failed', error)
        res.status(500).json({ message: '서버 오류 발생' })
    }
})

router.get('/', async (req, res) => {
    try {
        const list = await Post.find().sort({ createdAt: -1 }).lean()
        const data = list.map((p) => {
            const raw = Array.isArray(p.fileUrl) ? p.fileUrl : p.imageUrl ? [p.imageUrl] : []
            const keys = raw.filter((v) => typeof v === 'string' && v.length > 0)
            const urls = keys.map((v) => v.startsWith('http') ? v : joinS3Url(S3_BASE_URL, v))
            return { ...p, fileUrl: urls }
        })
        res.json(data)
    } catch (error) {
        console.error('Get /api/posts failed', error)
        res.status(500).json({ message: 'server error' })
    }
})

router.get('/my', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id
        if (!userId) return res.status(400).json({ message: 'user 정보 없음' }) // 🚨 suer -> user 오타 수정
        const myPosts = await Post.find({ user: userId }).sort({ createdAt: -1 }).lean()
        const data = myPosts.map(p => {
            const raw = Array.isArray(p.fileUrl) ? p.fileUrl : (p.imageUrl ? [p.imageUrl] : [])
            const keys = raw.filter(v => typeof v === 'string' && v.length > 0)
            const urls = keys.map(v => (v.startsWith('http') ? v : joinS3Url(S3_BASE_URL, v)))
            return { ...p, fileUrl: urls }
        });
        res.json(data)
    } catch (error) {
        console.error('Get /api/posts/my failed', error)
        res.status(500).json({ message: 'server error' })
    }
})

router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const doc = await Post.findById(req.params.id)
        if (!doc) return res.status(404).json({ message: '존재하지 않음' })
        const keys = Array.isArray(doc.fileUrl) ? doc.fileUrl : (doc.imageUrl ? [doc.imageUrl] : [])
        const urls = keys.filter(v => typeof v === 'string' && v.length > 0).map(v => (v.startsWith('http') ? v : joinS3Url(S3_BASE_URL, v)))
        res.json({ ...doc, fileUrl: urls }) // 🚨 .lean()이 아니므로 doc 그대로 반환
    } catch (error) {
        console.error('Get /api/posts/my failed', error)
        res.status(500).json({ message: 'server error' })
    }
})

router.put("/:id", authenticateToken, ensureObjectId, async (req, res) => {
    try {
        // 🚨 3. (수정) req.body의 변수들을 여기서 선언해야 합니다.
        const { title, content, fileUrl, imageUrl } = req.body;

        const before = await Post.findById(req.params.id)
            .select("user fileUrl imageUrl")
            .lean();
        if (!before)
            return res.status(404).json({ message: "존재하지 않는 게시글" });

        const uid = String(req.user.id || req.user._id);

        // 🚨 2. before.user (정상)
        if (String(before.user) !== uid) {
            return res.status(403).json({ message: "권한이 없습니다." });
        }

        const updates = pickDefined({
            title,
            content,
            fileUrl: fileUrl !== undefined ? toArray(fileUrl) : undefined,
            imageUrl,
        });
        const oldKeys = [
            ...(Array.isArray(before.fileUrl) ? before.fileUrl : []),
            ...(before.imageUrl ? [before.imageUrl] : []),
        ]
            .map(urlToKey)
            .filter(Boolean);

        const newKeys = [
            ...(updates.fileUrl !== undefined
                ? updates.fileUrl
                : Array.isArray(before.fileUrl)
                    ? before.fileUrl
                    : []),
            ...(updates.imageUrl !== undefined
                ? [updates.imageUrl]
                : before.imageUrl
                    ? [before.imageUrl]
                    : []),
        ]
            .map(urlToKey)
            .filter(Boolean);
        const toDelete = oldKeys.filter((k) => !newKeys.includes(k));

        if (toDelete.length) {
            const results = await Promise.allSettled(
                toDelete.map((k) => deleteObject(k))
            );
            const fail = results.filter((r) => r.status === "rejected");
            if (fail.length) {
                console.warn(
                    "[S3 Delete Partial Fail]",
                    fail.map((f) => f.reason?.message || f.reason)
                );
            }
        }

        const updated = await Post.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        res.json(updated);
    } catch (error) {
        console.error("PUT /api/posts/:id 실패", error); // 추가됨: 로깅 강화
        res.status(500).json({ message: "서버 오류" });
    }
});

router.delete("/:id", authenticateToken, ensureObjectId, async (req, res) => {
    try {
        // 추가됨: 소유권 검증(본인 글만 삭제)
        const doc = await Post.findById(req.params.id).select(
            "user fileUrl imageUrl"
        ); // 추가됨
        if (!doc) return res.status(404).json({ message: "존재하지 않는 게시글" });

        const uid = String(req.user.id || req.user._id); // 추가됨
        if (String(doc.user) !== uid) {
            return res.status(403).json({ message: "권한이 없습니다." }); // 추가됨
        }

        const keys = [
            ...(Array.isArray(doc.fileUrl) ? doc.fileUrl : []),
            ...(doc.imageUrl ? [doc.imageUrl] : []),
        ]
            .map(urlToKey)
            .filter(Boolean);

        if (keys.length) {
            const results = await Promise.allSettled(
                keys.map((k) => deleteObject(k))
            );
            const fail = results.filter((r) => r.status === "rejected");
            if (fail.length) {
                console.warn(
                    "[S3 Delete Partial Fail]",
                    fail.map((f) => f.reason?.message || f.reason)
                );
            }
        }
        await doc.deleteOne(); // 변경됨: 안전 삭제
        res.json({ ok: true, id: doc._id });
    } catch (error) {
        res.status(500).json({ message: "서버 오류" });
    }
});

module.exports = router