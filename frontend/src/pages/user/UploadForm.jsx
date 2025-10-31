import React, { useRef, useState } from 'react'
import { X, UploadCloud, RotateCw } from 'lucide-react';
import './UploadForm.scss'

const UploadForm = ({ onUploaded, initail, onClose }) => {
    const [form, setForm] = useState({
        title: initail?.title ?? '',
        content: initail?.content ?? '',
        file: null,
        preview: initail?.fileUrl?.[0] ?? null
    })
    const [uploading, setUploading] = useState(false)
    const panelRef = useRef(null)

    const handlefilechange = (e) => {
        const file = e.target.files?.[0]
        if (!file) {
            if (form.preview && form.file) URL.revokeObjectURL(form.preview)
            setForm((prev) => ({ ...prev, file: null, preview: null }))
            return
        }
        if (form.preview) URL.revokeObjectURL(form.preview)
        const previewUrl = URL.createObjectURL(file)
        setForm((prev) => ({ ...prev, file, preview: previewUrl }))
    }
    const handlesubmit = async (e) => {
        e.preventDefault()
        if (!form.title.trim()) {
            console.warn('title empty')
            alert('제목 입력')
            return
        }
        if (uploading) return
        try {
            setUploading(true)

            // 🚨 1. (핵심) 필요한 키 값들을 추출
            const id = initail?._id; // 수정 모드 (게시물 ID)
            const oldKeyToReplace = initail?.fileUrl?.[0] || null; // 기존 S3 키 (replaceKey용)
            let keyToUseInDB = null; // DB에 보존할 키

            // 2. 파일 유지 명령 설정: 새 파일이 없고 기존 파일이 있으면 기존 키를 DB에 유지합니다.
            if (!form.file && initail?.fileUrl) {
                keyToUseInDB = initail.fileUrl[0];
            }

            // 🚨 3. (수정) onUploaded에 모든 인자를 포함하여 호출
            await onUploaded?.({
                id: id, // 수정/생성 분기용 ID
                title: form.title.trim(),
                content: form.content.trim(),
                file: form.file, // 새 파일 객체 (S3 업로드용)
                replaceKey: oldKeyToReplace, // 기존 S3 키 (S3 삭제/교체 명령용)
                currentKey: keyToUseInDB // DB 보존용 키 (파일 미변경 시)
            })

            if (form.preview) URL.revokeObjectURL(form.preview)
            setForm({ title: '', content: '', file: null, preview: null })
            onClose?.()
        } catch (error) {
            console.error('submit error', error)
            alert('업로드/수정 중 오류가 발생했습니다.');
        } finally {
            setUploading(false)
        }
    }

    return (
        <section className='am-backdrop'>
            <form ref={panelRef} onSubmit={handlesubmit} className="am-panel Upload-form">
                <header>
                    <h2>file upload</h2>
                    <p className="sub">book & diary</p>
                </header>
                <div className="form-grid">
                    <div className="field">
                        <label htmlFor="title">title</label>
                        <input id='title' value={form.title} name='title' type="text" placeholder='제목 입력' onChange={(e) => { setForm((prev) => ({ ...prev, title: e.target.value })) }} />
                    </div>
                    <div className="field">
                        <label htmlFor="content">content</label>
                        <textarea id='content' value={form.content} name='content' placeholder='내용 입력' rows={3} onChange={(e) => { setForm((prev) => ({ ...prev, content: e.target.value })) }} ></textarea>
                    </div>
                    <div className="field">
                        <div className="file-row">
                            <input accept='image/*' name='file' type="file" onChange={handlefilechange} />
                            {form.preview && (
                                <div className='preview-warp'>
                                    <img src={form.preview} alt="미리보기" className='preview-thumb' />
                                    <p className='file-name'>{form.file?.name}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="actions">
                    <button type='button' className="btn ghost" onClick={onClose} disabled={uploading} aria-label="취소">
                        <X size={18} />
                    </button>
                    <button type='submit' disabled={uploading} className="btn primary" aria-label="제출">
                        {uploading ? <RotateCw size={18} className="animate-spin" /> : <UploadCloud size={18} />}
                    </button>
                </div>
            </form>
        </section>
    )
}

export default UploadForm