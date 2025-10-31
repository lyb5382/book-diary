import React from 'react'
import { X } from 'lucide-react'
import { Edit, Trash2 } from 'lucide-react'
import './PostDetailModal.scss'

// 날짜 포맷팅 헬퍼 (UserPostItem에서 가져옴)
const formatDate = (dateString) => {
    if (!dateString) return '날짜 정보 없음';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
        }).replace(/\.$/, '');
    } catch (error) {
        return '날짜 오류';
    }
}

const PostDetailModal = ({ post, onClose, onEdit, onDelete }) => {
    // 🚨 item.fileUrl -> post.fileUrl
    const files = Array.isArray(post.fileUrl) ? post.fileUrl : (post?.fileUrl ? [post.fileUrl] : [])

    return (
        // 🚨 UploadForm과 동일한 .am-backdrop 사용
        <section className='am-backdrop' onClick={onClose}>
            <div className="am-panel Detail-panel" onClick={(e) => e.stopPropagation()}>
                <div className="post-item-actions">
                    <button
                        className="btn-action edit"
                        aria-label="수정"
                        onClick={(e) => { e.stopPropagation(); onEdit?.(post); }}
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        className="btn-action delete"
                        aria-label="삭제"
                        onClick={(e) => { e.stopPropagation(); onDelete?.(post); }}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>

                <header>
                    <h2>{post.title}</h2>
                    <p className="sub">{formatDate(post?.createdAt || post?.updateAt)}</p>
                </header>

                <div className="detail-grid">
                    {files?.length > 0 && (
                        <div className="detail-img-wrapper">
                            {files.map((src, idx) => (
                                <img key={`${post._id}-detail-img-${idx}`} src={src} alt={`file-${idx}`} className='detail-img' />
                            ))}
                        </div>
                    )}

                    {post.content && (
                        <div className="detail-content">
                            <p>{post.content}</p>
                        </div>
                    )}
                </div>

                <div className="actions">
                    <button type='button' className="btn ghost" onClick={onClose} aria-label="닫기">
                        <X size={18} />
                    </button>
                </div>
            </div>
        </section>
    )
}

export default PostDetailModal