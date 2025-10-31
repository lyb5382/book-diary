import React from 'react'
import { Edit, Trash2 } from 'lucide-react'
import './UserPostItem.scss'

const UserPostItem = ({ item, onClick, onEdit, onDelete }) => {
    console.log('[UserPostItem] 렌더링할 개별 item:', item);

    const files = Array.isArray(item.fileUrl) ? item.fileUrl : (item?.fileUrl ? [item.fileUrl] : [])

    const formatDate = (dateString) => {
        if (!dateString) return '날짜 정보 없음';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ko-KR', {
                year: 'numeric', month: '2-digit', day: '2-digit'
            }).replace(/\.$/, ''); // 마지막 . 제거
        } catch (error) {
            console.error('날짜 변환 오류:', error);
            return '날짜 오류';
        }
    }

    return (
        <div className="post-card clickable" onClick={onClick}>
            <div className="file-card-head">
                <h3>
                    {item?.title ?? '제목 없음'}
                </h3>
            </div>

            <div className="file-card-details">
                {files?.length > 0 && (
                    <div className="file-card-img">
                        {files.map((src, idx) => (
                            <img key={`${item._id}-img-${idx}`} src={src} alt={`file-${idx}`} className='card-img' />
                        ))}
                    </div>
                )}
            </div>
            <div className="file-card-meta">
                <time className='file-card-time'>{formatDate(item?.createdAt || item?.updateAt)}</time>

                {/* 🚨 (이동) 버튼 영역을 meta 안으로 이동시킵니다. */}
                <div className="post-item-actions">
                    <button
                        className="btn-action edit"
                        aria-label="수정"
                        onClick={(e) => { e.stopPropagation(); onEdit?.(item); }}
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        className="btn-action delete"
                        aria-label="삭제"
                        onClick={(e) => { e.stopPropagation(); onDelete?.(item); }}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default UserPostItem
