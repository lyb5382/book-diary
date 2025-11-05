import api from "./client"
import { urlToKey } from "../util/urlToKey";

function toKeyArray(val) {
    if (!val) return [];
    const arr = Array.isArray(val) ? val : [val];
    return arr.map(urlToKey).filter(Boolean);
}

export const uploadToS3 = async (file, opts = {}) => {
    const { replaceKey } = opts
    const {
        data: { url, key },
    } = await api.post("/api/upload/presign", {
        filename: file.name,
        contentType: file.type,
        replaceKey,
    });

    const putRes = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
    });

    if (!putRes.ok) throw new Error("S3 업로드 실패");

    return key;
};

export const createPost = async ({ title, content, fileUrl }) => {
    const { data } = await api.post("/api/posts", {
        title,
        content,
        fileUrl: fileUrl,
    });
    return data;
};

export const fetchMyPosts = async () => {
    const { data } = await api.get('/api/posts/my')

    return Array.isArray(data) ? data : []
}
export const fetchAllPosts = async () => {
    const { data } = await api.get('/api/posts')

    return Array.isArray(data) ? data : []
}

export const fetchPostById = async (id) => {
    const { data } = await api.get(`/api/posts/${id}`)
    return data
}

export const updatePost = async (id, patch) => {
    const payload = { ...patch }
    if (payload.fileUrl !== undefined) {
        payload.fileUrl = toKeyArray(payload.fileUrl);
        delete payload.fileUrl;
    }
    const { data } = await api.put(`/api/posts/${id}`, payload)
    return data
}

export const deletePost = async (id) => {
    const { data } = await api.delete(`/api/posts/${id}`)
    return data
}