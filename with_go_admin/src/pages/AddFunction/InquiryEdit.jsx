import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../../lib/supabase.js';

import '../../css/layout.css';
import '../../css/ui.css';
import '../../css/inquiry.css';

function InquiryEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        question_txt: '',
        answer: '안녕하세요, withgo입니다.', // 기본 답변
        name: '',
        created_at: '',
        stat: '',
        type: '',
        text_num: id
    });

    useEffect(() => {
        const fetchData = async () => {
            const { data, error } = await supabase
                .from('question')
                .select('*')
                .eq('text_num', id)
                .single();
            if (data) {
                setFormData(prev => ({
                    ...prev,
                    ...data,
                    answer: data.answer || '안녕하세요, withgo입니다.'
                }));
            }
        };
        fetchData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { error } = await supabase
            .from('question')
            .update({
                answer: formData.answer,
                stat: '답변완료'
            })
            .eq('text_num', id);

        if (!error) {
            alert('답변이 성공적으로 등록되었습니다.');
            navigate('/inquiry/list');
        } else {
            alert('답변 등록에 실패했습니다. 다시 시도해주세요.');
        }
    };

    return (
        <div className="main">
            <div className="header">1:1 문의 답변</div>
            <div className="card">
                <form className="form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>번호</label>
                        <input type="text" value={formData.text_num} disabled />
                    </div>
                    <div className="form-group">
                        <label>구분</label>
                        <input type="text" value={formData.type} disabled />
                    </div>
                    <div className="form-group">
                        <label>제목</label>
                        <input type="text" value={formData.title} disabled />
                    </div>
                    <div className="form-group">
                        <label>문의내용</label>
                        <textarea value={formData.question_txt} disabled />
                    </div>
                    <div className="form-group">
                        <label>답변내용</label>
                        <textarea name="answer" value={formData.answer} onChange={handleChange} required />
                    </div>
                    <div className="form-button-wrapper">
                        <button type="button" className="btn btn-back" onClick={() => navigate('/inquiry/list')}>
                            뒤로가기
                        </button>
                        <button type="submit" className="btn btn-add-confirm">
                            답변 등록
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default InquiryEdit;
