import React from 'react'
import './UserPostItem.scss'
// 🚨 FileList import는 여기서 필요 없습니다.
// import FileList from './FileList'

const UserPostItem = ({ item, onClick }) => {

    // [데이터 추적] FileList로부터 받은 개별 item을 로깅합니다.
    console.log('[UserPostItem] 렌더링할 개별 item:', item);

    const files = Array.isArray(item.fileUrl) ? item.fileUrl : (item?.fileUrl ? [item.fileUrl] : [])

    const formatDate = (dateString) => {
        if (!dateString) return '날짜 정보 없음';
        try {
            const date = new Date(dateString);
            // 🚨 날짜 포맷 변경 (예: 2025. 10. 30.)
            return date.toLocaleDateString('ko-KR', {
                year: 'numeric', month: '2-digit', day: '2-digit'
            }).replace(/\.$/, ''); // 마지막 . 제거
        } catch (error) {
            console.error('날짜 변환 오류:', error);
            return '날짜 오류';
        }
    }

    return (
        // 🚨 (수정) '.inner' 클래스를 제거하고 '.post-card'만 남깁니다.
        <div className="post-card" onClick={onClick}>
            <div className="file-card-head">
                {/* No. 표시는 주석 처리 (디자인 단순화)
                {(item?.number ?? '') !== '' && (
                    <span>No. {item.number}</span>
                )}
                */}
                <h3>
                    {item?.title ?? '제목 없음'}
                </h3>
            </div>

            <div className="file-card-details">
                {/* {item?.content && (
                    <p className='file-card-content'>{item.content}</p>
                )} */}
                {files?.length > 0 && (
                    <div className="file-card-img">
                        {files.map((src, idx) => (
                            <img key={`${item._id}-img-${idx}`} src={src} alt={`file-${idx}`} className='card-img' />
                        ))}
                    </div>
                )}
            </div>
            {/* 🚨 meta (날짜) 위치를 하단으로 이동 */}
            <div className="file-card-meta">
                <time className='file-card-time'>{formatDate(item?.createdAt || item?.updateAt)}</time>
            </div>
        </div>
    )
}

export default UserPostItem
