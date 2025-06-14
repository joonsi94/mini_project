
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../lib/supabase';
import '../css/faq.css';

function FAQEdit() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        category: '기타'
    });

    useEffect(() => {
        const fetchFAQ = async () => {
            const { data, error } = await supabase
                .from('withgo_faqs')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !data) {
                alert('FAQ 데이터를 불러오는 데 실패했습니다');
                console.error(error || '데이터 없음');
                return;
            }

            setFormData({
                question: data.question,
                answer: data.answer?.replace(/<br\s*\/?>/gi, ' '),
                category: data.category
            });
        };

        if (id) fetchFAQ();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { error } = await supabase
            .from('withgo_faqs')
            .update({
                question: formData.question,
                answer: formData.answer,
                category: formData.category
            })
            .eq('id', id);

        if (error) {
            alert('수정에 실패했습니다');
            console.error(error);
        } else {
            alert('FAQ가 성공적으로 수정되었습니다');
            navigate('/faq/list');
        }
    };

    return (
        <div className="main">
            <div className="card">
                <div className="header">FAQ 수정</div>
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
                        <button type="submit" className="btn btn-add-register">수정</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default FAQEdit;
