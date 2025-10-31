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
    const add = useCallback(async ({ title, content, fileKeys = [] }) => {
        try {
            const created = await createPost({ title, content, fileKeys })
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
            // 1. 현재 수정하려는 아이템을 찾습니다.
            const currentItem = items.find(i => i._id === id);

            // 2. patch 객체에 fileUrl이 명시적으로 없으면 (즉, 프론트엔드가 이 필드를 보내지 않았으면),
            //    기존의 fileUrl을 patch에 추가하여 보존합니다.
            //    (이 로직은 백엔드의 fileUrl !== undefined 체크 로직을 우회하기 위함입니다.)
            const patchWithFiles = { ...patch };

            if (patchWithFiles.fileUrl === undefined && currentItem && currentItem.fileUrl) {
                // 🚨 기존 URL을 그대로 유지하여 백엔드가 삭제하지 않도록 합니다.
                patchWithFiles.fileUrl = currentItem.fileUrl;
            }

            // 3. 수정된 patch 객체를 API로 전송
            const updated = await updatePost(id, patchWithFiles);

            // 4. 상태 갱신 로직
            setItems((p) => p.map((i) => (i._id === id ? updated : i)));
            return updated;
        } catch (error) {
            console.error("게시물 수정 실패:", error);
            throw error;
        }
    }, [items])

    useEffect(() => { load() }, [])

    return (
        <PostContext.Provider value={{ items, loading, load, add, remove, update }}>
            {children}
        </PostContext.Provider>
    )
}

export default PostProvider
