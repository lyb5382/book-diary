import React, { useState } from 'react'
import { Edit, Trash2 } from 'lucide-react'

// 🚨 1. (수정) props로 posts, onPostClick, onEdit, onDelete를 받습니다.
const AdminPostsList = ({ posts = [], loading, onPostClick, onEdit, onDelete, onStatusChange }) => {
    const [openStatusMenu, setOpenStatusMenu] = useState(null)
    const handleChangeStatus = (post, newStatus) => {
        if (window.confirm(`'${post.title}'의 상태를 '${newStatus}'(으)로 변경하시겠습니까?`)) {
            onStatusChange(post, newStatus); // 부모(AdminPosts)의 API 함수 호출
        }
        setOpenStatusMenu(null); // 메뉴 닫기
    }
    // 🚨 2. (신규) 로딩 상태 표시
    if (loading) {
        return (
            <div className="list-message-card" style={{ textAlign: 'center', padding: '2rem' }}>
                <p>데이터 로딩 중...</p>
            </div>
        )
    }

    return (
        // 🚨 3. (수정) <div className='inner adminpostlist'> -> <section className='posts-table'>
        <section className='posts-table'>
            <table>
                <thead>
                    <tr>
                        <th>제목</th>
                        <th>상태</th>
                        {/* 🚨 (신규) '사용자 ID' 컬럼 헤더 추가 */}
                        <th>사용자 ID</th>
                        <th>파일 URL</th>
                        <th>수정일</th>
                        <th>작업</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.length > 0 ? (
                        posts.map(post => (
                            <tr key={post._id}>
                                <td className="post-title" onClick={() => onPostClick(post)}>
                                    {post.title}
                                </td>
                                <td className="status-cell">
                                    <button
                                        className={`btn-action status-badge status-${post.status || 'pending'}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // 팝업 메뉴 토글
                                            setOpenStatusMenu(openStatusMenu === post._id ? null : post._id);
                                        }}
                                    >
                                        {post.status || 'pending'}
                                    </button>
                                    {openStatusMenu === post._id && (
                                        <div className="status-popover" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => handleChangeStatus(post, 'pending')} className="status-option status-pending">Pending</button>
                                            <button onClick={() => handleChangeStatus(post, 'approved')} className="status-option status-approved">Approved</button>
                                            <button onClick={() => handleChangeStatus(post, 'rejected')} className="status-option status-rejected">Rejected</button>
                                            <button onClick={() => handleChangeStatus(post, 'hidden')} className="status-option status-hidden">Hidden</button>
                                        </div>
                                    )}
                                </td>
                                <td className="user-id">
                                    {typeof post.user === 'object' ? post.user?._id : post.user}
                                </td>
                                <td>
                                    {post.fileUrl && post.fileUrl.length > 0 ? (
                                        <a href={post.fileUrl[0]} target="_blank" rel="noopener noreferrer">보기</a>
                                    ) : ('없음')}
                                </td>
                                <td>
                                    {new Date(post.updatedAt || post.createdAt).toLocaleString('ko-KR')}
                                </td>
                                <td>
                                    <button className="btn-action edit" onClick={() => onEdit(post)}>
                                        <Edit size={14} />
                                    </button>
                                    <button className="btn-action delete" onClick={() => onDelete(post)}>
                                        <Trash2 size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            {/* 🚨 (수정) colSpan="5" -> colSpan="6" */}
                            <td colSpan="6">표시할 게시물이 없습니다.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </section>
    )
}

export default AdminPostsList