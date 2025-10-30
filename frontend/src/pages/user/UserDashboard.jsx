import React, { useEffect, useState } from 'react'
import UploadForm from './UploadForm'
import FileList from './FileList'
import './UserDashboard.scss'
import { uploadToS3 } from '../../api/postApi'
import { usePosts } from '../../hooks/usePosts'
import PostDetailModal from './PostDetailModal'

const UserDashboard = () => {
    const [search, setSearch] = useState('')
    const [openUpload, setOpenUpload] = useState(false) // 🚨 'open' -> 'openUpload'로 명칭 변경
    const { items, loading, load: loadPosts, add } = usePosts()

    // 🚨 (신규) 상세 보기 모달을 위한 state
    const [selectedPost, setSelectedPost] = useState(null) // null이면 닫힘, item 객체면 열림

    useEffect(() => {
        loadPosts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleupload = async ({ title, content, file }) => {
        try {
            const key = file ? await uploadToS3(file) : null
            const created = await add({ title, content, fileKeys: key ? [key] : [] }) // 🚨 fileKeys (대문자 K)
            console.log('db ok!!', created)
            loadPosts();
        } catch (error) {
            console.error('uploaded failed', error)
        }
    }

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
                <UploadForm onUploaded={handleupload} onClose={() => setOpenUpload(false)} />
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
                items={items}
                loading={loading}
                onPostClick={handlePostClick}
            />
        </section>
    )
}

export default UserDashboard