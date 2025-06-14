import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import supabase from '../../lib/supabase.js';
import '../../css/FAQ.css';
import '../../css/layout.css';
import '../../css/ui.css';
import '../../css/FAQ.css';

function FAQEdit() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        category: '기타',
        status: '공개'
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
                ...data,
                answer: data.answer?.replace(/<br\s*\/?>/gi, ' ')
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
                category: formData.category,
                status: formData.status
            })
            .eq('id', id);

        if (error) {
            alert('FAQ 수정에 실패했습니다');
            console.error(error);
        } else {
            alert('FAQ가 성공적으로 수정되었습니다');
            navigate('/faq');
        }
    };

    return (
        <div className="main">
            <div className="header">FAQ 수정</div>
            <div className="card">
                <form onSubmit={handleSubmit} className="form">
                    <div className="form-group">
                        <label>질문</label>
                        <input
                            type="text"
                            name="question"
                            value={formData.question}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>답변</label>
                        <textarea
                            name="answer"
                            value={formData.answer}
                            onChange={handleChange}
                            rows={6}
                            required
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label>카테고리</label>
                        <div className="custom-select-wrapper">
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="배송">배송</option>
                                <option value="보관">보관</option>
                                <option value="결제">결제</option>
                                <option value="기타">기타</option>
                            </select>
                            <FontAwesomeIcon icon={faArrowDown} className="select-icon" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>공개 여부</label>
                        <div className="custom-select-wrapper">
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="공개">공개</option>
                                <option value="숨김">숨김</option>
                            </select>
                            <FontAwesomeIcon icon={faArrowDown} className="select-icon" />
                        </div>
                    </div>

                    <div className="form-button-wrapper">
                        <button
                            type="button"
                            className="btn btn-back"
                            onClick={() => navigate(-1)}
                        >
                            뒤로가기
                        </button>
                        <button
                            type="submit"
                            className="btn btn-add-confirm"
                        >
                            수정 완료
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default FAQEdit;
