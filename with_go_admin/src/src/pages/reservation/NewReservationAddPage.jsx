import React, {useState, useEffect} from 'react';
import {
    Card,
    Col,
    Form, // Form 컴포넌트 import 유지
    Input,
    Layout,
    Row,
    Button,
    message,
    notification,
    Modal,
    Checkbox,
    DatePicker,
    Space,
    Select,
    Cascader,
    Flex,
    Radio, Divider,
} from "antd";
import supabase from "../../lib/supabase.js";
import bcrypt from 'bcryptjs';
import {useNavigate} from "react-router-dom";
// import LocationCascader from '../../components/Cascader';

import '../../css/NewReservationAdd.css';

const {Content} = Layout;

const Counter = ({initialCount = 0, onCountChange}) => {
    const [count, setCount] = useState(initialCount);

    useEffect(() => {
        onCountChange(count);
    }, [count]);

    const increment = () => setCount((c) => c + 1);
    const decrement = () => setCount((c) => Math.max(0, c - 1));

    return (
        <div style={{
            padding: '5px',
            display: 'flex',
            alignItems: 'center',
            width: '100px',
        }}>
            <button
                onClick={decrement}
                style={{
                    fontSize: '20px',
                    padding: '0 10px',
                    backgroundColor: '#f0f0f0',
                    color: '#333',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',

                }}
            >
                -
            </button>
            <div style={{
                fontSize: '20px',
                width: '40px',
                // height: '30px',
                backgroundColor: 'white',
                // border: '1px solid #dddddd',
                textAlign: 'center'
            }}> {count} </div>
            <button
                onClick={increment}
                style={{
                    fontSize: '20px',
                    padding: '0 10px',
                    backgroundColor: '#f0f0f0',
                    color: '#333',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                }}
            >
                +
            </button>
        </div>
    );
};

