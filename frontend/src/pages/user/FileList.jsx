import React, { useEffect, useMemo } from 'react'
import UserPostItem from './UserPostItem'
import { PostContext } from '../../context/PostContext'
import { useContext } from 'react'
import './FileList.scss'

const FileList = ({ search = '', onPostClick, onEdit, onDelete }) => {
    const { items, loading } = useContext(PostContext)
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return items
        return items.filter((i) =>
            i.title?.toLowerCase().includes(q) ||
            i.content?.toLowerCase().includes(q)
        )
    }, [items, search])
    console.log('[FileList] 로딩 상태:', loading)
    console.log('[FileList] 수신된 items 배열:', filtered)

    if (loading) {
        return (
            <div className="list-message-card" style={{ textAlign: 'center', padding: '2rem' }}>
                <p>데이터 로딩 중...</p>
            </div>
        )
    }

    if (!filtered || !filtered.length) {
        console.warn('[FileList] items 배열이 비어있어 "게시물 없음"을 표시합니다.')
        return (
            <div className="list-message-card" style={{ textAlign: 'center', padding: '2rem' }}>
                <p>{search ? '검색 결과가 없습니다.' : '기록된 서약이 없습니다.'}</p>
            </div>
        )
    }

    return (
        <div className='post-list'>
            {filtered.map((i) => (
                <UserPostItem key={i._id} item={i} onClick={() => onPostClick(i)} onEdit={() => onEdit(i)} onDelete={() => onDelete(i)} />
            ))}
        </div>
    )
}

export default FileList