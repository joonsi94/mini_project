import React, {useEffect, useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {supabase} from "../../lib/supabase.js";
import '../../css/placeCreate.css';
import DrStyle from "../../css/DriverRegistration.module.css";

function StorageCreate() {
    const [form, setForm] = useState({
        name: '',
        address: '',
        phone: '',
        map_url: '',
    });

    const [currentImage, setCurrentImage] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const {storage_id} = useParams();
    const isEditMode = Boolean(storage_id);
    const numericStorageId = storage_id ? Number(storage_id) : null;

    // 기존데이터 불러오기
    useEffect(() => {
        const fetchStorage = async () => {
            if (!isEditMode) return;

            const { data, error } = await supabase
                .from('storage_place')
                .select('*')
                .eq('storage_id', numericStorageId)
                .single();

            if (error) {
                console.error('데이터 조회 오류:', error);
            } else if (data) {
                setForm({
                    name: data.name,
                    address: data.address,
                    phone: data.phone,
                    map_url: data.map_url,
                });
                setCurrentImage(data.image);
            }
        };

        if (numericStorageId !== null) {
            fetchStorage();
        }
    }, [numericStorageId, isEditMode]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm({...form, [name]: value});
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
        }
    };

    // 구글맵 지도퍼가기 src 추출
    const extractSrc = (iframeString) => {
        const match = iframeString.match(/src="([^"]+)"/);
        return match ? match[1] : iframeString;
    };

    const deleteOldImage = async (imageUrl) => {
        if (!imageUrl) return;
        const path = imageUrl.split('/storage/v1/object/public/images/')[1];
        if (path) {
            await supabase.storage.from('images').remove([path]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const {name, address, phone, map_url} = form;

        // 필수 입력 체크
        if (!name || !address || !phone || !map_url) {
            alert('모두 다 입력해야 합니다.');
            return;
        }

        const cleanMapUrl = extractSrc(map_url);
        let image = currentImage;

        if (imageFile) {
            await deleteOldImage(currentImage);

            const fileExt = imageFile.name.split(".").pop().toLowerCase();
            const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];

            if (!allowedExtensions.includes(fileExt)) {
                alert("지원되지 않는 파일 형식입니다.\njpg, jpeg, png, gif, bmp 파일만 업로드 가능합니다.");
                return;
            }

            const fileName = crypto.randomUUID() + "." + fileExt;
            const filePath = `storage_img/${fileName}`;

            const {error: uploadError} = await supabase.storage
                .from("images")
                .upload(filePath, imageFile);

            if (uploadError) {
                alert('파일 업로드 중 오류가 발생했습니다.');
                console.error(uploadError);
                return;
            }

            const {data: publicUrl} = supabase.storage
                .from("images")
                .getPublicUrl(filePath);

            image = publicUrl.publicUrl;
        }

        let query = supabase.from('storage_place');
        let result;

        if (numericStorageId) {
            // 수정
            result = await query.update({
                name,
                address,
                phone,
                map_url: cleanMapUrl,
                ...(image && { image }),
            }).eq('storage_id', numericStorageId);
        } else {
            // 신규 등록
            result = await query.insert([{
                name,
                address,
                phone,
                map_url: cleanMapUrl,
                image
            }]);
        }

        const {error} = result;

        if (error) {
            console.error('저장 오류:', error);
            alert('저장 중 오류가 발생했습니다.');
        } else {
            alert(numericStorageId ? '수정이 완료되었습니다!' : '등록이 완료되었습니다!');
            setForm({ name: '', address: '', phone: '', map_url: '' });
            setImageFile(null);
            setCurrentImage('');
            if (fileInputRef.current) fileInputRef.current.value = '';
            navigate('/storage/list');
        }
    };

    const handleBack = () => {
        navigate('/storage/list');
    };

    return (
        <div className='main'>
            <div className='header'>보관장소등록</div>
            <div className='card'>
                <form onSubmit={handleSubmit} className='form_Create'>
                    <div className='group'>
                        <label className='name'><em className={DrStyle.fem}>*</em><span>장소명</span></label>
                        <input
                            type="text"
                            name="name"
                            autoComplete="off"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className='group'>
                        <label className='address'><em className={DrStyle.fem}>*</em><span>주소</span></label>
                        <input
                            type="text"
                            name="address"
                            autoComplete="off"
                            placeholder="(우편번호)주소를 입력해주세요"
                            value={form.address}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className='group'>
                        <label className='phone'><em className={DrStyle.fem}>*</em><span>연락처</span></label>
                        <input
                            type="text"
                            name="phone"
                            autoComplete="off"
                            placeholder="- 넣어서 입력해주세요"
                            value={form.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className='group'>
                        <label className='map'><em className={DrStyle.fem}>*</em><span>지도</span></label>
                        <input
                            type="text"
                            name="map_url"
                            autoComplete="off"
                            placeholder="구글맵 지도퍼가기 HTML 복사해주세요"
                            value={form.map_url}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className='group'>
                        <label className='img'>장소 이미지</label>
                        <input
                            type="file"
                            accept="image/*"
                            autoComplete="off"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                        />
                    </div>
                    <div className='btn-container'>
                        <button
                            type="button"
                            className='btn btn-back btn-standard'
                            onClick={handleBack}
                        >
                            뒤로가기
                        </button>
                        <button className='btn btn-add btn-standard' type="submit">
                            {numericStorageId ? '수정하기' : '등록하기'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default StorageCreate;