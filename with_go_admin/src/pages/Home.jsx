import React, {useEffect} from 'react';
import {useNavigate} from "react-router-dom";

function Home(props) {
    const navigate = useNavigate();
    useEffect(() => {
        const res = sessionStorage.getItem("role");
        console.log(res);
        if (res === null) {
            navigate("/Login");
        }
    }, []);
    return (
        <>
            <div className="main">
                <div className="header">관리자 대시보드</div>

                <div className="card">
                    <h3>신규 가입회원</h3>
                    <table>
                        <thead>
                        <tr>
                            <th>회원아이디</th>
                            <th>이름</th>
                            <th>가입일</th>
                            <th>상태</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>admin</td>
                            <td>최고관리자</td>
                            <td>2025-04-01</td>
                            <td>활성</td>
                        </tr>
                        </tbody>
                    </table>
                    <div className="btn-container">
                        <button className="btn">회원 전체보기</button>
                    </div>
                </div>

                <div className="card">
                    <h3>최근 공지사항</h3>
                    <table>
                        <thead>
                        <tr>
                            <th>제목</th>
                            <th>작성자</th>
                            <th>작성일</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>서비스 점검 안내</td>
                            <td>운영팀</td>
                            <td>2025-03-31</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>


    );
}

export default Home;