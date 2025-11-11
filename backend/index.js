const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()
const passport = require('./config/passport')
const authRoutes = require('./routes/authRoutes')
const uploadRoutes = require('./routes/upload')
const postRoutes = require('./routes/posts')
const adminRoutes = require('./routes/admin')

const app = express()

const PORT = process.env.PORT || 3000

app.use(cors({
    origin: process.env.FRONT_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json({ limit: '2mb' }))
app.use(passport.initialize())

app.get('/', (req, res) => {
    res.send('photo meno')
})

app.use('/api/auth', authRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/admin', adminRoutes)

app.use((req, res) => {
    res.status(400).json({ message: '해당 경로를 찾을 수 없음' })
})

app.use((req, res) => {
    res.status(500).json({ message: '서버 오류' })
})

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB 연결 성공'))
    .catch((err) => console.error('MongoDB 연결 실패:', err.message))

app.listen(PORT, () => {
    console.log(`🚀 Server is running ≫ http://localhost:${PORT}`)
})