import React, { useEffect, useState } from 'react';
import { Button, Layout, Tabs, DatePicker, Select, Input, message } from 'antd';
import ExcelTable from "../../components/ExcelTable.jsx";
import supabase from "../../lib/supabase.js";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Content } = Layout;

function ApplicationList() {
    const [currentTab, setCurrentTab] = useState('all');
    const [combinedData, setCombinedData] = useState([]);
    const [searchField, setSearchField] = useState('예약자명');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [dateRange, setDateRange] = useState([]);
    const [searchResults, setSearchResults] = useState([]);

    // ✅ 데이터 가공 함수
    const formatStorageData = (item, index) => ({
        division: '보관',
        reservationTime: item.storage_start_date,
        section: '-',
        luggageNumber: `소 ${item.small || 0} / 중 ${item.medium || 0} / 대 ${item.large || 0}`,
        reservationName: item.name,
        reservationPhone: item.phone,
        date: item.storage_start_date,
        driver: '-',
        processingStatus: item.situation || '미배정',
        key: `storage-${item.reservation_number}`,
        id: item.reservation_number,
        number: index + 1,
    });

    const formatDeliveryData = (item, index) => ({
        division: '배송',
        reservationTime: item.delivery_date,
        section: `${item.delivery_start} → ${item.delivery_arrive}`,
        luggageNumber: `under ${item.small || 0} / over ${item.large || 0}`,
        reservationName: item.name,
        reservationPhone: item.phone,
        date: item.delivery_date,
        driver: item.driver || '-',
        processingStatus: item.situation || '미배정',
        key: `delivery-${item.re_num}`,
        id: item.re_num,
        number: index + 1,
    });

    // ✅ Supabase에서 데이터 불러오기
    useEffect(() => {
        const fetchData = async () => {
            const [storageRes, deliveryRes] = await Promise.all([
                supabase.from('storage').select('*'),
                supabase.from('delivery').select('*')
            ]);

            const storageData = (storageRes.data || []).map((item, i) => formatStorageData(item, i));
            const deliveryData = (deliveryRes.data || []).map((item, i) => formatDeliveryData(item, i));

            // 전체를 한번에 정렬된 인덱스로 번호 다시 매기기
            const allData = [...storageData, ...deliveryData].map((d, i) => ({ ...d, number: i + 1 }));

            setCombinedData(allData);
        };

        fetchData();
    }, []);

    // ✅ 검색 필터링
    const handleSearch = () => {
        const keyword = searchKeyword.toLowerCase();
        const filtered = combinedData.filter(item => {
            const inDateRange = !dateRange.length || (
                item.date >= dateRange[0].format('YYYY-MM-DD') &&
                item.date <= dateRange[1].format('YYYY-MM-DD')
            );

            const inKeyword = !keyword || (() => {
                if (searchField === '예약자명') return item.reservationName.toLowerCase().includes(keyword);
                if (searchField === '연락처') return item.reservationPhone.includes(keyword);
                if (searchField === '배정기사명') return item.driver.toLowerCase().includes(keyword);
                return false;
            })();

            return inDateRange && inKeyword;
        });

        if (filtered.length === 0) {
            message.warning("검색 결과가 없습니다.");
        }

        setSearchResults(filtered);
    };

    // ✅ 탭 필터링
    const getFilteredResults = (tabKey) => {
        const baseData = searchResults.length > 0 ? searchResults : combinedData;

        if (tabKey === 'delivery') return baseData.filter(d => d.division === '배송' && d.processingStatus !== '취소');
        if (tabKey === 'storage') return baseData.filter(d => d.division === '보관' && d.processingStatus !== '취소');
        if (tabKey === 'cancel') return baseData.filter(d => d.processingStatus === '취소');
        return baseData.filter(d => d.processingStatus !== '취소'); // all
    };

    // ✅ 탭별 개수
    const counts = {
        all: combinedData.filter(d => d.processingStatus !== '취소').length,
        delivery: combinedData.filter(d => d.division === '배송' && d.processingStatus !== '취소').length,
        storage: combinedData.filter(d => d.division === '보관' && d.processingStatus !== '취소').length,
        cancel: combinedData.filter(d => d.processingStatus === '취소').length
    };

    return (
        <Content>
            <div className="main">
                <div className="header">
                    <div>예약관리</div>
                </div>
                <div className="card">
                    <div className="title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h4>예약신청목록</h4>
                        {/*<Button type="primary" href="/NewReservationAddPage">신규예약등록</Button>*/}
                    </div>

                    <div className="content_middle">
                        <div className="content_middle_two" style={{ marginTop: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 20 }}>
                                <RangePicker onChange={(dates) => setDateRange(dates)} style={{ width: 240 }} />
                                <Select value={searchField} onChange={setSearchField} style={{ width: 140 }}>
                                    <Option value="예약자명">예약자명</Option>
                                    <Option value="연락처">연락처</Option>
                                    <Option value="배정기사명">배정기사명</Option>
                                </Select>
                                <Input
                                    placeholder="검색어 입력"
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    style={{ width: 200 }}
                                />
                                <Button type="primary" onClick={handleSearch}>검색</Button>
                            </div>

                            <Tabs
                                activeKey={currentTab}
                                onChange={setCurrentTab}
                                items={
                                    combinedData.length > 0
                                        ? [
                                            {
                                                label: `전체 (${counts.all})`,
                                                key: 'all',
                                                children: <ExcelTable showCheckbox={false} combinedSearchData={getFilteredResults('all')} />,
                                            },
                                            {
                                                label: `배송 (${counts.delivery})`,
                                                key: 'delivery',
                                                children: <ExcelTable showCheckbox={false} combinedSearchData={getFilteredResults('delivery')} />,
                                            },
                                            {
                                                label: `보관 (${counts.storage})`,
                                                key: 'storage',
                                                children: <ExcelTable showCheckbox={false} combinedSearchData={getFilteredResults('storage')} />,
                                            },
                                            {
                                                label: `취소 (${counts.cancel})`,
                                                key: 'cancel',
                                                children: <ExcelTable showCheckbox={false} combinedSearchData={getFilteredResults('cancel')} />,
                                            },
                                        ]
                                        : []
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Content>
    );
}

export default ApplicationList;
