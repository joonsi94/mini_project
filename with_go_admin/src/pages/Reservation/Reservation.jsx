import React, {useEffect, useState} from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronLeft} from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import {faChevronRight} from "@fortawesome/free-solid-svg-icons/faChevronRight";
import luggage2 from "../../assets/Images/luggage02.png"
import luggage1 from "../../assets/Images/luggage01.png"
import FloatingBtn from "../../components/ExcelDownload.jsx";
import ExcelTable from "../../components/ExcelTable.jsx";
import {Button, DatePicker, Select, Input, message, Card} from "antd";
import dayjs from 'dayjs';
import supabase from "../../lib/supabase.js";
import * as XLSX from 'xlsx';
import {saveAs} from 'file-saver';

import('../../css/Reservation.css')

function Reservation() {
    const [showCheckbox, setShowCheckbox] = useState(false);
    const [storageCount, setStorageCount] = useState(0);
    const [deliveryCount, setDeliveryCount] = useState(0);
    const [searchField, setSearchField] = useState('name'); // 기본값: 예약자명
    const [searchKeyword, setSearchKeyword] = useState('');
    const [combinedData, setCombinedData] = useState([]);
    const [sortOption, setSortOption] = useState('recent');
    const [statusCount, setStatusCount] = useState({
        처리완료: 0,
        취소: 0,
        미배정: 0
    });

    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
    const [showDatePicker, setShowDatePicker] = useState(false);


    const handlePrevDate = () => {
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() - 1);
            return newDate.toISOString().split('T')[0];
        });
    };

    const handleNextDate = () => {
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + 1);
            return newDate.toISOString().split('T')[0];
        });
    };

    const handleToday = () => {
        const today = new Date().toISOString().split('T')[0];
        setSelectedDate(today);
    };


    const handleShowCheckbox = () => {
        setShowCheckbox(!showCheckbox);
    };

    const fetchReservationCounts = async (targetDate) => {
        const {count: storage, error: storageError} = await supabase
            .from('storage')
            .select('*', {count: 'exact', head: true})
            .eq('storage_start_date', targetDate); // ✅ 날짜 필터

        const {count: delivery, error: deliveryError} = await supabase
            .from('delivery')
            .select('*', {count: 'exact', head: true})
            .eq('delivery_date', targetDate); // ✅ 날짜 필터

        if (storageError || deliveryError) {
            console.error('예약 개수 불러오기 오류:', storageError || deliveryError);
            return;
        }

        setStorageCount(storage || 0);
        setDeliveryCount(delivery || 0);
    };

    useEffect(() => {
        if (selectedDate) {
            fetchReservationCounts(selectedDate);
        }
    }, [selectedDate]);

    const handleSearch = async () => {
        if (!searchKeyword.trim()) return;

        const filters = [
            supabase.from('storage').select('*')
                .ilike(searchField, `%${searchKeyword}%`), // LIKE 검색
            supabase.from('delivery').select('*')
                .ilike(searchField, `%${searchKeyword}%`),
        ];

        const [storageRes, deliveryRes] = await Promise.all(filters);

        const storageData = (storageRes.data || []).map(item => ({
            ...item,
            division: '보관',
            reservationTime: item.storage_start_date,
            section: '-',
            luggageNumber: `소 ${item.small} / 중 ${item.medium} / 대 ${item.large}`,
            reservationName: item.name,
            reservationPhone: item.phone,
            date: item.reservation_time.slice(0,10),
            driver: '-',
            processingStatus: item.situation,
            key: `storage-${item.reservation_number}`,
            id: item.reservation_number,
        }));

        const deliveryData = (deliveryRes.data || []).map(item => ({
            ...item,
            division: '배송',
            reservationTime: item.delivery_date,
            section: `${item.delivery_start} → ${item.delivery_arrive}`,
            luggageNumber: `under ${item.small || 0} / over ${item.large || 0}`,
            reservationName: item.name,
            reservationPhone: item.phone,
            date: item.reserve_time.slice(0,10),
            driver: item.driver || '-',
            processingStatus: item.situation,
            key: `delivery-${item.re_num}`,
            id: item.re_num,
        }));

        const result = [...storageData, ...deliveryData];

        if (result.length === 0) {
            message.warning('검색 결과가 없습니다', 2.5);
        }

        setCombinedData([...storageData, ...deliveryData]);
    };

    const fetchStatusCounts = async (targetDate) => {
        const conditions = ['처리완료', '취소', '미배정'];
        const newCounts = {처리완료: 0, 취소: 0, 미배정: 0};

        for (let status of conditions) {
            const [storageRes, deliveryRes] = await Promise.all([
                supabase.from('storage')
                    .select('*', {count: 'exact', head: true})
                    .eq('situation', status)
                    .eq('storage_start_date', targetDate),

                supabase.from('delivery')
                    .select('*', {count: 'exact', head: true})
                    .eq('situation', status)
                    .eq('delivery_date', targetDate),
            ]);

            const storageCount = storageRes.count || 0;
            const deliveryCount = deliveryRes.count || 0;
            newCounts[status] = storageCount + deliveryCount;
        }

        setStatusCount(newCounts);
    };

    useEffect(() => {
        if (selectedDate) {
            fetchStatusCounts(selectedDate);
        }
    }, [selectedDate]);

    const [sortedData, setSortedData] = useState([]);

    useEffect(() => {
        if (combinedData.length === 0) return;

        let sorted = [...combinedData];

        if (sortOption === 'recent') {
            sorted.sort((a, b) => new Date(b.date) - new Date(a.date)); // 최신순
        } else if (sortOption === 'driver') {
            sorted.sort((a, b) => (a.driver || '').localeCompare(b.driver || ''));
        }

        setSortedData(sorted);
    }, [combinedData, sortOption]);

    const handleExcelDownload = () => {
        if (!combinedData || combinedData.length === 0) {
            message.warning("다운로드할 데이터가 없습니다.");
            return;
        }

        // 컬럼 순서 및 정렬된 데이터 사용 (정렬은 sortedData가 필요하면 여기에 변경 가능)
        const formatSheet = (data) =>
            data.map((row, index) => ({
                번호: index + 1,
                구분: row.division,
                예약시간: row.reservationTime,
                이용구간: row.section,
                짐갯수: row.luggageNumber,
                예약자명: row.reservationName,
                연락처: row.reservationPhone,
                신청일자: row.date,
                배정기사: row.driver,
                처리현황: row.processingStatus
            }));

        const workbook = XLSX.utils.book_new();

        // 각 시트 생성
        const createSheetWithStyle = (name, rawData) => {
            if (rawData.length === 0) return;

            const formatted = formatSheet(rawData);
            const worksheet = XLSX.utils.json_to_sheet(formatted);

            // ✅ 머리글 bold + 자동 너비
            const headerKeys = Object.keys(formatted[0]);
            const range = XLSX.utils.decode_range(worksheet['!ref']);

            // 컬럼 너비 자동 계산
            worksheet['!cols'] = headerKeys.map(key => ({
                wch: Math.max(
                    key.length,
                    ...formatted.map(row => String(row[key] || '').length)
                ) + 2 // 약간의 padding
            }));

            // 머리글 스타일 (bold는 SheetJS 스타일 확장 사용 필요, 브라우저에선 기본 제한 있음)
            headerKeys.forEach((_, i) => {
                const cellRef = XLSX.utils.encode_cell({r: 0, c: i});
                if (worksheet[cellRef]) {
                    worksheet[cellRef].s = {
                        font: {bold: true}
                    };
                }
            });

            XLSX.utils.book_append_sheet(workbook, worksheet, name);
        };

        const storageData = combinedData.filter(item => item.division === '보관');
        const deliveryData = combinedData.filter(item => item.division === '배송');

        createSheetWithStyle('보관', storageData);
        createSheetWithStyle('배송', deliveryData);

        if (workbook.SheetNames.length === 0) {
            message.warning("시트에 포함된 데이터가 없습니다.");
            return;
        }

        const excelBuffer = XLSX.write(workbook, {bookType: 'xlsx', type: 'array'});
        const blob = new Blob([excelBuffer], {type: 'application/octet-stream'});

        saveAs(blob, '위드고_예약자명단.xlsx');
        message.success('엑셀 다운로드가 완료되었습니다 ✅', 2.5);
    };

    useEffect(() => {
        const fetchAllData = async () => {
            const [storageRes, deliveryRes] = await Promise.all([
                supabase.from('storage').select('*'),
                supabase.from('delivery').select('*')
            ]);

            const storageData = (storageRes.data || []).map(item => ({
                ...item,
                division: '보관',
                reservationTime: `${item.storage_start_date} ~ ${item.storage_end_date}`,
                section: '-',
                luggageNumber: `소 ${item.small} / 중 ${item.medium} / 대 ${item.large}`,
                reservationName: item.name,
                reservationPhone: item.phone,
                date: item.reservation_time.slice(0,10),
                driver: '-',
                processingStatus: item.situation,
                key: `storage-${item.reservation_number}`,
                id: item.reservation_number,
            }));

            const deliveryData = (deliveryRes.data || []).map(item => ({
                ...item,
                division: '배송',
                reservationTime: item.delivery_date,
                section: `${item.delivery_start} → ${item.delivery_arrive}`,
                luggageNumber: `under ${item.small || 0} / over ${item.large || 0}`,
                reservationName: item.name,
                reservationPhone: item.phone,
                date: item.reserve_time.slice(0,10),
                driver: item.driver || '-',
                processingStatus: item.situation,
                key: `delivery-${item.re_num}`,
                id: item.re_num,
            }));

            setCombinedData([...storageData, ...deliveryData]);
        };

        fetchAllData();
    }, []);

    return (
        <div className="main" id="main">
            <div className="header">
                예약관리
            </div>
            <div className="card">
                <div className="title">금일배송 / 보관 관리</div>
                <div className="content_R">
                    <div
                        className="content_first"
                        style={{display: "flex", justifyContent: "center", alignItems: "center", gap: "10px"}}
                    >
                        <Button onClick={handlePrevDate} className="button">
                            <FontAwesomeIcon icon={faChevronLeft}/>
                        </Button>

                        <h2
                            style={{cursor: "pointer", margin: 0}}
                            onClick={() => setShowDatePicker(true)}
                        >
                            {new Date(selectedDate).toLocaleDateString('ko-KR')}
                            {showDatePicker && (
                                <DatePicker
                                    open
                                    defaultValue={dayjs(selectedDate)}
                                    onChange={(date, dateString) => {
                                        setSelectedDate(dateString);
                                        setShowDatePicker(false);
                                    }}
                                    onOpenChange={(open) => {
                                        if (!open) setShowDatePicker(false);
                                    }}
                                    style={{
                                        position: 'absolute',
                                        zIndex: 1000,
                                        width: 0,
                                        height: 0,
                                        opacity: 0,
                                        pointerEvents: 'none',
                                    }}
                                    popupStyle={{
                                        top: '260px',
                                        left: '800px',
                                        zIndex: 1500
                                    }}
                                />
                            )}
                        </h2>

                        <Button onClick={handleNextDate} className="button">
                            <FontAwesomeIcon icon={faChevronRight}/>
                        </Button>
                    </div>

                </div>
                <div className="content_R">
                    <div className="content_second">
                        <h2>전체 예약건수</h2>
                        <h1>{storageCount + deliveryCount} 건</h1>
                    </div>
                    <div className="content_second_one">
                        <div className="content_aa">
                            <img src={luggage2} alt="배송캐리어" style={{marginLeft: "30px"}}/>
                            <div>
                                <h2>배송예약</h2>
                                <h1>{deliveryCount}건</h1>
                            </div>
                            <img src={luggage1} alt="보관캐리어"/>
                            <div>
                                <h2>보관예약</h2>
                                <h1>{storageCount}건</h1>
                            </div>
                        </div>
                        <div className="border-right"></div>
                        <div className="border-left">
                            <div>
                                <h3 className="complete">처리완료</h3>
                                <h1>{statusCount.처리완료}건</h1>
                            </div>
                            <div>
                                <h3 className="cancel">취소</h3>
                                <h1>{statusCount.취소}건</h1>
                            </div>
                            <div>
                                <h3 className="not-yet" style={{color: '#f60707'}}>미배정</h3>
                                <h1>{statusCount.미배정}건</h1>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="content_middle">
                    <div className="content_middle_one">
                        <Button className="button-more" onClick={handleShowCheckbox}>다중관리</Button>
                        <Select
                            defaultValue="name"
                            onChange={(value) => setSearchField(value)}
                            style={{width: 120, height: 40}}
                        >
                            <Select.Option value="name">예약자명</Select.Option>
                            <Select.Option value="phone">연락처</Select.Option>
                            <Select.Option value="driver">배정기사명</Select.Option>
                        </Select>
                        <Input
                            className="custom-search-input"
                            placeholder="검색어 입력"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                        />
                        <Button type="primary"
                                onClick={handleSearch}
                                style={{
                                    height: 40,
                                }}
                        >검색</Button>
                        <div className="middle-one-one">
                            <Select
                                defaultValue="recent"
                                style={{
                                    width: 120,
                                    height: 40,
                                    // marginRight: 8
                                    float: "right",
                                }}
                                onChange={(value) => setSortOption(value)}
                            >
                                <Select.Option value="recent">최근등록순</Select.Option>
                                <Select.Option value="driver">기사이름순</Select.Option>
                            </Select>
                            <FloatingBtn onClick={handleExcelDownload}/>
                        </div>
                    </div>
                    <div className="content_middle_two">
                        <ExcelTable showCheckbox={showCheckbox} combinedSearchData={sortedData}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Reservation;