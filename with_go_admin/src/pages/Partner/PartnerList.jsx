import React, {useEffect, useState} from 'react';
import supabase from "../../lib/supabase.js";
import "../../css/PlaceList.css"
import {Checkbox, Image, message, Input} from "antd";
import {useNavigate} from 'react-router-dom';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAnglesLeft, faAnglesRight, faChevronLeft, faChevronRight} from "@fortawesome/free-solid-svg-icons";
import {CloseOutlined, SearchOutlined} from "@ant-design/icons";

function PartnerList() {
    const [partners, setPartners] = useState([]);
    const [selectedPartners, setSelectedPartners] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPartners, setFilteredPartners] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isAllChecked, setIsAllChecked] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const itemsPerPage = 4;
    const totalPages = Math.ceil(filteredPartners.length / itemsPerPage);
    const groupSize = 10;
    const currentGroup = Math.floor((currentPage - 1) / groupSize);
    const startPage = currentGroup * groupSize + 1;
    const endPage = Math.min(startPage + groupSize - 1, totalPages);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPartners.slice(indexOfFirstItem, indexOfLastItem);

    const navigate = useNavigate();

    const openModal = (content) => {
        setModalContent(content);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setModalContent(null);
        setIsModalOpen(false);
    };

    // 데이터 불러오기
    const fetchPartners = async () => {
        const {data, error} = await supabase
            .from('partner_place')
            .select('*')
            .order('created_at', {ascending: false});

        if (error) {
            console.error('제휴숙소 조회 오류:', error);
        } else {
            setPartners(data);
        }
    };


// 1. 초기 데이터 로딩
    useEffect(() => {
        fetchPartners();
    }, []);

