import React from 'react';
import { Cascader } from 'antd';

const options = [
    {
        value: '대구',
        label: '대구',
        children: [
            { value: '중구', label: '중구' },
            { value: '동구', label: '동구' },
            { value: '서구', label: '서구' },
            { value: '북구', label: '북구' },
            { value: '수성구', label: '수성구' },
            { value: '달서구', label: '달서구' },
            { value: '달성군', label: '달성군' },
        ],
    },
    {
        value: '경주',
        label: '경주',
        children: [
            { value: '안강읍', label: '안강읍' },
            { value: '강동면', label: '강동면' },
            { value: '양북면', label: '양북면' },
            { value: '내남면', label: '내남면' },
        ],
    },
];

const onChange = (value) => {
    console.log(value);
};

const displayRender = (labels) => labels.join(' / ');

const LocationCascader = () => (
    <Cascader
        options={options}
        onChange={onChange}
        displayRender={displayRender}
        placeholder="지역 선택"
        style={{ width: 150 }} // Cascader 너비
    />
);

export default LocationCascader;
