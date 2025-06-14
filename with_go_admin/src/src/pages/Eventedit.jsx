import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import supabase from '../lib/supabase';
import '../css/Evpro.css';


function EventEdit() {
    const navigate = useNavigate();
    const { id } = useParams(); // URL에서 이벤트 ID 가져오기
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        link_url: '',
        img_url: '',
        status: '이벤트 진행중'
    });
    const [newFile, setNewFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    // 1. 기존 이벤트 정보 불러오기
    useEffect(() => {
        if (!id) return;

        const fetchEvent = async () => {
            const { data, error } = await supabase
                .from('withgo_event')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !data) {
                alert('이벤트 데이터를 불러오는 데 실패했습니다');
                console.error(error || '데이터 없음');
                return;
            }

            setFormData(data);
            setPreviewUrl(data.img_url);
        };

        fetchEvent();
    }, [id]);


    // 2. 폼 값 변경
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // 3. 새 이미지 선택 시 처리
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setNewFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    // 4. 저장 (업데이트) 처리
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
                alert('이미지 업로드에 실패했습니다');
                console.error(uploadError);
                return;
            }

            const { data: publicData } = supabase
                .storage
                .from('images')
                .getPublicUrl(filePath);

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
            alert('수정에 실패했습니다');
            console.error(error);
        } else {
            alert('이벤트가 수정되었습니다');
            navigate('/event-promotion');
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
                        <label>이미지 변경 (선택)</label>
                        <input type="file" accept="image/*" onChange={handleFileChange} />
                        {previewUrl && (
                            <div style={{ marginTop: '10px' }}>
                                <img src={previewUrl} alt="미리보기" style={{ maxWidth: '200px' }} />
                            </div>
                        )}
                    </div>

                    <div className="custom-select">
                        <select name="status" value={formData.status} onChange={handleChange}>
                            <option value="이벤트 진행중">이벤트 진행중</option>
                            <option value="이벤트 종료">이벤트 종료</option>
                        </select>
                        <FontAwesomeIcon icon={faArrowDown} className="select-icon" />
                    </div>

                    <div className="form-button-wrapper">
                        <button
                            type="button"
                            className="btn btn-back btn-standard"
                            onClick={() => navigate(-1)} // 바로 이전 페이지로!
                        >
                            뒤로가기
                        </button>
                        <button type="submit" className="btn btn-edit-save btn-standard">수정 완료</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EventEdit;