// 2. 검색어 변경되거나 partners 업데이트될 때 필터링
    useEffect(() => {
        if (!searchTerm) {
            setFilteredPartners(partners);
        } else {
            const lowerSearch = searchTerm.toLowerCase();
            const filtered = partners.filter(partner =>
                partner.name.toLowerCase().includes(lowerSearch) ||
                partner.address.toLowerCase().includes(lowerSearch) ||
                partner.phone.toLowerCase().includes(lowerSearch)
            );
            setFilteredPartners(filtered);
        }
    }, [searchTerm, partners]);

    const handleSearch = (value) => {
        setSearchTerm(value);
        handlePageChange(1);
    };

    const handlePageChange = (pageNum) => {
        setCurrentPage(pageNum);
        setSelectedPartners([]);
        setIsAllChecked(false);
    };

    // 체크박스 전체 선택
    const handleAllPartnerCheck = (e) => {
        const checked = e.target.checked;
        setIsAllChecked(checked);

        if (checked) {
            setSelectedPartners(currentItems.map((partner) => partner.partner_id));
        } else {
            setSelectedPartners((prev) =>
                prev.filter((id) => !currentItems.some((partner) => partner.partner_id === id))
            );
        }
    };


    // 체크박스 개별 선택
    const handlePartnerCheck = (e, partnerId) => {
        const checked = e.target.checked;
        if (checked) {
            setSelectedPartners((prev) => {
                const newSelected = [...prev, partnerId];
                return newSelected.filter(id => currentItems.some(partner => partner.partner_id === id));
            });
        } else {
            setSelectedPartners((prev) => prev.filter((id) => id !== partnerId));
        }
    };

    // 선택 삭제
    const handleBulkDelete = async () => {
        const res = sessionStorage.getItem("role");
        if (res !== '관리자') {
            message.error('권한이 없습니다!');
            return;
        }
        if (!window.confirm('선택한 숙소를 삭제하시겠습니까?')) return;

        try {
            const {error} = await supabase
                .from('partner_place')
                .delete()
                .in('partner_id', selectedPartners);

            if (error) {
                alert("삭제 중 오류가 발생했습니다.");
                return;
            }

            setPartners(
                partners.filter((partner) => !selectedPartners.includes(partner.partner_id))
            );
            setSelectedPartners([]);
            fetchPartners();
            alert('선택한 숙소가 삭제되었습니다');
        } catch (err) {
            console.error(err);
            alert("삭제 중 오류가 발생했습니다.");
        }
    };

    const goToFirstGroup = () => handlePageChange(1);
    const goToPrevPage = () => handlePageChange(Math.max(currentPage - 1, 1));
    const goToNextPage = () => handlePageChange(Math.min(currentPage + 1, totalPages));
    const goToNextGroup = () => {
        const nextGroupPage = Math.min(endPage + 1, totalPages);
        if (nextGroupPage > currentPage) handlePageChange(nextGroupPage);
    };

    useEffect(() => {
        setIsAllChecked(
            currentItems.length > 0 && currentItems.every((partner) => selectedPartners.includes(partner.partner_id))
        );
    }, [currentItems, selectedPartners]);

    return (
        <>
            <div className='main'>
                <div className='header'>제휴숙소관리</div>

                <div className='card'>
                    <div className='middle'>
                        <div className='middle-left'>
                            <h3 style={{marginBottom: 0}}>제휴숙소목록</h3>
                            <Checkbox onChange={handleAllPartnerCheck} checked={isAllChecked}/>
                        </div>
                        <div className='middle-right'>
                            <div className="middle-actions"
                                 style={{display: 'flex', alignContent: 'center', gap: '10px'}}>
                                <div className='placeList_Search'>
                                    <Input.Search
                                        placeholder="제휴숙소 검색"
                                        allowClear
                                        enterButton={<span><SearchOutlined style={{marginRight: 4}}/>검색</span>}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onSearch={handleSearch}
                                        className="search-input default-style"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-container">
                        {currentItems.map((partner) => (
                            <div className="place-card" key={partner.partner_id}>
                                <div className="card-top">
                                    <div className='card-top-left'>
                                        <Checkbox
                                            checked={selectedPartners.includes(partner.partner_id)}
                                            onChange={(e) => handlePartnerCheck(e, partner.partner_id)}
                                        />
                                        <span>ID : {partner.partner_id}</span>
                                    </div>
                                    <div className="card-top-right">
                                        <button
                                            className="btn_P btn-edit"
                                            onClick={() => {
                                                const res = sessionStorage.getItem("role")
                                                if (res !== '관리자') {
                                                    message.error('권한이 없습니다!')
                                                    return;
                                                }
                                                navigate(`/partner/create/${partner.partner_id}`)
                                            }}
                                        >
                                            수정
                                        </button>
                                    </div>
                                </div>

                                <div className="card-content">
                                    <div className='card-content-text'>
                                        <p className='strong'><strong>숙소명</strong></p>
                                        <p className='content-txt'>{partner.name}</p>
                                    </div>


                                    <div className='card-content-text'>
                                        <p className='strong'><strong>주 소</strong></p>
                                        <p className='content-txt place-add'>{partner.address}</p>
                                    </div>


                                    <div className='card-content-text'>
                                        <p className='strong'><strong>연락처</strong></p>
                                        <p className='content-txt'>{partner.phone}</p>
                                    </div>

                                    <div className="card-image">
                                        <Image
                                            src={partner.image || 'error'}
                                            alt="제휴숙소 이미지"
                                            width="100%"
                                            height={150}
                                            style={{objectFit: 'cover', borderRadius: '6px'}}
                                            fallback="data:image/png;base64,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iAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg=="
                                        />
                                    </div>

                                    <div className="card-map">
                                        {partner.map_url ? (
                                            <div className="map-hover-wrapper"
                                                onClick={() =>
                                                openModal(
                                                    <iframe
                                                        src={partner.map_url.match(/src="([^"]+)"/)?.[1] || partner.map_url}
                                                        width="800vw"
                                                        height="600vh"
                                                        style={{border: 'none'}}
                                                        allowFullScreen=""
                                                        loading="lazy"
                                                        referrerPolicy="no-referrer-when-downgrade"
                                                        title="지도"
                                                    ></iframe>
                                                )}>
                                                <div className="map-overlay">👁 Preview</div>
                                                <iframe
                                                    src={partner.map_url.match(/src="([^"]+)"/)?.[1] || partner.map_url}
                                                    width="100%"
                                                    height="150"
                                                    style={{border: 'none', pointerEvents: 'none'}}
                                                    allowFullScreen=""
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                    title="지도"
                                                ></iframe>
                                            </div>
                                        ) : (
                                            '지도 없음'
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="table-footer bottom-right-btn">
                        {selectedPartners.length > 0 && (
                            <button className="btn btn-delete" onClick={handleBulkDelete}>
                                선택 삭제 ({selectedPartners.length})
                            </button>
                        )}
                        <button
                            className="btn btn-add-confirm"
                            onClick={() => {
                                const checkRole = sessionStorage.getItem('role');
                                if (checkRole === '관리자') {
                                    navigate("/partner/create");
                                } else {
                                    message.error('권한이 없습니다!');
                                }
                            }}
                        >
                            새 제휴숙소 등록
                        </button>
                    </div>
                    {/* 페이지네이션 */}
                    <div className="pagination" style={{marginTop: '30px'}}>
                        <button className="group-btn" onClick={goToFirstGroup} disabled={currentGroup === 0}>
                            <FontAwesomeIcon icon={faAnglesLeft}/>
                        </button>
                        <button className="arrow-btn" onClick={goToPrevPage} disabled={currentPage === 1}>
                            <FontAwesomeIcon icon={faChevronLeft}/>
                        </button>

                        <div className="page-btns">
                            {Array.from({length: endPage - startPage + 1}).map((_, i) => {
                                const pageNum = startPage + i;
                                return (
                                    <button
                                        key={pageNum}
                                        className={`page-btn ${pageNum === currentPage ? 'active' : ''}`}
                                        onClick={() => handlePageChange(pageNum)}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button className="arrow-btn" onClick={goToNextPage} disabled={currentPage === totalPages}>
                            <FontAwesomeIcon icon={faChevronRight}/>
                        </button>
                        <button className="group-btn" onClick={goToNextGroup} disabled={endPage === totalPages}>
                            <FontAwesomeIcon icon={faAnglesRight}/>
                        </button>
                    </div>
                </div>

            </div>
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeModal}><CloseOutlined/></button>
                        {modalContent}
                    </div>
                </div>
            )}
        </>
    );
}

export default PartnerList;