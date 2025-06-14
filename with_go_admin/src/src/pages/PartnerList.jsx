import React, {useEffect, useState} from 'react';
import supabase from '../lib/supabase';

function PartnerList() {
    const [partners, setPartners] = useState([]);

    useEffect(() => {
        async function fetchPartners() {
            const {data, error} = await supabase
                .from('partner')
                .select('*')
                .order('created_at', {ascending: false});

            if (error) {
                console.error('제휴숙소 조회 오류:', error);
            } else {
                setPartners(data);
            }
        }

        fetchPartners();
    }, []);

    return (
        <>
            <div className='main'>
                <div className='header'>제휴숙소관리</div>

                <div className='card'>
                    <h3>제휴숙소목록</h3>
                        <table>
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>숙소명</th>
                                <th>주소</th>
                                <th>연락처</th>
                                <th>지도</th>
                                <th>숙소 이미지</th>
                                <th>등록일</th>
                            </tr>
                            </thead>
                            <tbody>
                            {partners.map((partner) => (
                                <tr key={partner.partner_id}>
                                    <td>{partner.partner_id}</td>
                                    <td>{partner.name}</td>
                                    <td>{partner.address}</td>
                                    <td>{partner.phone}</td>
                                    <td>
                                        {partner.map_url ? (
                                            <div dangerouslySetInnerHTML={{ __html: partner.map_url }} />
                                        ) : '없음'}
                                    </td>
                                    <td>
                                        {partner.image_url ? (
                                            <img src={partner.image_url} alt="숙소 이미지" style={{ width: '100px', height: 'auto' }} />
                                        ) : (
                                            "없음"
                                        )}
                                    </td>
                                    <td>{new Date(partner.created_at).toLocaleString('ko-KR')}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                </div>
            </div>
        </>
    );
}

export default PartnerList;