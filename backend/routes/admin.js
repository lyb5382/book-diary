const express = require('express')
const router = express.Router()
const { authenticateToken } = require('../middlewares/auth')
const User = require('../models/User')
const Post = require('../models/Posts')
const audit = require('../middlewares/audit')
const { requireRole } = require('../middlewares/roles')

const S3_BASE_URL = process.env.S3_BASE_URL || `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`

function joinS3Url(base, key) {
    const b = String(base || '').replace(/\/+$/, '')
    const k = String(key || '').replace(/^\/+/, '')
    return `${b}/${k}`
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

router.patch('/posts/:id', authenticateToken, requireRole('admin'), audit({ resource: 'post', action: 'update', getTargetId: (req) => req.params.id }), async (req, res) => {
    const upadtes = Object.fromEntries(Object.entries(req.body).filter(([, v]) => v !== undefined))
    const updated = await Post.findByIdAndUpdate(req.params.id, upadtes, { new: true })
    if (!updated) return res.status(404).json({ message: '게시물 없음' })
    res.json(updated)
})

router.patch('/users/:id', authenticateToken, requireRole('admin'), audit({ resource: 'user', action: 'update', getTargetId: (req) => req.params.id }), async (req, res) => {
    const { role, isActive, resetRock } = req.body
    const upadtes = {}
    if (role) upadtes.role = role
    if (typeof isActive == 'boolean') upadtes.isActive = isActive
    if (resetRock) {
        upadtes.failedLoginAttemp = 0
        upadtes.lastLoginAttemp = null
    }
    const user = await User.findOneAndUpdate({ _id: req.params.id }, upadtes, { new: true })
    if (!user) return res.status(404).json({ message: '사용자 없음' })
    res.json(user)
})

module.exports = router