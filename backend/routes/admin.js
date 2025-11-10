const express = require('express')
const router = express.Router()
const { authenticateToken } = require('../middlewares/auth')
const User = require('../models/User')
const Post = require('../models/Posts')
const audit = require('../middlewares/audit')
const { requireRole } = require('../middlewares/roles')
const { presignGet, deleteObject } = require('../src/s3')
const mongoose = require('mongoose')

const ensureObjectId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: '잘못된 id' });
    }
    next();
};

const S3_BASE_URL = process.env.S3_BASE_URL || `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`


const pickDefined = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined))

function joinS3Url(base, key) {
    const b = String(base || '').replace(/\/+$/, '')
    const k = String(key || '').replace(/^\/+/, '')
    return `${b}/${k}`
}

function urlToKey(u) {
    if (!u) return ''
    const s = String(u)
    if (!/^https?:\/\//i.test(s)) return s // 이미 key
    const base = String(S3_BASE_URL || '').replace(/\/+$/, '')
    return s.startsWith(base + '/') ? s.slice(base.length + 1) : s
}

router.get('/stats', authenticateToken, requireRole('admin'), async (req, res) => {
    const [today, pending, reports] = await Promise.all([
        Post.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
        Post.countDocuments({ status: 'pending' }),
        Post.aggregate([{ $group: { _id: null, sum: { $sum: '$reportCount' } } }])
    ])
    res.json({ today, pending, reports: reports?.[0]?.sum ?? 0 })
})

router.get('/posts', authenticateToken, requireRole('admin'), async (req, res) => {
    const { page = 1, size = 20, status, q } = req.query
    const filter = {}
    if (status) filter.status = status
    if (q) filter.title = { $regex: q, $options: 'i' }
    const items = await Post.find(filter).sort({ createdAt: -1 }).skip((+page - 1) * +size).limit(+size).select('title user status fileUrl content createdAt updatedAt').lean()
    const data = items.map(p => {
        const raw = Array.isArray(p.fileUrl) ? p.fileUrl : []
        const keys = raw.filter(v => typeof v === 'string' && v.length > 0)
        const urls = keys.map(v => (v.startsWith('http') ? v : joinS3Url(S3_BASE_URL, v)))
        return { ...p, fileUrl: urls }
    })
    res.json(data)
})

router.get('/users', authenticateToken, requireRole('admin'), async (req, res) => {
    const { page = 1, size = 20, role, q } = req.query
    const filter = {}
    if (role) filter.role = role
    if (q) {
        filter.$or = [
            { email: { $regex: q, $options: 'i' } },
            { displayName: { $regex: q, $options: 'i' } }
        ]
    }
    const users = await User.find(filter).sort({ createdAt: -1 }).skip((+page - 1) * +size).limit(+size).select('email displayName role isActive createdAt updatedAt')
    const total = await User.countDocuments(filter)
    res.json({ total, users })
})

router.patch('/posts/:id', authenticateToken, requireRole('admin'), ensureObjectId, audit({ resource: 'post', action: 'update', getTargetId: (req) => req.params.id }), async (req, res) => {
    // 🚨 (수정) upadtes -> updates 오타 수정
    const updates = Object.fromEntries(Object.entries(req.body).filter(([, v]) => v !== undefined))
    const updated = await Post.findByIdAndUpdate(req.params.id, updates, { new: true })
    if (!updated) return res.status(404).json({ message: '게시물 없음' })
    res.json(updated)
})

router.patch('/users/:id', authenticateToken, requireRole('admin'), ensureObjectId, audit({ resource: 'user', action: 'update', getTargetId: (req) => req.params.id }), async (req, res) => {
    // 🚨 (수정) upadtes -> updates 오타 수정 (2곳)
    const { role, isActive, resetRock } = req.body
    const updates = {}
    if (role) updates.role = role
    if (typeof isActive == 'boolean') updates.isActive = isActive
    if (resetRock) {
        updates.failedLoginAttemp = 0
        updates.lastLoginAttemp = null
    }
    const user = await User.findOneAndUpdate({ _id: req.params.id }, updates, { new: true })
    if (!user) return res.status(404).json({ message: '사용자 없음' })
    res.json(user)
})

router.delete("/posts/:id", authenticateToken, requireRole('admin'), ensureObjectId, audit({ resource: 'post', action: 'delete', getTargetId: (req) => req.params.id }), async (req, res) => {
    try {
        // (관리자는 소유권 검증이 필요 없습니다)
        const doc = await Post.findById(req.params.id).select(
            "fileUrl imageUrl" // S3 키 필드만 선택
        );
        if (!doc) return res.status(404).json({ message: "존재하지 않는 게시글" });

        // S3에서 파일 키 추출
        const keys = [
            ...(Array.isArray(doc.fileUrl) ? doc.fileUrl : []),
            ...(doc.imageUrl ? [doc.imageUrl] : []),
        ]
            .map(urlToKey) // 헬퍼 함수로 URL -> Key 변환
            .filter(Boolean);

        // S3 파일 삭제
        if (keys.length) {
            const results = await Promise.allSettled(
                keys.map((k) => deleteObject(k)) // s3.js의 deleteObject 호출
            );
            const fail = results.filter((r) => r.status === "rejected");
            if (fail.length) {
                console.warn(
                    "[S3 Admin Delete Partial Fail]",
                    fail.map((f) => f.reason?.message || f.reason)
                );
            }
        }

        // DB에서 게시물 삭제
        await doc.deleteOne();
        res.json({ ok: true, id: doc._id });
    } catch (error) {
        console.error("DELETE /api/admin/posts/:id 실패", error);
        res.status(500).json({ message: "서버 오류" });
    }
});

module.exports = router