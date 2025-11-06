import React, { useCallback, useEffect, useState } from 'react'
import { fetchPosts, fetchPost } from '../../api/adminApi'
import { uploadToS3 } from '../../api/postApi'
import api from '../../api/client'
import AdminFilter from '../../components/AdminFilter'
import AdminPostsList from '../../components/AdminPostsList'
import UploadForm from '../user/UploadForm'
import PostDetailModal from '../user/PostDetailModal'
import './AdminDashboard.scss'

const AdminPosts = () => {
    const [list, setList] = useState([])
    const [query, setQuery] = useState({ page: 1, size: 20, status: '', q: '', user: '' })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [openUpload, setOpenUpload] = useState(false)
    const [selectedPost, setSelectedPost] = useState(null)
    const [editingPost, setEditingPost] = useState(null)

    const loadPosts = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const items = await fetchPosts(query)
            setList(items)
        } catch (error) {
            console.error('게시글 불러오기 실패', error)
            setError('게시글을 불러오는데 실패했습니다.')
        } finally {
            setLoading(false)
        }
    }, [query])

    useEffect(() => {
        loadPosts()
    }, [loadPosts])

    // 모달 관리 useEffect (이관)
    useEffect(() => {
        if (openUpload || selectedPost) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => { document.body.classList.remove('modal-open'); };
    }, [openUpload, selectedPost, editingPost]); // 🚨 editingPost 추가

    // 🚨 5. (이관) AdminDashboard의 핸들러들 이관
    const handleupload = async ({ id, title, content, file, replaceKey, currentKey }) => {
        try {
            let s3Key = null
            if (file) {
                s3Key = await uploadToS3(file, { replaceKey })
            } else if (id && currentKey) {
                s3Key = currentKey
            }
            const payload = { title, content, fileUrl: s3Key ? [s3Key] : [] }

            if (id) {
                await fetchPost(id, payload); // adminApi.fetchPost 사용
            } else {
                await api.post('/api/admin/posts', payload)
            }
            loadPosts() // 목록 새로고침
            setOpenUpload(false)
            setEditingPost(null)
        } catch (error) {
            console.error('uploaded failed', error)
            alert("업로드/수정 중 오류가 발생했습니다.")
        }
    }

    const handleDelete = async (postItem) => {
        if (window.confirm(`'${postItem.title}' 게시물을 정말 삭제하시겠습니까?`)) {
            try {
                await api.delete(`/api/admin/posts/${postItem._id}`)
                if (selectedPost?._id === postItem._id) setSelectedPost(null)
                loadPosts() // 목록 새로고침
            } catch (error) {
                console.error("삭제 실패:", error)
                alert("삭제에 실패했습니다.")
            }
        }
    }

    const handleAddClick = () => { // (이관)
        setEditingPost(null)
        setOpenUpload(true)
    }
    const handleEdit = (postItem) => { // (이관)
        setSelectedPost(null)
        setEditingPost(postItem)
        setOpenUpload(true)
    }
    const handleCloseUpload = () => { // (이관)
        setOpenUpload(false)
        setEditingPost(null)
    }
    const handlePostClick = (postItem) => { // (이관)
        setSelectedPost(postItem)
    }
    const handleQueryChange = (newQuery) => { // (이관)
        setQuery((prev) => ({ ...prev, ...newQuery, page: 1 }))
    }

    if (error) {
        return <div className="alert alert-error" role="alert">{error}</div>
    }

    return (
        <div className="admin-dashboard">
            <header className="dashboard-header">
                <h2>게시물 관리</h2>
                <button className="btn primary" onClick={handleAddClick}>
                    + 새 게시물
                </button>
            </header>

            {/* 🚨 (신규) 필터 컴포넌트 추가 */}
            <AdminFilter onQueryChange={handleQueryChange} />

            {/* 🚨 (이관) 테이블 -> AdminPostsList 컴포넌트로 대체 */}
            <AdminPostsList
                posts={list} // 🚨 list를 posts prop으로 전달
                loading={loading}
                onPostClick={handlePostClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {/* 🚨 7. (이관) 모달 로직 */}
            {openUpload && (
                <UploadForm
                    onUploaded={handleupload}
                    onClose={handleCloseUpload}
                    initail={editingPost}
                />
            )}
            {selectedPost && (
                <PostDetailModal
                    post={selectedPost}
                    onClose={() => setSelectedPost(null)}
                    onEdit={() => handleEdit(selectedPost)}
                    onDelete={() => handleDelete(selectedPost)}
                />
            )}
        </div>
    )
}

export default AdminPosts