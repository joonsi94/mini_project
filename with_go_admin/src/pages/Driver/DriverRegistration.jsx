import React, { useEffect, useState, useRef } from "react";
import DrStyle from "../../css/DriverRegistration.module.css";
import { Button } from "antd";
import { supabase } from "../../lib/supabase.js";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const uploadFileToStorage2 = async (folder, file) => {
  const fileName = `${Date.now()}_${file.name}`;

  const { data, error } = await supabase.storage
    .from("images")
    .upload(`${folder}/${fileName}`, file);

  if (error) {
    console.error("업로드 실패:", error.message);
    return null;
  }

  const { publicUrl } = supabase.storage
    .from("images")
    .getPublicUrl(`${folder}/${fileName}`).data;

  return publicUrl;
};

function DriverRegistration() {
  const navigate2 = useNavigate();
  const [previewImage2, setPreviewImage2] = useState(null);
  const [photoFile2, setPhotoFile2] = useState(null);
  const [attachFile2, setAttachFile2] = useState(null);
  const location = useLocation();
  const editDriver = location.state?.driver;
  const nameInputRef = useRef(null);


  const [formData2, setFormData2] = useState({
    name: editDriver?.name || "",
    phone: editDriver?.phone || "",
    birthday: editDriver?.birthday || "",
    email: editDriver?.email || "",
    address: editDriver?.address || "",
    memo: editDriver?.memo || "",
    photo_url: editDriver?.photo_url || "",
    file_url: editDriver?.file_url || "",
    gender: editDriver?.gender || "",
  });

  const handleImageChange2 = (e) => {
    const file2 = e.target.files[0];
    if (file2) {
      const photoUrl2 = URL.createObjectURL(file2);
      setPreviewImage2(photoUrl2);
      setPhotoFile2(file2);
    }
  };

  const handleAttachFileChange2 = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachFile2(file);
    }
  };

  const handleChange2 = (e) => {
    const { name, value } = e.target;

    if (name === "birthday") {
      if (!/^\d*$/.test(value) || value.length > 6) return;
    }

    setFormData2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit2 = async (e) => {
    e.preventDefault();

    let photoUrl = formData2.photo_url;
    if (photoFile2) {
      photoUrl = await uploadFileToStorage2("Driver-photo", photoFile2);
    }

    let fileUrl = formData2.file_url;
    if (attachFile2) {
      fileUrl = await uploadFileToStorage2("Driver-file", attachFile2);
    }

    const dataToSave = {
      ...formData2,
      photo_url: photoUrl,
      file_url: fileUrl,
      password: formData2.birthday
    };

    if (editDriver) {
      const { error } = await supabase
        .from("DriverList")
        .update(dataToSave)
        .eq("id", editDriver.id);

      if (error) {
        alert("수정 실패: " + error.message);
      } else {
        alert("수정 완료!");
        navigate2("/DriverList");
      }
    } else {
      const { error } = await supabase.from("DriverList").insert([dataToSave]);

      if (error) {
        alert("등록 실패: " + error.message);
      } else {
        alert("등록 완료!");
        navigate2("/DriverList");
      }
    }
  };

  const goToDriverList = () => {
    navigate2("/DriverList");
  };

  useEffect(() => {
    if (editDriver?.photo_url) {
      setPreviewImage2(editDriver.photo_url);
    }

    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [editDriver]);

  return (
    <>
      <div className='main'>
        <div className={DrStyle.DR_top}>기사 관리</div>
        <div className={`${DrStyle.DR_main} ${DrStyle.card} card`}>
          <div className={DrStyle.MainTop}>
            <div>
              <h3>기사 등록</h3>
            </div>
            <div>
              <Button type="primary" onClick={goToDriverList}>
                목록
              </Button>
            </div>
          </div>
          <form className={DrStyle.DriverForm} onSubmit={handleSubmit2}>
            <div className={DrStyle.FormUp}>
              <div className={DrStyle.imge}>
                {previewImage2 ? (
                  <div className={DrStyle.preview}>
                    <img src={previewImage2} alt="미리보기" />
                  </div>
                ) : (
                  <div className={DrStyle.nopreview}>
                    등록된 사진이 없습니다.
                  </div>
                )}
                <div className={DrStyle.imgefile}>
                  <input type="file" onChange={handleImageChange2} />
                </div>
              </div>
              <div className={DrStyle.formright}>
                <div className={`${DrStyle.Group} ${DrStyle.name}`}>
                  <label htmlFor="name"><em className={DrStyle.fem}>*</em>
                    이름
                  </label>
                  <input type="text" name="name" value={formData2.name} onChange={handleChange2} ref={nameInputRef} autoComplete="off" required />
                </div>
                <div className={`${DrStyle.Group} ${DrStyle.birthday}`}>
                  <label htmlFor="birthday" mar><em className={DrStyle.fem}>*</em>생년월일</label>
                  <input type="number"
                    name="birthday"
                    value={formData2.birthday}
                    onChange={handleChange2}
                    onKeyDown={(e) => {
                      const invalidChars = ["e", "E", "+", "-", "."];
                      if (invalidChars.includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      const paste = e.clipboardData.getData("text");
                      if (!/^\d{1,6}$/.test(paste)) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="생년월일 6자리"
                    autoComplete="off"
                    inputMode="numeric"
                    required />
                </div>
                <div className={`${DrStyle.Group} ${DrStyle.gender4}`}>
                  <label htmlFor="gender3"><em className={DrStyle.fem}>*</em>
                    성별
                  </label>
                  <div className={DrStyle.gender2}>
                    <input type="radio" name="gender" id="male" value="남"
                      checked={formData2.gender === "남"}
                      onChange={handleChange2} required />
                    <label htmlFor="male" style={{ paddingLeft: "10px", width: "35px" }}>남</label>
                    <input type="radio" name="gender" id="female" value="여"
                      checked={formData2.gender === "여"}
                      onChange={handleChange2} required />
                    <label htmlFor="female" style={{ paddingLeft: "10px", width: "35px" }}>여</label>
                  </div>
                </div>
              </div>
            </div>
            <div className={`${DrStyle.Group} ${DrStyle.phone}`}>
              <label htmlFor="phone"><em className={DrStyle.fem}>*</em>연락처</label>
              <input type="number" name="phone" value={formData2.phone} onChange={handleChange2} placeholder="- 없이 입력하세요." autoComplete="off" required />
            </div>
            <div className={`${DrStyle.Group} ${DrStyle.email}`}>
              <label htmlFor="email"><em className={DrStyle.fem}>*</em>이메일</label>
              <input type="email" name="email" value={formData2.email} onChange={handleChange2} autoComplete="off" required />
            </div>
            <div className={`${DrStyle.Group} ${DrStyle.address}`}>
              <label htmlFor="address"><em className={DrStyle.fem}>*</em>
                주소
              </label>
              <input type="text" name="address" value={formData2.address} onChange={handleChange2} autoComplete="off" required />
            </div>
            <div className={`${DrStyle.Group} ${DrStyle.memo}`}>
              <label htmlFor="memo">
                <span style={{ marginLeft: '8px' }}>메</span>
                <span>모</span>
              </label>
              <textarea name="memo" value={formData2.memo} onChange={handleChange2}></textarea>
            </div>
            <div className={`${DrStyle.Group} ${DrStyle.file}`}>
              <label htmlFor="file_url">첨부파일</label>
              <input type="file" onChange={handleAttachFileChange2} />
            </div>
            <div className="btn-container">
              <button
                type="button"
                className="btn btn-back btn-standard"
                onClick={goToDriverList}
              >
                뒤로가기
              </button>
              <button className="btn btn-add btn-standard" type="submit">
                {editDriver ? "수정하기" : "등록하기"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default DriverRegistration;
