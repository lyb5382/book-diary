import React from 'react'
import { NavLink } from 'react-router-dom'
import './AdminNav.scss'

const AdminNav = () => {
    return (
        <nav className="admin-nav">
            <NavLink to={'/admin/dashboard'}>대시보드</NavLink>
            <NavLink to={'/admin/posts'}>게시글</NavLink>
            <NavLink to={'/admin/users'}>사용자</NavLink>
        </nav>
    )
}

export default AdminNav
