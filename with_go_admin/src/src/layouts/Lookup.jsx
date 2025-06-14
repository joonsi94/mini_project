import React from 'react';
import { UserOutlined } from '@ant-design/icons';
import { AutoComplete, Flex, Input } from 'antd';
const Title = props => (
    <Flex align="center" justify="space-between">
        {props.title}
        <a href="https://www.google.com/search?q=antd" target="_blank" rel="noopener noreferrer">
            more
        </a>
    </Flex>
);
const renderItem = (title, count) => ({
    value: title,
    label: (
        <Flex align="center" justify="space-between">
            {title}
            <span>
        <UserOutlined /> {count}
      </span>
        </Flex>
    ),
});
const options = [
    {
        label: <Title title="Libraries" />,
        options: [renderItem('AntDesign', 10000), renderItem('AntDesign UI', 10600)],
    },
    {
        label: <Title title="Solutions" />,
        options: [renderItem('AntDesign UI FAQ', 60100), renderItem('AntDesign FAQ', 30010)],
    },
    {
        label: <Title title="Articles" />,
        options: [renderItem('AntDesign design language', 100000)],
    },
];
const Lookup = ({ onSearch }) => (
    <AutoComplete
        popupClassName="certain-category-search-dropdown"
        popupMatchSelectWidth={500}
        style={{ width: 250 }}
        options={[]} // 자동완성 옵션은 안 쓰니까 비워둬도 됨
    >
        <Input.Search
            size="large"
            placeholder="검색어를 입력하세요"
            onSearch={onSearch}
            allowClear
        />
    </AutoComplete>
);
export default Lookup;