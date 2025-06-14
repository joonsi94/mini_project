import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../lib/supabase';
import '../css/NoticeForm.css';

function NoticeEdit() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        img_url: ''
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

            if (error || !data) {
                alert('공지 불러오기 실패!');
                return;
            }

            setFormData(data);
            setPreviewUrl(data.img_url);
        };

        fetchNotice();
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
            const filePath = `notice-images/${fileName}`;
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, newFile);

            if (uploadError) {
                alert('이미지 업로드 실패');
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
            .from('withgo_notifications')
            .update({
                title: formData.title,
                content: formData.content,
                img_url: updatedImageUrl
            })
            .eq('id', id);

        if (error) {
            alert('공지 수정에 실패했습니다');
            console.error(error);
        } else {
            alert('공지 수정이 완료되었습니다');
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
                        <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>내용</label>
                        <textarea name="content" value={formData.content} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>이미지 변경</label>
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
                        <button type="submit" className="btn btn-edit-save">수정 완료</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NoticeEdit;