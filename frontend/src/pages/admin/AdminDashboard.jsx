import React, { useEffect, useState } from 'react'
import api from '../../api/client'
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
    const [stats, setStats] = useState({ today: 0, pending: 0, reports: 0 });
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openUpload, setOpenUpload] = useState(false)
    const [selectedPost, setSelectedPost] = useState(null)
    const [editingPost, setEditingPost] = useState(null)

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [statsRes, postsRes] = await Promise.all([
                api.get('/api/admin/stats'),
                api.get('/api/admin/posts', {
                    params: { page: 1, size: 20 }
                })
            ]);
            setStats(statsRes.data);
            setPosts(postsRes.data);
        } catch (err) {
            console.error("대시보드 데이터 로드 실패:", err);
            const msg = err.response?.data?.message || '데이터를 불러오는데 실패했습니다.';
            if (err.response?.status === 403 || err.response?.status === 401) {
                setError('접근 권한이 없습니다. 다시 로그인해 주십시오.');
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(); // 분리된 함수 호출
    }, []);

    useEffect(() => {
        if (openUpload || selectedPost) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [openUpload, selectedPost]);

    const handleupload = async ({ id, title, content, file, replaceKey, currentKey }) => {
        try {
            let s3Key = null
            if (file) {
                s3Key = await uploadToS3(file, { replaceKey });
            } else if (id && currentKey) {
                s3Key = currentKey;
            }
            const payload = {
                title,
                content,
                fileKeys: s3Key ? [s3Key] : []
            }

            if (id) {
                await api.patch(`/api/admin/posts/${id}`, payload);
            } else {
                await api.post('/api/admin/posts', payload);
            }

            await fetchData(); // [수정] 목록 새로고침
            setOpenUpload(false);
            setEditingPost(null);

        } catch (error) {
            console.error('uploaded failed', error);
            alert("업로드/수정 중 오류가 발생했습니다. (백엔드 API 확인 필요)");
        }
    }

    const handleDelete = async (postItem) => {
        if (window.confirm(`'${postItem.title}' 게시물을 정말 삭제하시겠습니까?`)) {
            try {
                await api.delete(`/api/admin/posts/${postItem._id}`);

                if (selectedPost?._id === postItem._id) {
                    setSelectedPost(null);
                }
                await fetchData(); // [수정] 목록 새로고침
            } catch (error) {
                console.error("삭제 실패:", error);
                alert("삭제에 실패했습니다. (백엔드 API 확인 필요)");
            }
        }
    }

    const handleAddClick = () => {
        setEditingPost(null);
        setOpenUpload(true);
    }
    const handleEdit = (postItem) => {
        setSelectedPost(null);
        setEditingPost(postItem);
        setOpenUpload(true);
    }
    const handleCloseUpload = () => {
        setOpenUpload(false);
        setEditingPost(null);
    }
    const handlePostClick = (postItem) => {
        setSelectedPost(postItem);
    }

    if (loading) {
        return <div>[보안 시스템] 관리자 데이터를 로드하는 중...</div>;
    }
    if (error) {
        return <div className="alert alert-error" role="alert">{error}</div>;
    }

    return (
        <div className="admin-dashboard">

            <header className="dashboard-header">
                <h2>관리자 대시보드</h2>
                <button className="btn primary" onClick={handleAddClick}>
                    + 새 게시물
                </button>
            </header>

            <section className="posts-table">

                <section className="stats-grid">
                    <StatCard title="오늘 게시물" value={stats.today} />
                    <StatCard title="승인 대기" value={stats.pending} />
                    <StatCard title="총 신고 수" value={stats.reports} />
                </section>

                <div className="table-header">
                    <h3>게시물 관리 (최신 20개)</h3>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>제목</th>
                            <th>상태</th>
                            <th>파일 URL</th>
                            <th>수정일</th>
                            <th>작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.length > 0 ? (
                            posts.map(post => (
                                <tr key={post._id}>
                                    <td className="post-title" onClick={() => handlePostClick(post)}>
                                        {post.title}
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${post.status}`}>
                                            {post.status}
                                        </span>
                                    </td>
                                    <td>{post.fileUrl ? <a href={post.fileUrl} target="_blank" rel="noopener noreferrer">보기</a> : '없음'}</td>
                                    <td>{new Date(post.upatedAt || post.createdAt).toLocaleString('ko-KR')}</td>
                                    <td>
                                        <button className="btn-action edit" onClick={() => handleEdit(post)}>수정</button>
                                        <button className="btn-action delete" onClick={() => handleDelete(post)}>삭제</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5">표시할 게시물이 없습니다.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>

            {openUpload && (
                <UploadForm onUploaded={handleupload} onClose={handleCloseUpload} initail={editingPost} />
            )}

            {selectedPost && (
                <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} onEdit={() => handleEdit(selectedPost)} onDelete={() => handleDelete(selectedPost)} />
            )}
        </div>
    );
}

export default AdminDashboard;