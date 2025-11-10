import api from './client'

export const fetchStats = async () => {
    const { data } = await api.get('/api/admin/stats')
    return data
}

export const fetchPosts = async (params = {}) => {
    const { page = 1, size = 20, status, q } = params
    const { data } = await api.get('/api/admin/posts', { params: { page, size, status, q } })
    return Array.isArray(data) ? data : []
}

export const fetchUsers = async (params = {}) => {
    const { page = 1, size = 20, status, q } = params
    const { data } = await api.get('/api/admin/users', { params: { page, size, status, q } })
    return {
        items: Array.isArray(data?.users) ? data.users : [],
        total: data?.total ?? 0,
        page: data.page ?? page,
        size: data?.size ?? size,
        totalPages: data?.totalPages ?? 1
    }
}

export const fetchPost = async (id, patch) => {
    const { data } = await api.patch(`/api/admin/posts/${id}`, patch)
    return data
}

export const fetchUser = async (id, patch) => {
    const { data } = await api.patch(`/api/admin/users/${id}`, patch)
    return data
}

export const deletePost = async (id) => {
    const { data } = await api.delete(`/api/admin/posts/${id}`)
    return data
}

export const createPost = async (payload) => {
    const { data } = await api.post('/api/admin/posts', payload)
    return data
}