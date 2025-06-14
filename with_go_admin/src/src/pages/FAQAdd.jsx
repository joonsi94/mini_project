
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import '../css/faq.css';

function FAQAdd() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        category: '기타'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { error } = await supabase.from('withgo_faqs').insert([{ ...formData, status: '공개' }]);

        if (error) {
            alert('등록에 실패했습니다');
            console.error(error);
        } else {
            alert('FAQ가 성공적으로 등록되었습니다');
            navigate('/admin/faq');
        }
    };

    return (
        <div className="main">
            <div className="card">
                <div className="header">새 FAQ 등록</div>
                <form className="form" onSubmit={handleSubmit}>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label htmlFor="category">카테고리</label>
                        <select name="category" value={formData.category} onChange={handleChange}>
                            <option value="보관">보관</option>
                            <option value="배송">배송</option>
                            <option value="결제">결제</option>
                            <option value="기타">기타</option>
                        </select>
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                        <label htmlFor="question">질문</label>
                        <input type="text" name="question" value={formData.question} onChange={handleChange} />
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                        <label htmlFor="answer">답변</label>
                        <textarea name="answer" rows="6" value={formData.answer} onChange={handleChange} />
                    </div>

                    <div className="form-button-wrapper">
                        <button type="button" className="btn btn-back" onClick={() => navigate('/faq/list')}>뒤로가기</button>
                        <button type="submit" className="btn btn-add-register">등록</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default FAQAdd;
