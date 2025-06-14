import React from 'react';
import { Cascader } from 'antd';

const options = [
    {
        value: 'daegu',
        label: '대구',
        children: [
            { value: 'junggu', label: '중구' },
            { value: 'donggu', label: '동구' },
            { value: 'seogu', label: '서구' },
            { value: 'bukgu', label: '북구' },
            { value: 'suseonggu', label: '수성구' },
            { value: 'dalseogu', label: '달서구' },
            { value: 'dalseonggun', label: '달성군' },
        ],
    },
    {
        value: 'gyeongju',
        label: '경주',
        children: [
            { value: 'andong', label: '안강읍' },
            { value: 'gangdong', label: '강동면' },
            { value: 'yangbuk', label: '양북면' },
            { value: 'naenam', label: '내남면' },
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
        style={{ width: 150 }}
    />
);

export default LocationCascader;
