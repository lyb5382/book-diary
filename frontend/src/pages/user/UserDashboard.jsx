import React, { useState, useEffect, useContext } from 'react'
import UploadForm from './UploadForm'
import FileList from './FileList'
import './UserDashboard.scss'
import PostDetailModal from './PostDetailModal'
import { PostContext } from '../../context/PostContext'
import { uploadToS3 } from '../../api/postApi'

const UserDashboard = () => {
    const [search, setSearch] = useState('')
    const [openUpload, setOpenUpload] = useState(false)
    const [selectedPost, setSelectedPost] = useState(null)
    const [editingPost, setEditingPost] = useState(null)
    const { add, remove, update } = useContext(PostContext)

    useEffect(() => {
        if (openUpload || selectedPost) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [openUpload, selectedPost]);

    const handleupload = async ({ id, title, content, file, replaceKey, currentKey }) => {
        try {
            let s3Key = null;
            if (file) {
                s3Key = await uploadToS3(file, { replaceKey });
            } else if (id && currentKey) {
                s3Key = currentKey;
            }
            const payload = {
                title,
                content,
                fileKeys: s3Key ? [s3Key] : []
            };
            if (id) {
                await update(id, payload);
                console.log('db update ok!!', id);
            } else {
                await add(payload);
                console.log('db add ok!!');
            }
            setOpenUpload(false);
            setEditingPost(null);
        } catch (error) {
            console.error('uploaded failed', error);
            alert("업로드/수정 중 오류가 발생했습니다.");
        }
    }
    const handleAddClick = () => {
        setEditingPost(null);
        setOpenUpload(true);
    };
    const handleDelete = async (postItem) => {
        if (window.confirm(`'${postItem.title}' 게시물을 정말 삭제하시겠습니까?`)) {
            try {
                await remove(postItem._id);
                if (selectedPost?._id === postItem._id) {
                    setSelectedPost(null);
                }
            } catch (error) {
                console.error("삭제 실패:", error);
                alert("삭제에 실패했습니다.");
            }
        }
    }
    const handleEdit = (postItem) => {
        setSelectedPost(null);
        setEditingPost(postItem);
        setOpenUpload(true);
    }
    const handleCloseUpload = () => {
        setOpenUpload(false);
        setEditingPost(null);
    }
    const handlePostClick = (postItem) => {
        setSelectedPost(postItem);
    }

    return (
        <section>
            <div className="inner user">
                <div className="search-warp">
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder='검색' />
                    <button className='btn primary' onClick={handleAddClick}>upload</button>
                </div>
            </div>
            {openUpload && (
                <UploadForm onUploaded={handleupload} onClose={handleCloseUpload} initail={editingPost} />
            )}

            {selectedPost && (
                <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} onEdit={() => handleEdit(selectedPost)} onDelete={() => handleDelete(selectedPost)} />
            )}

            <FileList search={search} onPostClick={handlePostClick} onEdit={handleEdit} onDelete={handleDelete} />
        </section>
    )
}

export default UserDashboard