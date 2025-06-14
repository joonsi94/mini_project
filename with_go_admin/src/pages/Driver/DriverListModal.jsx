import React from 'react';
import { Modal } from 'antd';
import DlStyle from "../../css/DriverList.module.css";

const DriverListModal = ({ visible, driver, onCancel }) => {
    if (!driver) return null;

    return (
        <Modal
            title="기사 상세 정보"
            open={visible}
            onCancel={onCancel}
            footer={null}
        >
            <div>
                <div>
                    {driver.photo_url ? (
                        <img src={driver.photo_url} alt="기사사진" width="200" />
                    ) : "사진 없음"}
                </div>
                <div className={DlStyle.Modal}>
                    <div className={DlStyle.infoItem}>
                        <strong className={DlStyle.spacing_strong}>아이디:</strong> {driver.driver_id}
                    </div>
                    <div className={DlStyle.infoItem}>
                        <strong className={DlStyle.spacing_strong}>
                            <span>이</span>
                            <span style={{ marginRight: '17px' }}></span>
                            <span>름</span>
                            :
                        </strong>
                        {driver.name}
                    </div>
                    <div className={DlStyle.infoItem}>
                        <strong className={DlStyle.spacing_strong}>생년월일:</strong> {driver.birthday}
                    </div>
                    <div className={DlStyle.infoItem}>
                        <strong className={DlStyle.spacing_strong}>
                            <span>성</span>
                            <span style={{ marginRight: '17px' }}></span>
                            <span>별</span>
                            :
                        </strong>
                        {driver.gender}
                    </div>
                    <div className={DlStyle.infoItem}>
                        <strong className={DlStyle.spacing_strong}>연락처:</strong> {driver.phone}
                    </div>
                    <div className={DlStyle.infoItem}>
                        <strong className={DlStyle.spacing_strong}>이메일:</strong> {driver.email}
                    </div>
                    <div className={DlStyle.infoItem}>
                        <strong className={DlStyle.spacing_strong}>
                            <span>주</span>
                            <span style={{ marginRight: '17px' }}></span>
                            <span>소</span>
                            :
                        </strong>
                        {driver.address}
                    </div>
                    <div className={DlStyle.infoItem}>
                        <strong className={DlStyle.spacing_strong}>
                            <span>메</span>
                            <span style={{ marginRight: '17px' }}></span>
                            <span>모</span>
                            :
                        </strong>
                        {driver.memo}
                    </div>
                    <div className={DlStyle.infoItem}>
                        <strong className={DlStyle.spacing_strong}>첨부파일:</strong>
                        {driver.file_url ? (
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    fetch(driver.file_url)
                                        .then((response) => response.blob())
                                        .then((blob) => {
                                            const link = document.createElement("a");
                                            link.href = URL.createObjectURL(blob);
                                            link.download = driver.file_url.split('/').pop();
                                            link.click();
                                        })
                                        .catch((error) => console.error("파일 다운로드 오류:", error));
                                }}
                            >
                                {driver.file_url.split('/').pop()}
                            </a>
                        ) : (
                            "없음"
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default DriverListModal;
