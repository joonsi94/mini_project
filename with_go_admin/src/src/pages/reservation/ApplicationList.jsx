import React, {useEffect, useState} from 'react';
import {Button, Layout, Tabs, DatePicker, Select, Input, Space, message} from 'antd';
import ExcelTable from "../../components/ExcelTable.jsx";

const {RangePicker} = DatePicker;
const {Option} = Select;
const {Content} = Layout;

function ApplicationList() {
    const [currentTab, setCurrentTab] = useState('all');
    const [combinedData, setCombinedData] = useState([]);
    const [searchField, setSearchField] = useState('예약자명');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [dateRange, setDateRange] = useState([]);
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const data = JSON.parse(localStorage.getItem('mock_reservations') || '[]');
            setCombinedData(data);
        };
        fetchData();
    }, []);

    const getFilteredData = (type) => {
        if (type === 'delivery') {
            return combinedData.filter(d => d.division === '배송' && d.processingStatus !== '취소');
        }
        if (type === 'storage') {
            return combinedData.filter(d => d.division === '보관' && d.processingStatus !== '취소');
        }
        if (type === 'cancel') {
            return combinedData.filter(d => d.processingStatus === '취소');
        }
        return combinedData.filter(d => d.processingStatus !== '취소');
    };

    const counts = {
        all: combinedData.filter(d => d.processingStatus !== '취소').length,
        delivery: combinedData.filter(d => d.division === '배송' && d.processingStatus !== '취소').length,
        storage: combinedData.filter(d => d.division === '보관' && d.processingStatus !== '취소').length,
        cancel: combinedData.filter(d => d.processingStatus === '취소').length
    };

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

    useEffect(() => {
        setSearchResults([]);
    }, [currentTab]);

    return (
        <Content>
            <div className="main">
                <div className="header">
                    <h3>예약관리</h3>
                </div>
                <div className="card">
                    <div className="title" style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                        <h1 style={{fontSize: '1.5rem', margin: 0}}>예약신청목록</h1>
                        <Button type="primary" href="/NewReservationAddPage">신규예약등록</Button>
                    </div>
                    <div className="content_middle" style={{padding: '0 20px'}}>
                        <div className="content_middle_two" style={{marginTop: '15px'}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 20}}>
                                <RangePicker
                                    onChange={(dates) => setDateRange(dates)}
                                    style={{width: 240}}
                                />
                                <Select
                                    value={searchField}
                                    onChange={setSearchField}
                                    style={{width: 140}}
                                >
                                    <Option value="예약자명">예약자명</Option>
                                    <Option value="연락처">연락처</Option>
                                    <Option value="배정기사명">배정기사명</Option>
                                </Select>
                                <Input
                                    placeholder="검색어 입력"
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    style={{width: 200}}
                                />
                                <Button type="primary" onClick={handleSearch}>검색</Button>
                            </div>
                            <Tabs
                                defaultActiveKey="all"
                                items={[
                                    {
                                        label: `전체 (${counts.all})`,
                                        key: 'all',
                                        children: (
                                            <ExcelTable
                                                showCheckbox={false}
                                                filteredData={searchResults.length > 0 ? searchResults : getFilteredData('all')}
                                            />
                                        ),
                                    },
                                    {
                                        label: `배송 (${counts.delivery})`,
                                        key: 'delivery',
                                        children: (
                                            <ExcelTable
                                                showCheckbox={false}
                                                filteredData={searchResults.length > 0 ? searchResults : getFilteredData('delivery')}
                                            />
                                        ),
                                    },
                                    {
                                        label: `보관 (${counts.storage})`,
                                        key: 'storage',
                                        children: (
                                            <ExcelTable
                                                showCheckbox={false}
                                                filteredData={searchResults.length > 0 ? searchResults : getFilteredData('storage')}
                                            />
                                        ),
                                    },
                                    {
                                        label: `취소 (${counts.cancel})`,
                                        key: 'cancel',
                                        children: (
                                            <ExcelTable
                                                showCheckbox={false}
                                                filteredData={searchResults.length > 0 ? searchResults : getFilteredData('cancel')}
                                            />
                                        ),
                                    },
                                ]}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Content>
    );
}

export default ApplicationList;
