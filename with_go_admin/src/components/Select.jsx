import React from 'react';
import { Select } from 'antd';
import('../css/Reservation.css')

const handleChange = value => {
    console.log(`selected ${value}`);
};

const App = () => (
    <Select
        className="select"
        defaultValue="Name"
        style={{ width: 125 }}
        onChange={handleChange}
        options={[
            {
                label: <span>searchtitle</span>,
                title: 'manager',
                options: [
                    { label: <span>예약자명</span>, value: 'Name' },
                    { label: <span>연락처</span>, value: 'PhonNumber' },
                    { label: <span>배정기사명</span>, value: 'DeliveryName' },
                ],
            },
        ]}
    />
);
export default App;