import React from 'react'

const AdminFilter = () => {
    return (
        <div>
            <input type="text" placeholder='검색' />
            <select name="status" id="">
                <option value="">전체</option>
                <option value="pending">대기</option>
                <option value="approved">승인</option>
                <option value="rejected">거절</option>
                <option value="hidden">숨김</option>
            </select>
            <input type="text" placeholder='유저 선택' />
        </div>
    )
}

export default AdminFilter
