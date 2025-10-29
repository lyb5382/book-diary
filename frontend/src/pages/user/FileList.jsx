import React from 'react'
import UserPostItem from './UserPostItem'

const FileList = ({ items = [], loading, onReload, search }) => {
    if (!items.length) return <p>게시물 없음</p>
    return (
        <div className='post-list'>
            {items.map((i) => (
                <UserPostItem key={i._id} items={i} />
            ))}
        </div>
    )
}

export default FileList
