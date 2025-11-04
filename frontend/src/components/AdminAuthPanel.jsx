import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import './AuthPanel.scss' // 유저용과 동일한 SCSS 파일을 재사용합니다.

/**
 * 어드민 전용 인증 패널입니다.
 * AuthPanel과 레이아웃을 공유하나, '로그인' 기능만 제공합니다.
 *
 * @param {object} props
 * @param {boolean} props.isAuthed - 현재 인증 여부
 * @param {object} props.user - 현재 유저 객체
 * @param {object} props.me - /me API 응답 (디버그용)
 * @param {function} props.onFetchMe - /me API 호출 함수
 * @param {function} props.onLogout - 로그아웃 처리 함수
 * @param {function} props.onAuthed - 인증 성공 시 콜백
 * @param {string} props.requiredRole - (필수) 'admin'을 전달받습니다.
 */
const AdminAuthPanel = ({ isAuthed, user, me, onFetchMe, onLogout, onAuthed, requiredRole }) => {
    // [수정] 어드민 패널은 'login' 모드 고정입니다.
    const mode = 'login'
    const [attemptInfo, setAttemptInfo] = useState({ attempts: null, remaining: null, locked: false })
    // [수정] 회원가입용 displayName 필드 제거
    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState('')

    const hasRequiredRole = !requiredRole || (user && user.role === requiredRole)
    const navigate = useNavigate()
    const isAdminPage = requiredRole === 'admin'

    // [수정] 타이틀 고정
    const title = '📜 관리자 인증'

    // 인증 후 리다이렉트 로직 (AuthPanel과 동일)
    useEffect(() => {
        if (isAuthed) {
            if (isAdminPage) {
                if (hasRequiredRole) {
                    navigate('/admin/dashboard', { replace: true });
                } else {
                    // (엣지 케이스) 관리자 페이지에서 로그인했으나 권한이 없는 경우
                    navigate('/user/dashboard', { replace: true });
                }
            }
        }
    }, [isAuthed, user, isAdminPage, hasRequiredRole, navigate])

    // 폼 입력 핸들러 (AuthPanel과 동일)
    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    // 폼 제출 핸들러
    const submit = async (e) => {
        e.preventDefault()
        if (loading) return
        setErr('')
        setLoading(true)
        try {
            // [수정] 로그인 전용 페이로드
            const payload = {
                email: form.email.trim(),
                password: form.password.trim(),
            }
            // [수정] 로그인 전용 URL
            const url = '/api/auth/login'
            const { data } = await api.post(url, payload)

            setAttemptInfo({ attempts: null, remaining: null, locked: false })
            setErr('')
            onAuthed?.(data)
        } catch (error) {
            const d = error?.response?.data || {}
            // [수정] 로그인 전용 에러 메시지
            const msg = error?.response?.data?.message || '로그인 실패'
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
        // 레이아웃 구조는 AuthPanel과 동일하게 유지
        <section className='admin-wrap'>
            <div className="inner login">

                {/* [제거] 로그인/회원가입 탭 제거 */}

                <header className='admin-head'>
                    <h1 className='title'>{title}</h1>
                </header>

                <form className="auth-area pre-auth" onSubmit={submit}>
                    {!isAuthed ? (
                        <>
                            {/* [제거] 회원가입용 displayName 입력창 제거 */}

                            <div className="input-group email-input">
                                <label htmlFor="email">Incantation of Name (Email)</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Enter your email..."
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="input-group password-input">
                                <label htmlFor="password">Verbal Component (Password)</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="Enter your secret word..."
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn-grimoire-seal" disabled={loading || attemptInfo.locked}>
                                {loading ? <span>인증중...</span> : <span>인증</span>}
                            </button>
                        </>
                    ) : (
                        // 인증 후 UI (AuthPanel과 동일)
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

                {/* 에러 메시지 UI (AuthPanel과 동일) */}
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

                {/* 권한 경고 UI (AuthPanel과 동일) */}
                {isAuthed && !hasRequiredRole && (
                    <div className="alert alert-warn">
                        현재 계정에는 관리자 권한이 없습니다. 관리자 승인이 필요합니다.
                    </div>
                )}

                {/* /me 디버그 UI (AuthPanel과 동일) */}
                {me && (
                    <pre className="code">
                        {JSON.stringify(me, null, 2)}
                    </pre>
                )}
            </div>
        </section>
    )
}

export default AdminAuthPanel