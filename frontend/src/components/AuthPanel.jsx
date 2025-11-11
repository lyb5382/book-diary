import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { BASE_URL } from '../api/client'
import './AuthPanel.scss'

const AuthPanel = ({ isAuthed, user, me, onFetchMe, onLogout, onAuthed, requiredRole }) => {
    const [mode, setMode] = useState('login')
    const [attemptInfo, setAttemptInfo] = useState({ attempts: null, remaining: null, locked: false })
    const [form, setForm] = useState({ email: '', password: '', displayName: '' })
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState('')
    const hasRequiredRole = !requiredRole || (user && user.role == requiredRole)
    const navigate = useNavigate()
    const isAdminPage = requiredRole === 'admin'
    const title = mode === 'login' ? '📜관리자 인증' : '🔮서약 등록'

    const handleKakaoLogin = () => {
        window.location.href = `${BASE_URL}/api/auth/kakao`
    }

    useEffect(() => {
        if (isAuthed) {
            if (isAdminPage) {
                if (hasRequiredRole) {
                    navigate('/admin/dashboard', { replace: true });
                } else {
                    navigate('/user/dashboard', { replace: true });
                }
            }
        }
    }, [isAuthed, user, isAdminPage, hasRequiredRole, navigate])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const submit = async (e) => {
        e.preventDefault()
        if (loading) return
        setErr('')
        setLoading(true)
        try {
            const payload = mode == 'register' ? {
                email: form.email.trim(),
                password: form.password.trim(),
                displayName: form.displayName.trim()
            } : {
                email: form.email.trim(),
                password: form.password.trim(),
            }
            const url = mode === 'register' ? '/api/auth/register' : '/api/auth/login'
            const { data } = await api.post(url, payload)
            setAttemptInfo({ attempts: null, remaining: null, locked: false })
            setErr('')
            onAuthed?.(data)
        } catch (error) {
            const d = error?.response?.data || {}
            const msg = error?.response?.data?.message || (mode === 'register' ? '회원가입 실패' : '로그인 실패')
            setAttemptInfo({
                attempts: typeof d.loginAttempts === 'number' ? d.loginAttempts : null,
                remaining: typeof d.remainingAttempts === 'number' ? d.remainingAttempts : null,
                locked: !!d.locked
            })
            setErr(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className='admin-wrap'>
            <div className="inner login">
                {!isAuthed && (
                    <div className="am-tabs grimoire-tabs">
                        <button type='button' className={mode === 'login' ? 'on' : ''} onClick={() => setMode('login')}>
                            로그인
                        </button>
                        <button type='button' onClick={() => setMode('register')} className={mode === 'register' ? 'on' : ''} >
                            회원가입
                        </button>
                    </div>
                )}

                <header className='admin-head'>
                    <h1 className='title'>{title}</h1>
                </header>

                <form className="auth-area pre-auth" onSubmit={submit}>
                    {!isAuthed ? (
                        <>
                            {mode === 'register' && (
                                <div className="input-group display-name-input">
                                    <label htmlFor="displayName">이름</label>
                                    <input
                                        type="text"
                                        id="displayName"
                                        name="displayName"
                                        placeholder="이름을 입력하시오"
                                        value={form.displayName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            )}

                            <div className="input-group email-input">
                                <label htmlFor="email">이메일</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="이메일을 입력하시오"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="input-group password-input">
                                <label htmlFor="password">비밀번호</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="비밀번호를 입력하시오"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn-grimoire-seal" disabled={loading || attemptInfo.locked}>
                                {loading && <span>인증중...</span>}
                            </button>
                        </>
                    ) : (
                        <div className="auth-area post-auth">
                            {user && (
                                <div className="auth-row">
                                    <span>Greetings, <b>{user?.displayName || user?.email}</b></span>
                                    <span className={`badge ${hasRequiredRole ? 'badge-ok' : 'badge-warn'}`}>
                                        {hasRequiredRole ? 'admin' : `권한없음: ${requiredRole} 필요`}
                                    </span>
                                    <div className="auth-actions">
                                        {hasRequiredRole && (
                                            <button type="button" className="btn" onClick={onFetchMe}>/me 호출</button>
                                        )}
                                        <button type="button" className="btn" onClick={onLogout}>로그아웃</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </form>

                <div className="social-login-area">
                    <button type="button" className="btn-kakao" onClick={handleKakaoLogin}>
                        <p>카카오 로그인</p>
                        <span>카카오로 {mode === 'login' ? '로그인' : '시작하기'}</span>
                    </button>
                </div>
                {!isAuthed && (
                    <div className="grimoire-messages">
                        {err && (
                            <div className={`am-msg ${attemptInfo.locked ? 'warn' : 'error'}`} role='alert'>
                                {err}
                            </div>
                        )}
                        {attemptInfo.locked ? (
                            <div className="am-msg warn">
                                로그인 시도 횟수 초과로 차단되었습니다.
                            </div>
                        ) : attemptInfo.attempts != null ? (
                            <div className='am-subtle'>
                                로그인 실패: {attemptInfo.attempts}/5
                                {typeof attemptInfo.remaining === 'number' && ` (남은 시도: ${attemptInfo.remaining})`}
                            </div>
                        ) : null}
                    </div>
                )}

                {isAuthed && !hasRequiredRole && (
                    <div className="alert alert-warn">
                        현재 계정에는 관리자 권한이 없습니다. 관리자 승인이 필요합니다.
                    </div>
                )}
                {me && (
                    <pre className="code">
                        {JSON.stringify(me, null, 2)}
                    </pre>
                )}
            </div>
        </section>
    )
}

export default AuthPanel