import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../../lib/supabase.js';
import '../../css/Review.css';
import '../../css/layout.css';
import '../../css/ui.css';

function ReviewEdit() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        title: '',
        review_txt: '',
        file_url: ''
    });
    const [newFile, setNewFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        const fetchReview = async () => {
            const { data, error } = await supabase
                .from('review')
                .select('*')
                .eq('review_num', id)
                .single();

            if (!error && data) {
                setFormData(data);
                setPreviewUrl(data.file_url);
            } else {
                alert('리뷰 데이터를 불러오는 데 실패했습니다');
            }
        };

        if (id) fetchReview();
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
        let updatedImageUrl = formData.file_url;

        if (newFile) {
            const fileName = `${Date.now()}_${newFile.name}`;
            const filePath = `review-images/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('review_uploads')
                .upload(filePath, newFile);

            if (uploadError) {
                alert('이미지 업로드 실패');
                return;
            }

            const { data: publicData } = supabase.storage
                .from('review_uploads')
                .getPublicUrl(filePath);

            updatedImageUrl = publicData.publicUrl;
        }

        const { error } = await supabase
            .from('review')
            .update({
                title: formData.title,
                review_txt: formData.review_txt,
                file_url: updatedImageUrl
            })
            .eq('review_num', id);

        if (error) {
            alert('수정 실패');
        } else {
            alert('성공적으로 수정되었습니다');
            navigate('/review');
        }
    };

    return (
        <div className="main">
            <div className="header">이용후기 수정</div>
            <div className="card">
                <form className="form" onSubmit={handleSubmit}>
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
                            name="review_txt"
                            value={formData.review_txt}
                            onChange={handleChange}
                            rows={6}
                            required
                        ></textarea>
                    </div>
                    <div className="form-group">
                        <label>현재 이미지 미리보기</label>
                        {previewUrl && (
                            <div style={{ marginTop: '10px' }}>
                                <img
                                    src={previewUrl}
                                    alt="리뷰 이미지"
                                    style={{ maxWidth: '200px', borderRadius: '6px' }}
                                    onError={(e) => (e.target.style.display = 'none')}
                                />
                            </div>
                        )}
                    </div>
                    <div className="form-group">
                        <label>이미지 변경 (선택)</label>
                        <input type="file" accept="image/*" onChange={handleFileChange} />
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

export default ReviewEdit;