import React from 'react'
import { formatYMD } from '../util/formatYMD'

const AdminPostsList = ({ items = [] }) => {
    return (
        <section className='posts-table'>
            <div className='inner adminpostlist'>
                <header>
                    <table>
                        <thead>
                            <tr>
                                <th>제목</th>
                                <th>상태</th>
                                <th>파일 URL</th>
                                <th>수정일</th>
                                <th>작업</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length > 0 ? (
                                items.map(items => (
                                    <tr key={items._id}>
                                        <td className="items-title" onClick={() => handleitemsClick(items)}>
                                            {items.title}
                                        </td>
                                        <td>
                                            <span className={`status-badge status-${items.status || 'pending'}`}>
                                                {items.status || 'pending'}
                                            </span>
                                        </td>
                                        <td>
                                            {items.fileUrl && items.fileUrl.length > 0 ? (
                                                <a href={items.fileUrl[0]} target="_blank" rel="noopener noreferrer">보기</a>
                                            ) : ('없음')}
                                        </td>
                                        <td>
                                            {new Date(items.updatedAt || items.createdAt).toLocaleString('ko-KR')}
                                        </td>
                                        <td>
                                            <button className="btn-action edit" onClick={() => handleEdit(items)}>수정</button>
                                            <button className="btn-action delete" onClick={() => handleDelete(items)}>삭제</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5">표시할 게시물이 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </header>
            </div>
        </section>
    )
}

export default AdminPostsList