import { createContext, useContext } from 'react'

export const PostContext = createContext()
export const usePostContext = () => useContext(PostContext)