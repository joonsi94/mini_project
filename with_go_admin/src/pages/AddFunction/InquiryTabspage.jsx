import React, { useState } from 'react';
import { Radio, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import InquiryList from './InquiryList.jsx';
import '../../css/layout.css';
import '../../css/ui.css';
import '../../css/inquiry.css';

const InquiryTabspage = () => {
    const [filterType, setFilterType] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [searchValue, setSearchValue] = useState('');

    const handleFilterChange = (e) => setFilterType(e.target.value);
    const handleSearch = (value) => setSearchValue(value);

    return (
        <div className="inquiry-tabs-wrapper">
            <div className="main">
                <div className="header">1:1 문의 관리</div>

                <div className="card">
                    <div className="top-bar">
                        <div className="title">문의 리스트</div>
                        <div className="tab-and-search">
                            <Radio.Group
                                value={filterType}
                                onChange={handleFilterChange}
                                buttonStyle="solid"
                            >
                                <Radio.Button value="">전체</Radio.Button>
                                <Radio.Button value="보관">보관</Radio.Button>
                                <Radio.Button value="배송">배송</Radio.Button>
                            </Radio.Group>

                            <Input.Search
                                placeholder="질문 검색"
                                allowClear
                                enterButton={
                                    <span>
                    <SearchOutlined style={{ marginRight: 4 }} />
                    검색
                  </span>
                                }
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onSearch={handleSearch}
                                className="search-input default-style"
                            />
                        </div>
                    </div>

                    <InquiryList
                        filterType={filterType}
                        searchKeyword={searchValue}
                    />
                </div>
            </div>
        </div>
    );
};

export default InquiryTabspage;