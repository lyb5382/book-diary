import React from 'react'
import './AdminFilter.scss'

// 🚨 1. (수정) props 이름을 'value'와 'onChange'로 통일
const AdminFilter = ({ value, onChange }) => {

    // 🚨 2. (수정) 부모의 onChange(setQuery)를 올바르게 호출하는 핸들러
    const handleChange = (e) => {
        const { name, value: inputValue } = e.target; // 🚨 'value' 변수명 충돌 방지

        // 🚨 3. (수정) 부모의 setQuery 함수에 '새로운 객체'를 전달합니다.
        // 'value'는 props로 받은 현재 query 객체입니다.
        onChange({
            ...value, // 🚨 기존 query 값 복사
            [name]: inputValue, // 🚨 변경된 값(q, status, user) 덮어쓰기
            page: 1, // 필터 변경 시 1페이지로 리셋
        });
    };

    return (
        <div className="admin-filter">
            {/* 4. 검색어 (q) */}
            <input
                type="text"
                name="q"
                placeholder="제목/내용 검색"
                value={value.q} // 🚨 value.q로 수정
                onChange={handleChange} // 🚨 handleChange로 수정
            />

            {/* 5. 상태 (status) */}
            <select
                name="status"
                value={value.status} // 🚨 value.status로 수정
                onChange={handleChange} // 🚨 handleChange로 수정
            >
                <option value="">averything</option>
                <option value="pending">pending</option>
                <option value="approved">approved</option>
                <option value="rejected">rejected</option>
                <option value="hidden">hidden</option>
            </select>

            {/* 6. 사용자 ID (user) */}
            <input
                type="text"
                name="user"
                placeholder="사용자 ID (선택)"
                value={value.user} // 🚨 value.user로 수정
                onChange={handleChange} // 🚨 handleChange로 수정
            />
        </div>
    )
}

export default AdminFilter