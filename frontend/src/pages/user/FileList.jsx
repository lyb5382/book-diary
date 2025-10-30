import React from 'react'
import UserPostItem from './UserPostItem'
import './FileList.scss'

const FileList = ({ items = [], loading, onReload, search, onPostClick }) => {
    console.log('[FileList] 로딩 상태:', loading)
    console.log('[FileList] 수신된 items 배열:', items)

    if (loading) {
        return (
            // 🚨 '.inner' 클래스를 '.list-message-card'로 변경
            <div className="list-message-card" style={{ textAlign: 'center', padding: '2rem' }}>
                <p>데이터 로딩 중...</p>
            </div>
        )
    }
    if (!items || !items.length) {
        console.warn('[FileList] items 배열이 비어있어 "게시물 없음"을 표시합니다.')
        return (
            // 🚨 '.inner' 클래스를 '.list-message-card'로 변경
            <div className="list-message-card" style={{ textAlign: 'center', padding: '2rem' }}>
                <p>기록된 서약이 없습니다.</p>
            </div>
        )
    }

    return (
        <div className='post-list'>
            {items.map((i) => (
                // 🚨 items={i} -> item={i}로 수정
                <UserPostItem key={i._id} item={i} onClick={() => onPostClick(i)} />
            ))}
        </div>
    )
}

export default FileList