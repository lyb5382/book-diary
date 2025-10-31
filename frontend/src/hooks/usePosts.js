import { usePostContext } from '../context/PostContext'

export function usePosts() {
    return usePostContext()
}