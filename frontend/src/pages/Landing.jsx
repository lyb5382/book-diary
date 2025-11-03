import React from 'react'
import { Link } from 'react-router-dom'
import './Landing.scss'

const Landing = () => {
    return (
        <section className="landing">
            <div className="container">
                <div className="landing-hero">
                    <h1>📜 Book Diary</h1>
                    <p className="landing-sub">모든 기록을 수집하고, 분류하며, 공유하는 당신만의 서재</p>
                    <Link to="/admin/login" className="btn btn-primary">시작하기</Link>
                </div>
                <ul className="landing-features">
                    <li>
                        <h3>찰나의 감상</h3>
                        <p>스쳐가는 영감을 한 줄의 문장으로 서재에 기록하세요.</p>
                    </li>
                    <li>
                        <h3>기억의 색인</h3>
                        <p>수많은 기록 속, 원하는 감상을 #태그로 즉시 찾아내세요.</p>
                    </li>
                    <li>
                        <h3>감상의 전달</h3>
                        <p>간직하고픈 문장을 가벼운 링크로 공유하세요.</p>
                    </li>
                </ul>
            </div>
        </section>
    )
}

export default Landing
