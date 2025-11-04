const express = require('express')
const router = express.Router()
const { authenticateToken } = require('../middlewares/auth')
const User = require('../models/User')
const Post = require('../models/Posts')
const Audit = require('../models/AuditLog')
const { requireRole } = require('../middlewares/roles')

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
    const items = await Post.find(filter).sort({ createdAt: -1 }).skip((+page - 1) * +size).limit(+size).select('title user status fileUrl upatedAt')
    res.json(items)
})

module.exports = router