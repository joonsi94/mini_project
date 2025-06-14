import React, {useEffect, useState} from 'react';
import supabase from "../lib/supabase.js";
import bcrypt from 'bcryptjs';
import {Button, Select, Input, Modal, message, Form, Card, Table} from "antd";
import {EditOutlined, DeleteOutlined, EditFilled, DeleteFilled} from '@ant-design/icons';

const {TextArea} = Input;


function EmployeeList(props) {
    const [rowdata, setRowdata] = useState([]);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [openMemo, setOpenMemo] = useState(false);
    const [memoValue, setMemoValue] = useState('');
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [openInsert, setOpenInsert] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [insertedEmployee, setInsertedEmployee] = useState(null);
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();

    const columns = [
        {title: "번호", dataIndex: "no"},
        {title: "이름", dataIndex: "name"},
        {title: "이메일", dataIndex: "email"},
        {title: "부서", dataIndex: "department"},
        {title: "직위", dataIndex: "position"},
        {title: "가입일", dataIndex: "created_at", render: (text) => (text.split('T').shift())},
        {title: "권한", dataIndex: "role"},
        {title: "상태", dataIndex: "status"},
        {
            title: "메모",
            render: (_, record) => <Button color="default" variant="filled" onClick={() => showMemo(record)}>
                메모
            </Button>
        },
        {
            title: "관리", render: (_, record) => <div style={{display: "flex", gap: "10px", justifyContent: "center"}}>
                <Button icon={<EditOutlined/>} shape="square" size="medium"
                        onClick={() => showEdit(record)}/>
                <Button icon={<DeleteOutlined/>} shape="square" size="medium"
                        onClick={() => showDelete(record)}/>
            </div>
        },
    ]

    const showMemo = (employee) => {
        setSelectedEmployee(employee);
        setMemoValue(employee.memo || '');
        setOpenMemo(true);
    };

    const showEdit = (employee) => {
        setSelectedEmployee(employee);
        setOpenEdit(true);
    };

    const showDelete = (employee) => {
        setSelectedEmployee(employee);
        setOpenDelete(true);
    }

    const showInsert = () => {
        setOpenInsert(true);
    }

    const initialValues = {
        name: '',
        email: '',
        password: '',
        department: '',
        position: '',
        role: '',
        status: '',
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            // const {name, email, department, password, position, role, status} = values;
            const hashedPassword = await bcrypt.hash(values.password, 10);

            const {data, error} = await supabase.from("employees")
                .insert({
                    ...values,
                    password: hashedPassword,
                });
            if (error) {
                message.error('등록실패');
            } else {
                message.success('등록성공');
                form.resetFields();
                setOpenInsert(false);

                const {data} = await supabase.from("employees").select().order('no', {ascending: true});
                setRowdata(data);
            }
        } catch (err) {
            console.error(err);
            message.error('에러가 발생했습니다.');
        }
        setLoading(false);
    }


    const handleOk = async () => {
        setLoading(true);

        if (openMemo && selectedEmployee) {
            await supabase.from('employees')
                .update({memo: memoValue})
                .eq('no', selectedEmployee.no);
            message.success('저장완료');
            const {data} = await supabase.from('employees').select().order('no', {ascending: true});
            setRowdata(data);
        }
        if (openEdit && selectedEmployee) {
            await supabase.from('employees')
                .update({
                    name: selectedEmployee.name,
                    email: selectedEmployee.email,
                    department: selectedEmployee.department,
                    position: selectedEmployee.position,
                    role: selectedEmployee.role,
                    status: selectedEmployee.status,
                })
                .eq('no', selectedEmployee.no);
            message.success('수정완료');

            const {data} = await supabase.from('employees').select().order('no', {ascending: true});
            setRowdata(data);
        }
        if (openDelete && selectedEmployee) {
            await supabase.from('employees')
                .delete()
                .eq('no', selectedEmployee.no);
            message.success('삭제성공');
            const {data} = await supabase.from('employees').select().order('no', {ascending: true});
            setRowdata(data);
        }
        setTimeout(() => {
            setLoading(false);
            setOpenMemo(false);
            setOpenEdit(false);
            setOpenDelete(false);
        }, 1000);
    };

    const handleCancel = () => {
        setOpenMemo(false);
        setOpenEdit(false);
        setOpenDelete(false);
        setOpenInsert(false);
        form.resetFields();
    };

    useEffect(() => {
        async function fetchEmployees() {
            const res = await supabase.from('employees').select().order('no', {ascending: true});
            setRowdata(res.data);
            console.log(res.data);
        }

        fetchEmployees();
    }, [])


    return (
        <>
            {contextHolder}
            <div className='main'>
                <div className='header'>
                    직원목록
                </div>
                <div className='card'>
                    <Table dataSource={rowdata} columns={columns} rowKey="no">
                        {/*<thead>*/}
                        {/*<tr>*/}
                        {/*    <th>번호</th>*/}
                        {/*    <th>이름</th>*/}
                        {/*    <th>이메일</th>*/}
                        {/*    <th>부서</th>*/}
                        {/*    <th>직위</th>*/}
                        {/*    <th>권한</th>*/}
                        {/*    <th>가입일</th>*/}
                        {/*    <th>상태</th>*/}
                        {/*    <th>메모</th>*/}
                        {/*    <th>관리</th>*/}
                        {/*</tr>*/}
                        {/*</thead>*/}
                        {/*<tbody>*/}
                        {/*{rowdata.map(item => (*/}
                        {/*    <tr key={item.no}>*/}
                        {/*        <td>{item.no}</td>*/}
                        {/*        <td>{item.name}</td>*/}
                        {/*        <td>{item.email}</td>*/}
                        {/*        <td>{item.department}</td>*/}
                        {/*        <td>{item.position}</td>*/}
                        {/*        <td>{item.role}</td>*/}
                        {/*        <td>{item.created_at.split('T').shift()}</td>*/}
                        {/*        <td>{item.status}</td>*/}
                        {/*        <td><Button color="default" variant="filled" onClick={() => showMemo(item)}>*/}
                        {/*            메모*/}
                        {/*        </Button></td>*/}
                        {/*        <td>*/}
                        {/*            <div style={{display: "flex", gap: "10px", justifyContent: "center"}}>*/}
                        {/*                <Button icon={<EditOutlined/>} shape="square" size="medium"*/}
                        {/*                        onClick={() => showEdit(item)}/>*/}
                        {/*                <Button icon={<DeleteOutlined/>} shape="square" size="medium"*/}
                        {/*                        onClick={() => showDelete(item)}/>*/}
                        {/*            </div>*/}
                        {/*        </td>*/}

                        {/*    </tr>*/}
                        {/*))}*/}
                        {/*</tbody>*/}
                    </Table>
                    <div style={{textAlign: 'right', marginTop: '2rem'}}>
                        <Button type="primary" onClick={() => showInsert()}>
                            새 직원 등록
                        </Button>
                    </div>
                </div>
                <Modal
                    title="메모"
                    open={openMemo}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    footer={[
                        <Button key="back" onClick={handleCancel}>
                            닫기
                        </Button>,
                        <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
                            저장
                        </Button>
                    ]}>
                    <TextArea
                        rows={4}
                        value={memoValue}
                        onChange={(e) => setMemoValue(e.target.value)}
                    />
                </Modal>
                <Modal
                    title="수정"
                    open={openEdit}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    footer={[
                        <Button key="back" onClick={handleCancel}>
                            닫기
                        </Button>,
                        <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
                            저장
                        </Button>
                    ]}>
                    <div className="editContent" style={{display: "flex", flexDirection: "column", gap: "20px"}}>
                        <Input
                            placeholder="이름"
                            value={selectedEmployee?.name}
                            onChange={(e) => setSelectedEmployee({...selectedEmployee, name: e.target.value})}
                        />
                        <Input
                            placeholder="이메일"
                            value={selectedEmployee?.email}
                            onChange={(e) => setSelectedEmployee({...selectedEmployee, email: e.target.value})}
                        />
                        <Input
                            placeholder="부서"
                            value={selectedEmployee?.department}
                            onChange={(e) => setSelectedEmployee({...selectedEmployee, department: e.target.value})}
                        />
                        <Input
                            placeholder="직위"
                            value={selectedEmployee?.position}
                            onChange={(e) => setSelectedEmployee({...selectedEmployee, position: e.target.value})}
                        />
                        <div style={{display: "flex", gap: "20px"}}>
                            <div style={{display: "flex", flexDirection: "column", gap: "0.5rem"}}>
                                <span>권한</span>
                                <Select value={selectedEmployee?.role}
                                        style={{'width': '100px'}}
                                        onChange={(value) => setSelectedEmployee({...selectedEmployee, role: value})}
                                        options={[
                                            {value: '읽기전용', label: <span>읽기전용</span>},
                                            {value: '수정가능', label: <span>수정가능</span>},
                                            {value: '관리자', label: <span>관리자</span>}
                                        ]}
                                />
                            </div>
                            <div style={{display: "flex", flexDirection: "column", gap: "0.5rem"}}>
                                <span>상태</span>
                                <Select value={selectedEmployee?.status}
                                        style={{'width': '90px'}}
                                        onChange={(value) => setSelectedEmployee({...selectedEmployee, status: value})}
                                        options={[
                                            {value: '인증중', label: <span>인증중</span>},
                                            {value: '사용중', label: <span>사용중</span>},
                                            {value: '차단', label: <span>차단</span>}
                                        ]}
                                />
                            </div>
                        </div>
                    </div>
                </Modal>
                <Modal
                    title="삭제 후에는 복원하실 수 없습니다!"
                    open={openDelete}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    footer={[
                        <Button key="back" onClick={handleCancel}>
                            닫기
                        </Button>,
                        <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
                            확인
                        </Button>
                    ]}>
                    <span>삭제를 원하시면 확인을 눌러주세요</span>
                </Modal>
                <Modal
                    title="신규등록"
                    open={openInsert}
                    onOk={() => form.submit()}
                    onCancel={handleCancel}
                    footer={[
                        <Button key="back" onClick={handleCancel}>
                            닫기
                        </Button>,
                        <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
                            등록
                        </Button>
                    ]}>
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={initialValues}
                        onFinish={onFinish}
                    >
                        <Form.Item label="이름" name="name" rules={[{required: true, message: '이름을 입력해주세요'}]}>
                            <Input/>
                        </Form.Item>
                        <Form.Item label="이메일" name="email"
                                   rules={[{required: true, type: 'email', message: '올바른 이메일을 입력해주세요'}]}>
                            <Input/>
                        </Form.Item>
                        <Form.Item label="부서" name="department" rules={[{required: true, message: '부서를 입력해주세요'}]}>
                            <Input/>
                        </Form.Item>
                        <Form.Item label="직위" name="position" rules={[{required: true, message: '직위를 입력해주세요'}]}>
                            <Input/>
                        </Form.Item>
                        <Form.Item label="비밀번호" name="password" rules={[{required: true, message: '비밀번호를 입력해주세요'}]}>
                            <Input.Password/>
                        </Form.Item>
                        <div style={{display: "flex", gap: "20px"}}>
                            <div style={{width: '50%'}}>
                                <Form.Item label="권한" name="role" rules={[{required: true, message: '권한을 선택해주세요'}]}>
                                    <Select
                                        options={[
                                            {value: "읽기전용", label: <span>읽기전용</span>},
                                            {value: "수정가능", label: <span>수정가능</span>},
                                            {value: "관리자", label: <span>관리자</span>}
                                        ]}
                                    />
                                </Form.Item>
                            </div>
                            <div style={{width: '50%'}}>
                                <Form.Item label="상태" name="status" rules={[{required: true, message: '상태를 설정해주세요'}]}>
                                    <Select
                                        options={[
                                            {value: "사용중", label: <span>사용중</span>},
                                            {value: "차단", label: <span>차단</span>},
                                        ]}
                                    />
                                </Form.Item>
                            </div>
                        </div>
                    </Form>
                </Modal>
            </div>
        </>
    );
}

export default EmployeeList;