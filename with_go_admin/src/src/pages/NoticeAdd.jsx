import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import '../css/NoticeForm.css';

function NoticeAdd() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        content: ''
    });
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let imageUrl = '';

        if (file) {
            const fileName = `${Date.now()}_${file.name}`;
            const filePath = `notice-images/${fileName}`;

            const { error: uploadError } = await supabase
                .storage
                .from('images')
                .upload(filePath, file);

            if (uploadError) {
                alert('이미지 업로드 실패');
                console.error(uploadError);
                return;
            }

            const { data: publicData } = supabase
                .storage
                .from('images')
                .getPublicUrl(filePath);

            imageUrl = publicData.publicUrl;
        }

        const { error } = await supabase.from('withgo_notifications').insert([{
            title: formData.title,
            content: formData.content,
            img_url: imageUrl
        }]);

        if (error) {
            alert('공지 등록에 실패했습니다');
            console.error(error);
        } else {
            alert('공지 등록이 완료되었습니다');
            navigate('/notice-promotion');
        }
    };

    return (
        <div className="main">
            <div className="header">새 공지 등록</div>
            <div className="card">
                <form onSubmit={handleSubmit} className="form">
                    <div className="form-group">
                        <label>제목</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>내용</label>
                        <textarea name="content" value={formData.content} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>이미지 첨부</label>
                        <input type="file" accept="image/*" onChange={handleFileChange} />
                        {previewUrl && (
                            <div style={{ marginTop: '10px' }}>
                                <img src={previewUrl} alt="미리보기" style={{ maxWidth: '200px' }} />
                            </div>
                        )}
                    </div>

                    <div className="form-button-wrapper">
                        <button type="button" className="btn btn-back" onClick={() => navigate(-1)}>
                            뒤로가기
                        </button>
                        <button type="submit" className="btn btn-add">등록하기</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NoticeAdd;
