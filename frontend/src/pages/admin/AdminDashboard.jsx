import React, { useEffect, useState } from 'react'
import api from '../../api/client'
import { fetchStats, fetchPosts, fetchPost } from '../../api/adminApi'
import Adminstats from '../../components/Adminstats'
import UploadForm from '../user/UploadForm'
import PostDetailModal from '../user/PostDetailModal'
import { uploadToS3 } from '../../api/postApi'
import './AdminDashboard.scss'

const StatCard = ({ title, value }) => (
    <div className="stat-card">
        <h4>{title}</h4>
        <p>{value}</p>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({ today: 0, pending: 0, reports: 0 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const fetchData = async () => {
        setLoading(true)
        setError('')
        try {
            const statsRes = await fetchStats()
            setStats(statsRes)
        } catch (err) {
            console.error("대시보드 데이터 로드 실패:", err)
            const msg = err.response?.data?.message || '데이터를 불러오는데 실패했습니다.'
            if (err.response?.status === 403 || err.response?.status === 401) {
                setError('접근 권한이 없습니다. 다시 로그인해 주십시오.')
            } else {
                setError(msg)
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    if (loading) {
        return <div>[보안 시스템] 관리자 데이터를 로드하는 중...</div>
    }
    if (error) {
        return <div className="alert alert-error" role="alert">{error}</div>
    }

    return (
        <div className="admin-dashboard">
            <header className="dashboard-header">
                <h2>관리자 대시보드</h2>
            </header>
            <section className="stats-grid">
                <StatCard title="오늘 게시물" value={stats.today} />
                <StatCard title="승인 대기" value={stats.pending} />
                <StatCard title="총 신고 수" value={stats.reports} />
            </section>
        </div>
    )
}

export default AdminDashboard