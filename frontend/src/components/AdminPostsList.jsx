import React from 'react'
import { Edit, Trash2 } from 'lucide-react' // 🚨 아이콘 import (필요시)

// 🚨 1. (수정) props로 posts, onPostClick, onEdit, onDelete를 받습니다.
const AdminPostsList = ({ posts = [], loading, onPostClick, onEdit, onDelete }) => {

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
                                <td>
                                    <span className={`status-badge status-${post.status || 'pending'}`}>
                                        {post.status || 'pending'}
                                    </span>
                                </td>
                                {
                                    /* 🚨 (신규) '사용자 ID' 데이터(td) 추가 
                                       (post.user 객체에 _id가 있거나, post.user가 ID 문자열 자체일 수 있음)
                                    */
                                }
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