import React, { useEffect } from 'react'
import { replace, useNavigate } from 'react-router-dom'
import { saveAuthToStorage, fetchMe } from '../api/client'

const kakaoCallback = ({ onAuthed }) => {
    const navigate = useNavigate()
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const token = params.get('token')
        if (!token) {
            navigate('/admin/login?error=kakao', { replace: true })
            return
        }
        saveAuthToStorage({ token })
        const run = async () => {
            try {
                const me = await fetchMe()
                saveAuthToStorage({ user: me, token })
                onAuthed?.({ user: me, token })
                if (me.role === 'admin') navigate('/admin/dashboard', { replace: true })
                else navigate('/user/dashboard', { replace: true })
            } catch (err) {
                console.error('Kakao callback /me error:', err)
                navigate('/admin/login?error=kakao', { replace: true })
            }
        }
        run()
    }, [navigate, onAuthed]);
    return (
        <div>
            <p>카카오 로그인...</p>
        </div>
    )
}

export default kakaoCallback
