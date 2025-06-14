import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { notification } from 'antd';
import supabase from '../../lib/supabase.js';
import '../../css/layout.css';
import '../../css/ui.css';
import '../../css/Event.css';

function EventEdit() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        title: '',
        date: '',
        link_url: '',
        img_url: '',
        status: '이벤트 진행중'
    });
    const [newFile, setNewFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        if (!id) return;
        const fetchEvent = async () => {
            const { data, error } = await supabase
                .from('withgo_event')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !data) {
                notification.error({ message: '이벤트 데이터를 불러오는 데 실패했습니다' });
                return;
            }

            setFormData(data);
            setPreviewUrl(data.img_url);
        };
        fetchEvent();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setNewFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let updatedImageUrl = formData.img_url;

        if (newFile) {
            const fileName = `${Date.now()}_${newFile.name}`;
            const filePath = `event-images/${fileName}`;
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, newFile);

            if (uploadError) {
                notification.error({ message: '이미지 업로드에 실패했습니다' });
                return;
            }

            const { data: publicData } = supabase.storage.from('images').getPublicUrl(filePath);
            updatedImageUrl = publicData.publicUrl;
        }

        const { error } = await supabase
            .from('withgo_event')
            .update({
                title: formData.title,
                date: formData.date,
                link_url: formData.link_url,
                status: formData.status,
                img_url: updatedImageUrl
            })
            .eq('id', id);

        if (error) {
            notification.error({ message: '수정에 실패했습니다' });
        } else {
            notification.success({ message: '이벤트가 수정되었습니다' });
            navigate('/event/list');
        }
    };

    return (
        <div className="main">
            <div className="header">이벤트 수정</div>
            <div className="card">
                <form onSubmit={handleSubmit} className="form">
                    <div className="form-group">
                        <label>제목</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>날짜</label>
                        <input type="date" name="date" value={formData.date} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>유튜브 링크</label>
                        <input type="text" name="link_url" value={formData.link_url} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>이미지 변경</label>
                        <input type="file" accept="image/*" onChange={handleFileChange} />
                        {previewUrl && (
                            <div className="event-image-preview">
                                <img src={previewUrl} alt="미리보기" />
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>상태</label>
                        <div className="custom-select-wrapper">
                            <select name="status" value={formData.status} onChange={handleChange}>
                                <option value="이벤트 진행중">이벤트 진행중</option>
                                <option value="이벤트 종료">이벤트 종료</option>
                            </select>
                            <FontAwesomeIcon icon={faArrowDown} className="select-icon" />
                        </div>
                    </div>

                    <div className="form-button-wrapper">
                        <button type="button" className="btn btn-back" onClick={() => navigate(-1)}>
                            뒤로가기
                        </button>
                        <button type="submit" className="btn btn-add-confirm">
                            수정 완료
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EventEdit;
