import React, { useState, useEffect } from 'react'
import UploadForm from '../../components/UploadForm' // 🚨 경로 수정 (components 폴더 가정)
import FileList from '../../components/FileList'   // 🚨 경로 수정 (components 폴더 가정)
import PostDetailModal from '../../components/PostDetailModal' // 🚨 경로 수정 (components 폴더 가정)
import './UserDashboard.scss'
// 🚨 (수정) usePosts 훅을 PostProvider에서 import
import { usePosts } from '../../context/PostProvider'
// 🚨 uploadToS3는 이제 UploadForm이 직접 사용하지 않으므로 여기서 필요 없음
// import { uploadToS3 } from '../../api/postApi'

const UserDashboard = () => {
    const [search, setSearch] = useState('')
    const [openUpload, setOpenUpload] = useState(false) // 🚨 'open' -> 'openUpload'로 명칭 변경

    // 🚨 (신규) 상세 보기 모달을 위한 state
    const [selectedPost, setSelectedPost] = useState(null) // null이면 닫힘, item 객체면 열림

    useEffect(() => {
        if (openUpload || selectedPost) { // UploadForm 또는 PostDetailModal이 열려있으면
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        // 컴포넌트 언마운트 시 클래스 제거 (클린업)
        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [openUpload, selectedPost]);

    // 🚨 (신규) FileList에서 아이템 클릭 시 호출될 핸들러
    const handlePostClick = (postItem) => {
        setSelectedPost(postItem);
    }

    return (
        <section>
            <div className="inner user">
                <div className="search-warp">
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder='검색' />
                    {/* 🚨 setOpen -> setOpenUpload로 변경 */}
                    <button className='btn primary' onClick={() => setOpenUpload(true)}>upload</button>
                </div>
            </div>

            {/* 업로드 폼 모달 */}
            {openUpload && (
                <UploadForm onClose={() => setOpenUpload(false)} />
            )}

            {/* 🚨 (신규) 상세 보기 모달 */}
            {selectedPost && (
                <PostDetailModal
                    post={selectedPost}
                    onClose={() => setSelectedPost(null)}
                />
            )}

            {/* 🚨 onPostClick 핸들러 전달 */}
            <FileList
                search={search}
                onPostClick={handlePostClick}
            />
        </section>
    )
}

export default UserDashboard