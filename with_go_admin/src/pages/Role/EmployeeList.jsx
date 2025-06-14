import React, {useEffect, useState} from 'react';
import supabase from "../../lib/supabase.js";
import bcrypt from 'bcryptjs';
import {Button, Select, Input, Modal, message, Form, Card, Table} from "antd";
import {EditOutlined, DeleteOutlined, EditFilled, DeleteFilled} from '@ant-design/icons';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAnglesLeft, faAnglesRight, faChevronLeft, faChevronRight} from "@fortawesome/free-solid-svg-icons";
import '../../css/layout.css';


const {TextArea} = Input;


function EmployeeList(props) {
    const [rowdata, setRowdata] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openMemo, setOpenMemo] = useState(false);
    const [memoValue, setMemoValue] = useState('');
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [openInsert, setOpenInsert] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [detailData, setDetailData] = useState({});
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;
    const totalPages = Math.ceil(rowdata.length / itemsPerPage);
    const groupSize = 7;
    const currentGroup = Math.floor((currentPage - 1) / groupSize);
    const startPage = currentGroup * groupSize + 1;
    const endPage = Math.min(startPage + groupSize - 1, totalPages);

    const paginatedData = rowdata.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

    const showDetail = (item) => {
        setOpenDetail(true);
        setDetailData(item);
    }

    const initialValues = {
        name: '', email: '', password: '', department: '', position: '', role: '', status: ''
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const hashedPassword = await bcrypt.hash(values.password, 10);
            const { error } = await supabase.from("employees").insert({ ...values, password: hashedPassword });
            if (error) message.error('등록실패');
            else {
                message.success('등록성공');
                form.resetFields();
                setOpenInsert(false);
                const { data } = await supabase.from("employees").select().order('no', { ascending: true });
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
            await supabase.from('employees').update({ memo: memoValue }).eq('no', selectedEmployee.no);
            message.success('저장완료');
        }
        if (openEdit && selectedEmployee) {
            await supabase.from('employees').update({
                name: selectedEmployee.name,
                email: selectedEmployee.email,
                department: selectedEmployee.department,
                position: selectedEmployee.position,
                role: selectedEmployee.role,
                status: selectedEmployee.status,
            }).eq('no', selectedEmployee.no);
            message.success('수정완료');
        }
        if (openDelete && selectedEmployee) {
            await supabase.from('employees').delete().eq('no', selectedEmployee.no);
            message.success('삭제성공');
        }
        const { data } = await supabase.from('employees').select().order('no', { ascending: true });
        setRowdata(data);
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
        setOpenDetail(false);
        if (openInsert) form.resetFields();
    };

    useEffect(() => {
        async function fetchEmployees() {
            const res = await supabase.from('employees').select().order('no', { ascending: true });
            setRowdata(res.data);
        }
        fetchEmployees();
    }, []);

    return (
        <>
            {contextHolder}
            <div className='main'>
                <div className='header'>권한설정</div>
                <div className='card'>
                    <div className="title">직원목록</div>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                            <tr>
                                <th>번호</th><th>이름</th><th>이메일</th><th>부서</th><th>직위</th>
                                <th>권한</th><th>가입일</th><th>상태</th><th>메모</th><th>관리</th>
                            </tr>
                            </thead>
                            <tbody>
                            {paginatedData.map(item => (
                                <tr key={item.no} onClick={() => showDetail(item)}>
                                    <td>{item.no}</td>
                                    <td>{item.name}</td>
                                    <td>{item.email}</td>
                                    <td>{item.department}</td>
                                    <td>{item.position}</td>
                                    <td>{item.role}</td>
                                    <td>{item.created_at?.split('T').shift()}</td>
                                    <td>{item.status}</td>
                                    <td><Button onClick={(e) => { e.stopPropagation(); showMemo(item); }}>메모</Button></td>
                                    <td>
                                        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                                            <Button icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); showEdit(item); }} />
                                            <Button icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); showDelete(item); }} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                        <Button type="primary" onClick={showInsert}>새 직원 등록</Button>
                    </div>
                    <div className="pagination-wrapper">
                        <div className="pagination">
                            <button className="group-btn" onClick={() => setCurrentPage(1)} disabled={currentGroup === 0}><FontAwesomeIcon icon={faAnglesLeft} /></button>
                            <button className="arrow-btn" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}><FontAwesomeIcon icon={faChevronLeft} /></button>
                            {Array.from({ length: endPage - startPage + 1 }).map((_, i) => {
                                const pageNum = startPage + i;
                                return <button key={pageNum} className={pageNum === currentPage ? 'active' : ''} onClick={() => setCurrentPage(pageNum)}>{pageNum}</button>
                            })}
                            <button className="group-btn" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}><FontAwesomeIcon icon={faChevronRight} /></button>
                            <button className="group-btn" onClick={() => setCurrentPage(totalPages)} disabled={endPage === totalPages}><FontAwesomeIcon icon={faAnglesRight} /></button>
                        </div>
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
                <Modal
                    title="상세정보"
                    open={openDetail}
                    onCancel={handleCancel}
                    footer={[
                        <Button key="back" onClick={handleCancel}>
                            닫기
                        </Button>
                    ]}
                >
                    <div className="details"
                         style={{
                             display: "flex",
                             flexDirection: "column",
                             gap: "10px",
                             fontSize: "1rem",
                             marginTop: "1rem",
                         }}>
                        <span>이름 : {detailData.name}</span>
                        <span>부서 : {detailData.department}</span>
                        <span>직위 : {detailData.position}</span>
                        <span>권한 : {detailData.role}</span>
                        <span>상태 : {detailData.status}</span>
                        <span>이메일 : {detailData.email}</span>
                        <span>가입일 : {detailData.created_at?.split("T").shift()}</span>
                        <div className="details_memo">
                            <span>
                                메모
                            </span>
                            <TextArea
                                value={detailData.memo}
                                readOnly
                            />
                        </div>
                    </div>
                </Modal>
            </div>
        </>
    );
}

export default EmployeeList;
