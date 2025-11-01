import { useCallback, useEffect, useState } from 'react'
import { createPost, deletePost, fetchMyPosts, updatePost } from "../api/postApi"
import { PostContext } from './PostContext'

export const PostProvider = ({ children }) => {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const load = useCallback(async () => {
        setLoading(true)
        try {
            const list = await fetchMyPosts()
            setItems(list)
        } catch (error) {
            console.error("게시물 로드 실패:", error)
        } finally {
            setLoading(false)
        }
    }, [])
    const add = useCallback(async (payload) => {
        try {
            const created = await createPost(payload)
            setItems((prev) => [created, ...prev])
            return created
        } catch (error) {
            console.error("게시물 추가 실패:", error)
            throw error
        }
    }, [])
    const remove = useCallback(async (id) => {
        await deletePost(id)
        setItems((p) => p.filter((i) => i._id !== id))
    }, [])
    const update = useCallback(async (id, patch) => {
        try {
            const updated = await updatePost(id, patch)
            setItems((p) => p.map((i) => (i._id === id ? updated : i)));
            return updated;
        } catch (error) {
            console.error("게시물 수정 실패:", error);
            throw error;
        }
    }, [])

    useEffect(() => { load() }, [load])

    return (
        <PostContext.Provider value={{ items, loading, load, add, remove, update }}>
            {children}
        </PostContext.Provider>
    )
}

export default PostProvider
