import React, {use, useEffect, useState} from 'react';
import {Link, useNavigate} from "react-router-dom";

import '../css/Sidebar.css';

import logoWithgo from '../assets/Icon/logo_withgo.png';
import homeIcon from '../assets/Icon/home.png';
import backIcon from '../assets/Icon/back.png';
import profileIcon from '../assets/Icon/profile.png';
import {RightOutlined, LeftOutlined} from "@ant-design/icons";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint.js";
import {Button} from "antd";
import DriverList from "../pages/Driver/DriverList.jsx";
import DriverRegistration from "../pages/Driver/DriverRegistration.jsx";

function Sidebar(props) {
    const [openMenu, setOpenMenu] = useState(null); // 열려있는 메뉴 상태
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [emName, setEmName] = useState(null);
    const [emRole, setEmRole] = useState(null);
    const screens = useBreakpoint();
    const toggleMenu = (menu) => {
        setOpenMenu(openMenu === menu ? null : menu);
    };

    const boolSidebar = () => {
        !screens.md ? setSidebarOpen(false) : setSidebarOpen(true);
    }

    const logout = () => {
        sessionStorage.clear();
        window.location.replace("/login");
    }

    useEffect(() => {
        const resName = sessionStorage.getItem("name");
        const resRole = sessionStorage.getItem("role");
        setEmName(resName);
        setEmRole(resRole);

        if (screens.md) {
            setSidebarOpen(true);
        } else {
            setSidebarOpen(false);
        }
    }, [screens.md]);

    return (
        <>
            {emRole !== null && (
                <div className={`sidebar ${sidebarOpen ? 'open' : 'close'}`}>
                    <div className="sidebar-content">
                        <div className="sidebar-logo">
                            <img src={logoWithgo} alt="WITHGO 로고" className="logo-img"/>
                            <div className="menu-icons">
                                <Link to="/" className="icon-link" onClick={boolSidebar}>
                                    <img src={homeIcon} alt="홈으로" className="menu-icon"/>
                                </Link>
                                <a href="https://cjo3o.github.io/with_go/index.html" className="icon-link">
                                    <img src={backIcon} alt="뒤로가기" className="menu-icon"/>
                                </a>
                            </div>
                        </div>
                        {/*<div className="sidebar-title">*/}
                        {/*    <h2 className="menu-title">관리자 메뉴</h2>*/}

                        {/*</div>*/}
                        <div className="sidebar-footer">
                            <div className="footer-profile-row">
                                <div className="profile-left">
                                    <img src={profileIcon} alt="프로필" className="profile-icon"/>
                                    <div className="profile-label">{emRole}</div>
                                </div>
                                <div className="profile-right">
                                    <p className="profile-name">{emName} 님</p>
                                    <p className="profile-greeting">안녕하세요</p>
                                    <button className="logout-btn" onClick={logout}>로그아웃</button>
                                </div>
                            </div>
                        </div>
                        <ul>
                            {emRole === '관리자' && (
                                <li className="no-underline"
                                    onClick={boolSidebar}
                                >
                                    <Link to="/admin">관리자 메인</Link>
                                </li>
                            )}

                            <li>
                                <div onClick={() => toggleMenu('reservation')} className="menu-toggle">예약관리</div>
                                {openMenu === 'reservation' && (
                                    <div className="sub-menu">
                                        <ul>
                                            {emRole === '관리자' && (
                                                <li
                                                    onClick={boolSidebar}
                                                >
                                                    <Link to="/Reservation">배송/보관관리</Link>
                                                </li>
                                            )}
                                            <li
                                                onClick={boolSidebar}
                                            >
                                                <Link to="/ApplicationList">예약신청목록</Link>
                                            </li>
                                            {emRole === '관리자' && (
                                                <li
                                                    onClick={boolSidebar}
                                                >
                                                    <Link to="/NewReservationAddPage">신규예약등록</Link>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </li>

                            <li>
                                <div onClick={() => toggleMenu('user')} className="menu-toggle">회원관리</div>
                                {openMenu === 'user' && (
                                    <div className="sub-menu">
                                        <ul>
                                            <li
                                                onClick={boolSidebar}
                                            >
                                                <Link to="/Memberlist">회원목록</Link>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </li>

                            <li>
                                <div onClick={() => toggleMenu('driver')} className="menu-toggle">기사관리</div>
                                {openMenu === 'driver' && (
                                    <div className="sub-menu">
                                        <ul>
                                            <li
                                                onClick={boolSidebar}
                                            >
                                                <Link to="/Driverlist">기사목록</Link>
                                            </li>
                                            {emRole === '관리자' && (
                                                <li
                                                    onClick={boolSidebar}
                                                >
                                                    <Link to="/DriverRegistration">기사등록</Link>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </li>

                            <li>
                                <div onClick={() => toggleMenu('place')} className="menu-toggle">숙소/장소관리</div>
                                {openMenu === 'place' && (
                                    <div className="sub-menu">
                                        <ul>
                                            <li
                                                onClick={boolSidebar}
                                            >
                                                <Link to="/partner/list">제휴숙소</Link>
                                            </li>
                                            {emRole === '관리자' && (
                                                <li
                                                    onClick={boolSidebar}
                                                >
                                                    <Link to="/storage/list">보관장소</Link>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </li>
                            {emRole === '관리자' && (
                                <li>
                                    <div onClick={() => toggleMenu('feature')} className="menu-toggle">부가기능</div>
                                    {openMenu === 'feature' && (
                                        <div className="sub-menu">
                                            <ul>
                                                <li
                                                    onClick={boolSidebar}
                                                >
                                                    <Link to="/event/list">이벤트/프로모션관리</Link>
                                                </li>
                                                <li
                                                    onClick={boolSidebar}
                                                >
                                                    <Link to="/notice-promotion">공지사항관리</Link>
                                                </li>
                                                <li
                                                    onClick={boolSidebar}
                                                >
                                                    <Link to="/review">이용후기관리</Link>
                                                </li>
                                                <li
                                                    onClick={boolSidebar}
                                                >
                                                    <Link to="/faq/list">FAQ 관리</Link>
                                                </li>
                                                <li
                                                    onClick={boolSidebar}
                                                >
                                                    <Link to="/inquiry/list">1:1문의관리</Link>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </li>
                            )}

                            {emRole === '관리자' && (
                                <li>
                                    <div onClick={() => toggleMenu('role')} className="menu-toggle">권한설정</div>
                                    {openMenu === 'role' && (
                                        <div className="sub-menu">
                                            <ul>
                                                <li
                                                    onClick={boolSidebar}
                                                >
                                                    <Link to="/employee-list">직원목록</Link>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </li>
                            )}

                        </ul>

                    </div>
                    {
                        !screens.md && (
                            <div className="openSidebar"
                                 onClick={() => setSidebarOpen(!sidebarOpen)}>
                                {
                                    sidebarOpen ?
                                        <LeftOutlined/> :
                                        <RightOutlined/>
                                }
                            </div>
                        )
                    }
                </div>
            )}
        </>
    );
}

export default Sidebar;
