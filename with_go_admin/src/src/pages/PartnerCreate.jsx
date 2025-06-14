import React, {useState} from 'react';
import supabase from '../lib/supabase';
import '../css/partnerCreate.css';
function PartnerCreate() {
    const [form, setForm] = useState({
        name: '',
        address: '',
        phone: '',
        map_url: '',
        image_url: '',
    });

    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm({...form, [name]: value});
    };

    // 구글맵 지도퍼가기 src 추출
    const extractSrc = (iframeString) => {
        const match = iframeString.match(/src="([^"]+)"/);
        return match ? match[1] : iframeString;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { name, address, phone, map_url, image_url } = form;

        // 필수 입력 체크
        if (!name || !address || !phone || !map_url || !image_url) {
            alert('모두 다 입력해야 합니다.');
            return;
        }

        const cleanMapUrl = extractSrc(map_url);

        const {error} = await supabase
            .from('partner')
            .insert([{
                name,
                address,
                phone,
                map_url: cleanMapUrl,
                image_url
            }]);

        if (error) {
            console.error('등록 오류:', error);
            alert('등록 중 오류가 발생했습니다.');
        } else {
            alert('등록이 완료되었습니다!');
            setForm({
                name: '',
                address: '',
                phone: '',
                map_url: '',
                image_url: '',
            });
        }
    };
    return (
        <div className='main'>
            <div className='header'>제휴숙소관리</div>
            <div className='card'>
                <h3>제휴숙소등록</h3>
                <form onSubmit={handleSubmit} className='form'>
                    <div className='group'>
                        <label className='name'>숙소명</label>
                        <input
                            type="text"
                            name="name"
                            autoComplete="off"
                            value={form.name}
                            onChange={handleChange}
                        />
                    </div>
                    <div className='group'>
                        <label className='address'>주소</label>
                        <input
                            type="text"
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                        />
                    </div>
                    <div className='group'>
                        <label className='phone'>연락처</label>
                        <input
                            type="text"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                        />
                    </div>
                    <div className='group'>
                        <label className='map'>지도</label>
                        <input
                            type="text"
                            name="map_url"
                            value={form.map_url}
                            onChange={handleChange}
                        />
                    </div>
                    <div className='group'>
                        <label className='img'>숙소 이미지</label>
                        <input
                            type="text"
                            name="image_url"
                            value={form.image_url}
                            onChange={handleChange}
                        />
                    </div>
                    <div className='btn-container'>
                        <button className='btn' type="submit">등록하기</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PartnerCreate;