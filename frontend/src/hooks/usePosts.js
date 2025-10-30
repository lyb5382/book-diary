import { useCallback, useState } from 'react'
import { createPost, fetchMyPosts } from "../api/postApi"

export function usePosts() {
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

    return {
        items, loading, load, add
    }
}