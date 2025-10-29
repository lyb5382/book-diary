import { useCallback, useEffect, useState } from 'react'
import { createPost } from "../api/postApi"
import { fetchMyPosts } from '../api/postApi'

export function usePosts() {
    const [it, setIt] = useState([])
    const [loading, setLoading] = useState(false)
    const load = useCallback(async () => {
        setLoading(true)
        try {
            const list = await fetchMyPosts()
            setIt(list)
        } catch (error) {
            setLoading(false)
        }
    })
    const add = useCallback(async ({ title, content, filekey = [] }) => {
        const created = await createPost({ title, content, filekey })
        setIt((prev) => [created, ...prev])
        return created
    }, [])

    useEffect(() => { load() }, [load])

    return {
        it, loading, load, add
    }
}