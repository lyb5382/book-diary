import React from 'react'
import { X } from 'lucide-react'
import './PostDetailModal.scss' // 🚨 이 SCSS 파일도 생성해야 합니다.

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

const PostDetailModal = ({ post, onClose }) => {
    // 🚨 item.fileUrl -> post.fileUrl
    const files = Array.isArray(post.fileUrl) ? post.fileUrl : (post?.fileUrl ? [post.fileUrl] : [])

    return (
        // 🚨 UploadForm과 동일한 .am-backdrop 사용
        <section className='am-backdrop' onClick={onClose}>
            {/* 🚨 UploadForm과 동일한 .am-panel 사용 (클래스명 추가) */}
            <div className="am-panel Detail-panel" onClick={(e) => e.stopPropagation()}>
                <header>
                    <h2>{post.title}</h2>
                    <p className="sub">{formatDate(post?.createdAt || post?.updateAt)}</p>
                </header>

                <div className="detail-grid">
                    {/* 1. 이미지 표시 */}
                    {files?.length > 0 && (
                        <div className="detail-img-wrapper">
                            {files.map((src, idx) => (
                                <img key={`${post._id}-detail-img-${idx}`} src={src} alt={`file-${idx}`} className='detail-img' />
                            ))}
                        </div>
                    )}

                    {/* 2. 내용 표시 */}
                    {post.content && (
                        <div className="detail-content">
                            <p>{post.content}</p>
                        </div>
                    )}
                </div>

                {/* 3. 닫기 버튼 */}
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