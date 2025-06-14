import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import supabase from '../../lib/supabase.js';
import '../../css/layout.css';
import '../../css/ui.css';
import '../../css/NoticePromotion.css';

function NoticeEdit() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        status: '공개',
        file_url: ''
    });

    const [newFile, setNewFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        const fetchNotice = async () => {
            const { data, error } = await supabase
                .from('withgo_notifications')
                .select('*')
                .eq('id', id)
                .single();

            if (!error && data) {
                setFormData(data);
                setPreviewUrl(data.file_url);
            }
        };
        fetchNotice();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setNewFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let uploadedUrl = formData.file_url;

        if (newFile) {
            const fileName = `${Date.now()}_${newFile.name}`;
            const filePath = `notice-images/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, newFile);

            if (uploadError) {
                alert('이미지 업로드 실패');
                return;
            }

            const { data: publicData } = supabase.storage.from('images').getPublicUrl(filePath);
            uploadedUrl = publicData.publicUrl;
        }

        const { error } = await supabase
            .from('withgo_notifications')
            .update({ ...formData, file_url: uploadedUrl })
            .eq('id', id);

        if (!error) {
            alert('공지사항이 수정되었습니다');
            navigate('/notice-promotion');
        }
    };

    return (
        <div className="main">
            <div className="header">공지사항 수정</div>
            <div className="card">
                <form onSubmit={handleSubmit} className="form">
                    <div className="form-group">
                        <label>제목</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>내용</label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            rows="6"
                            required
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    <div className="form-group">
                        <label>이미지 첨부</label>
                        <input type="file" accept="image/*" onChange={handleFileChange} />
                        {previewUrl && (
                            <div style={{ marginTop: '10px' }}>
                                <img
                                    src={previewUrl}
                                    alt="미리보기"
                                    style={{ maxWidth: '200px', borderRadius: '6px' }}
                                    onError={(e) => (e.target.style.display = 'none')}
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>공개 여부</label>
                        <div className="custom-select-wrapper">
                            <select name="status" value={formData.status} onChange={handleChange}>
                                <option value="공개">공개</option>
                                <option value="비공개">비공개</option>
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

export default NoticeEdit;
