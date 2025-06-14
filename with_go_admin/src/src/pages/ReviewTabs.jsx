import React, { useState } from 'react';
import { Radio, Input } from 'antd';
import ReviewTable from './ReviewTable';
import '../css/Review.css';

const ReviewTabs = () => {
    const [filterType, setFilterType] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [searchValue, setSearchValue] = useState('');

    const handleFilterChange = (e) => {
        setFilterType(e.target.value);
    };

    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
    };

    const handleSearch = (value) => {
        setSearchValue(value);
    };

    return (
        <div className="wrapper">
            <div className="main">
                <div className="header">이용후기 관리</div>
                <div className="card">
                    <div className="top-bar">
                        <h3>이용후기 리스트</h3>
                        <div className="tab-and-search">
                            <Radio.Group
                                defaultValue=""
                                buttonStyle="solid"
                                onChange={handleFilterChange}
                            >
                                <Radio.Button value="">전체</Radio.Button>
                                <Radio.Button value="보관">보관</Radio.Button>
                                <Radio.Button value="배송">배송</Radio.Button>
                            </Radio.Group>

                            <Input.Search
                                placeholder="리뷰 검색"
                                allowClear
                                size="middle"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onSearch={handleSearch}
                                className="review-search-input"
                            />
                        </div>
                    </div>
                    <ReviewTable
                        filterType={filterType}
                        searchKeyword={searchValue}
                    />
                </div>
            </div>
        </div>
    );
};

export default ReviewTabs;
