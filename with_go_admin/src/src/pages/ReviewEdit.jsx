import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../lib/supabase';
import '../css/Review.css';


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

            if (error || !data) {
                alert('리뷰 데이터를 불러오는 데 실패했습니다');
                console.error(error || '데이터 없음');
                return;
            }

            console.log('이미지 URL:', data.file_url);
            setFormData(data);
            setPreviewUrl(data.file_url);
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

            const { error: uploadError } = await supabase
                .storage
                .from('review_uploads')
                .upload(filePath, newFile);

            if (uploadError) {
                alert('이미지 업로드에 실패했습니다');
                console.error(uploadError);
                return;
            }

            const { data: publicData } = supabase
                .storage
                .from('review_uploads')
                .getPublicUrl(filePath);

            updatedImageUrl = publicData.publicUrl;
        }

        const { error } = await supabase
            .from('review')
            .update({
                title: formData.title,
                review_txt: formData.review_txt,
                file_url: updatedImageUrl // ✅ 컬럼명 반영
            })
            .eq('review_num', id);

        if (error) {
            alert('수정에 실패했습니다');
            console.error(error);
        } else {
            alert('후기가 성공적으로 수정되었습니다!');
            navigate('/review');
        }
    };

    return (
        <div className="main">
            <div className="header">이용후기 수정</div>
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
                            name="review_txt"
                            value={formData.review_txt}
                            onChange={handleChange}
                            rows={6}
                            required
                        ></textarea>
                    </div>

                    {previewUrl && previewUrl !== '' && (
                        <div style={{ marginTop: '20px' }}>
                            <label>현재 이미지 미리보기</label>
                            <div style={{ marginTop: '10px' }}>
                                <img
                                    src={previewUrl}
                                    alt="리뷰 이미지"
                                    style={{ maxWidth: '300px', borderRadius: '8px' }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        console.warn('이미지 로드 실패:', previewUrl);
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label>이미지 변경 (선택)</label>
                        <input type="file" accept="image/*" onChange={handleFileChange} />
                    </div>

                    <div className="form-button-wrapper">
                        <button
                            type="button"
                            className="btn btn-back btn-standard"
                            onClick={() => navigate(-1)}
                        >
                            뒤로가기
                        </button>
                        <button
                            type="submit"
                            className="btn btn-edit-save btn-standard"
                        >
                            수정 완료
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ReviewEdit;