function NewReservationAddPage() {
    const [form] = Form.useForm(); // useForm 훅 올바르게 사용
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [serviceType, setServiceType] = useState('delivery');
    const [largeCount, setLargeCount] = useState(0);
    const [middleCount, setMiddleCount] = useState(0);
    const [smallCount, setSmallCount] = useState(0);
    const [totalPayment, setTotalPayment] = useState(0);
    const [storageDates, setStorageDates] = useState(null);  // 보관 기간 상태 선언 (추가)
    // const [deliveryDates, setDeliveryDates] = useState(null);
    const [detailAddress, setDetailAddress] = useState('');
    const [cascaderValue, setCascaderValue] = useState([]);

    const handleCascaderChange = (value) => {
        setCascaderValue(value); // 선택한 지역구 값 저장
    };

    const handleDetailAddressChange = (e) => {
        setDetailAddress(e.target.value);
    };

    const locationOptions = [
        {
            label: 'location',
            title: 'manager',
            options: [
                {label: '동대구역', value: 'eastDaeguStation'},
                {label: '대구역', value: 'DaeguStation'},
                {label: '경주역', value: 'GyeongjuStation'},
            ],
        },
    ];

    const [storageLocation, setStorageLocation] = useState(locationOptions?.[0]?.options?.[0]?.value || '');
    const {RangePicker} = DatePicker;

    const largePrice = 5000;
    const middlePrice = 3000;
    const smallPrice = 1000;

    const handleLargeCountChange = (count) => {
        setLargeCount(count);
    };

    const handleMiddleCountChange = (count) => {
        setMiddleCount(count);
    };

    const handleSmallCountChange = (count) => {
        setSmallCount(count);
    };

    useEffect(() => {
        const total = (largeCount * largePrice) + (middleCount * middlePrice) + (smallCount * smallPrice);
        setTotalPayment(total);
    }, [largeCount, middleCount, smallCount, largePrice, middlePrice, smallPrice]);


    const onFinish = async (values) => {
        const { name, email, phone } = values;
        setLoading(true);

        try {
            const commonData = {
                name,
                mail: email || null,
                phone,
                small: smallCount,
                medium: middleCount,
                large: largeCount,
                price: totalPayment,
                reservation_country: 'Korea',
            };

            if (serviceType === 'storage') {
                if (!storageDates || !storageDates[0] || !storageDates[1]) {
                    message.warning("보관 시작/종료 날짜를 선택해주세요");
                    setLoading(false);
                    return;
                }
                const storageData = {
                    ...commonData,
                    location: storageLocation,
                    storage_start_date: storageDates[0].format('YYYY-MM-DD'),
                    storage_end_date: storageDates[1].format('YYYY-MM-DD'),
                };
                const { error } = await supabase.from('storage').insert([storageData]);
                if (error) throw error;
            } else if (serviceType === 'delivery') {
                if (!storageDates || !storageDates[0]) {
                    message.warning("배송 날짜를 선택해주세요");
                    setLoading(false);
                    return;
                }
                const deliveryArriveAddress = cascaderValue.join(' / ') + (detailAddress ? ` ${detailAddress}` : '');

                const deliveryData = {
                    ...commonData,
                    delivery_date: storageDates[0].format('YYYY-MM-DD'),
                    delivery_start: storageLocation,
                    delivery_arrive: deliveryArriveAddress,
                };
                const { error } = await supabase.from('delivery').insert([deliveryData]);
                if (error) throw error;
            }

            notification.success({ message: '예약 등록 완료', description: '성공적으로 등록되었습니다.' });
            navigate('/ApplicationList');
        } catch (err) {
            message.error(`오류 발생: ${err.message}`);
            console.error("예약 등록 중 오류:", err);
        } finally {
            setLoading(false);
        }
    };


    const handleServiceTypeChange = (e) => {
        setServiceType(e.target.value);
    };

    const handleLocationChange = value => {
        console.log(`selected ${value}`);
        setStorageLocation(value)
        // 선택된 위치에 따른 상태 업데이트 또는 로직 처리
    };


    const PaymentDisplay = ({amount}) => {
        const formattedAmount = amount.toLocaleString();
        return <span style={{fontSize: '30px', fontWeight: "bold", color: '#1e83f1'}}>{formattedAmount} 원</span>;
    };

    const handleGoToList = () => {
        Modal.confirm({
            title: "목록으로 이동하시겠습니까?",
            content: "작성 중인 내용이 사라질 수 있습니다.",
            onOk: () => navigate('/ApplicationList')
        });
    };

    const ReservationDatePicker = () => (
        <Space direction="vertical" size={12} style={{marginTop: '5px'}}>
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "5px", // ✅ 항목 간 간격 고정
                width: '100%', // ✅ 고정 너비로 균형 유지
            }}>
                <RangePicker
                    renderExtraFooter={() => 'extra footer'}
                    showTime={{ format: 'HH:mm' }}
                    format="YYYY-MM-DD HH:mm"
                    value={storageDates}
                    placeholder={[
                        serviceType === 'delivery' ? 'PICK UP' : '보관 시작',
                        serviceType === 'delivery' ? 'DROP OFF' : '보관 종료'
                    ]}
                    style={{
                        width: '350px',
                        marginTop: '5px',
                        marginBottom: '5px'
                    }}
                    onChange={(dates) => setStorageDates(dates)}
                />
                <Select
                    className="select"
                    value={storageLocation}
                    style={{width: 120}}
                    onChange={handleLocationChange}
                    options={locationOptions}
                />

                {serviceType === 'delivery' && (
                    <>
                        <Cascader
                            options={[{
                                value: 'daegu', label: '대구', children: [
                                    { value: 'junggu', label: '중구' },
                                    { value: 'donggu', label: '동구' },
                                    { value: 'seogu', label: '서구' },
                                    { value: 'bukgu', label: '북구' },
                                    { value: 'suseonggu', label: '수성구' },
                                    { value: 'dalseogu', label: '달서구' },
                                    { value: 'dalseonggun', label: '달성군' },
                                ]
                            }, {
                                value: 'gyeongju', label: '경주', children: [
                                    { value: 'andong', label: '안강읍' },
                                    { value: 'gangdong', label: '강동면' },
                                    { value: 'yangbuk', label: '양북면' },
                                    { value: 'naenam', label: '내남면' },
                                ]
                            }]}
                            value={cascaderValue}
                            onChange={handleCascaderChange}
                            displayRender={(labels) => labels.join(' / ')}
                            placeholder="지역 선택"
                            style={{ width: 150 }}
                        />
                        <Input
                            placeholder="상세주소"
                            style={{ width: '100px', marginLeft: '10px' }}
                            value={detailAddress || ''}
                            onChange={handleDetailAddressChange}
                            allowClear
                        />
                    </>
                )}

            </div>
        </Space>
    );

    return (
        <Content>
            <div className="main">
                <div className="header">
                    <h3>예약관리</h3>
                </div>
                <div className="card">
                    <div className="title"
                         style={{display: "flex", justifyContent: "space-between"}}
                    >신규예약등록
                        <Button className="customerList"
                                onClick={handleGoToList}>목록</Button>
                    </div>

                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Card styles={{
                                body: { padding: 0 , paddingTop: 20},
                            }}
                                  style={{
                                      marginBottom: '2rem',
                                      height: 'auto',
                                      backgroundColor: '#F9F9F9',
                                  }}>
                                <Form layout="horizontal">
                                    <Form.Item
                                        label="구분"
                                        colon={false}
                                        className="separated-form-item"
                                    >
                                        <Radio.Group defaultValue={serviceType} size="middle"
                                                     onChange={handleServiceTypeChange}>
                                            <Radio.Button value="delivery">배송</Radio.Button>
                                            <Radio.Button value="storage">보관</Radio.Button>
                                        </Radio.Group>
                                    </Form.Item>
                                    <Divider style={{margin: '12px 0', borderColor: 'rgba(217,217,217,0.5)'}}/>
                                    <Form.Item
                                        label={serviceType === 'delivery' ? '예약일자' : '보관기간'}
                                        colon={false}
                                        className="separated-form-item"
                                    >
                                        <ReservationDatePicker/>
                                    </Form.Item>
                                    <Divider style={{margin: '12px 0', borderColor: 'rgba(217,217,217,0.5)'}}/>
                                    <Form.Item label="짐갯수" colon={false} className="separated-form-item">
                                        {[
                                            {label: '대(30인치 이상)', onChange: handleLargeCountChange},
                                            {label: '중(21~29인치)', onChange: handleMiddleCountChange},
                                            {label: '소(20인치 이하)', onChange: handleSmallCountChange}
                                        ].map((item, i) => (
                                            <div key={i}
                                                 style={{display: "flex", alignItems: "center", marginBottom: '8px'}}>
                                                <span style={{width: '120px'}}>{item.label}</span>
                                                <Counter onCountChange={item.onChange}/>
                                            </div>
                                        ))}
                                    </Form.Item>
                                    <Divider style={{margin: '12px 0', borderColor: 'rgba(217,217,217,0.5)'}}/>
                                    <Form.Item
                                        label="결제금액"
                                        colon={false}
                                        className="separated-form-item"

                                    >
                                        <PaymentDisplay amount={totalPayment}/>
                                    </Form.Item>
                                </Form>
                            </Card>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Card styles={{
                                body: { padding: 0 , paddingTop: 20},
                            }}
                                  style={{
                                      marginBottom: '1rem',
                                      height: 'auto',
                                      backgroundColor: '#F9F9F9',
                                  }}>
                                <Form
                                    form={form}
                                    layout="horizontal"
                                    onFinish={onFinish}
                                    initialValues={{
                                        name: '',
                                        email: '',
                                        phone: '',
                                    }}
                                    style={{
                                        width: '100%',
                                        minWidth: '27%'
                                }}>

                                    <Form.Item
                                        label="예약자명"
                                        name="name"
                                        rules={[{required: true, message: '예약자명을 입력해주세요'}]}
                                        className="separated-form-item"
                                    >
                                        <Input placeholder="ex) 홍길동" style={{ width: '100%' }}/>
                                    </Form.Item>
                                    <Divider style={{ margin: '16px 0', borderColor: 'rgba(217,217,217,0.5)' }} />
                                    <Form.Item
                                        label="이메일"
                                        name="email"
                                        rules={[{required: true, type: 'email', message: '올바른 이메일을 입력해주세요'}]}
                                        className="separated-form-item"
                                    >
                                        <Input placeholder="ex) test123@example.com" style={{ width: '100%' }}/>
                                    </Form.Item>
                                    <Divider style={{
                                        margin: '16px 0',
                                        borderTop: '1px solid #d9d9d9',
                                        width: '100%',
                                        borderColor: 'rgba(217,217,217,0.5)'
                                    }} />
                                    <Form.Item
                                        label="연락처"
                                        name="phone"
                                        rules={[
                                            {required: true, message: '전화번호를 입력해주세요 예시 010-1234-1234'},
                                            {pattern: /^01[016789]-\d{3,4}-\d{4}$/, message: '유효한 전화번호 형식이 아닙니다'},
                                        ]}
                                        className="separated-form-item"
                                    >
                                        <Input placeholder="010-1234-5678" style={{ width: '100%' }} />
                                    </Form.Item>
                                    {/*<Form.Item style={{ textAlign: 'center', marginTop: 40 }}>*/}
                                    {/*</Form.Item>*/}
                                </Form>
                            </Card>
                            <div style={{
                                width: '100%',
                                textAlign: 'center'
                            }}>
                                <Button type="primary"
                                        onClick={()=>form.submit()}
                                    // htmlType="submit"
                                        loading={loading}
                                        style={{
                                            width: '100px',
                                            height: '40px',
                                            // marginTop: 10,
                                            // marginBottom: 20,
                                            // textAlign: 'center'
                                        }}>
                                    등록
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
        </Content>
    );
}

export default NewReservationAddPage;