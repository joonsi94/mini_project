import React from 'react';
import {Form, Input, Button, Modal, Layout, message, Flex} from "antd";
import supabase from "../lib/supabase.js";
import bcrypt from "bcryptjs";
import {useNavigate} from "react-router-dom";

function Login(props) {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loginModal, setLoginModal] = React.useState(true);
    const onFinish = async ({email, password}) => {
        const {data, error} = await supabase
            .from("employees")
            .select("*")
            .eq("email", email)
            .single();

        if (error || !data) {
            message.error('이메일을 확인해주세요.');
            return;
        }
        const isValid = await bcrypt.compare(password, data.password); // 해시 비교

        if (!isValid) {
            message.error('비밀번호가 일치하지 않습니다.');
            return;
        }

        message.success('로그인 성공');
        sessionStorage.setItem("name",data.name);
        sessionStorage.setItem("role",data.role);
        setTimeout(() => {
            window.location.replace("/");
        }, 700);
    }
    return (
        <>
            {/*<Modal*/}
            {/*    width={'25%'}*/}
            {/*    open={loginModal}*/}
            {/*    closable={false}*/}
            {/*    footer={null}*/}
            {/*    >*/}
            <div className="main" style={{fontWeight:"bold", marginLeft:"auto", padding:"0"}}>
                <Flex
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100vh',
                    }}
                    vertical
                >
                    <h1 style={{marginBottom: "1.5rem", fontWeight:"bold"}}>로그인</h1>
                    <Form
                        layout="vertical"
                        form={form}
                        onFinish={onFinish}
                    >
                        <Form.Item
                            label="이메일"
                            name="email"
                            rules={[{
                                required: true,
                                type: "email",
                                message: ('이메일을 확인해주세요.')
                            }]}
                        >
                            <Input/>
                        </Form.Item>
                        <Form.Item
                            label="패스워드"
                            name="password"
                            rules={[{
                                required: true,
                                message: ('패스워드를 확인해주세요.')
                            }]}
                        >
                            <Input.Password/>
                        </Form.Item>
                        <Button
                            style={{fontWeight:"bold"}}
                            type="primary" htmlType="submit" block>
                            로그인
                        </Button>
                    </Form>
                </Flex>
            </div>
            {/*</Modal>*/}
        </>
    );
}

export default Login;