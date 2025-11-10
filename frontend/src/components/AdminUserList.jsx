import React from 'react'
import { formatYMD } from '../util/formatYMD'
import './AdminUserList.scss' // 🚨 SCSS 파일 import

// 🚨 1. (수정) props로 items, onChangeLock, onChangeRole을 받습니다.
const AdminUserList = ({ items = [], onChangeLock, onChangeRole }) => {
    return (
        <div className="admin-list-container">
            {/* 🚨 2. (수정) <ul> -> <table>로 변경 */}
            <table className="admin-list">
                {/* 3. (수정) <li> -> <thead>/<tr>/<th>로 변경 */}
                <thead>
                    <tr>
                        <th>#</th>
                        <th>ID</th> 
                        <th>이메일</th>
                        <th>닉네임</th>
                        <th>권한</th>
                        <th>상태</th>
                        <th>가입일</th>
                        <th>작업</th>
                    </tr>
                </thead>
                {/* 4. (신규) <tbody> 추가 */}
                <tbody>
                    {items.length > 0 ? (
                        // 5. (수정) <li> -> <tr>로 변경
                        items.map((it, i) => (
                            <tr key={it._id}>
                                {/* 6. (수정) <span> -> <td>로 변경 */}
                                <td>{i + 1}</td>
                                <td className="user-id">{it._id}</td>
                                <td>{it.email}</td>
                                <td>{it.displayName ?? "-"}</td>
                                <td>{it.role}</td>
                                <td>
                                    <span className={`status-badge status-${it.isActive ? 'approved' : 'rejected'}`}>
                                        {it.isActive ? "활성" : "비활성"}
                                    </span>
                                </td>
                                <td>{it.createdAt ? formatYMD(it.createdAt) : ""}</td>
                                <td>
                                    <div className="list-actions">
                                        <button className="btn btn-action role" onClick={() => onChangeRole(it._id, it.role)}>
                                            {it.role === 'admin' ? "관리자 해제" : "관리자 지정"}
                                        </button>
                                        <button className="btn btn-action lock" onClick={() => onChangeLock(it._id, it.isActive)}>
                                            {it.isActive ? "비활성화" : "활성화"}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        // 7. (수정) <li className="no-data"> -> <tr><td colSpan="7">
                        <tr className="no-data">
                            <td colSpan="7">사용자 데이터가 없습니다.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AdminUserList;