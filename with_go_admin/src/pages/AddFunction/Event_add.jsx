 import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons";
import supabase from "../../lib/supabase.js";
import "../../css/layout.css";
import "../../css/ui.css";
import "../../css/Event.css";

function EventAdd() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    link_url: "",
    status: "이벤트 진행중",
    img_url: "",
  });

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const newFile = e.target.files[0];
    setFile(newFile);
    setPreviewUrl(URL.createObjectURL(newFile));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    let uploadedUrl = null;
  
    if (file) {
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `event-images/${fileName}`;
  
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file);
  
      if (uploadError) {
        alert("이미지 업로드 실패");
        return;
      }
  
      const { data: publicData } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);
  
      if (!publicData || !publicData.publicUrl) {
        alert("이미지 URL 가져오기 실패 ");
        return;
      }
  
      uploadedUrl = publicData.publicUrl;
    }
  
    const { error } = await supabase.from("withgo_event").insert([
      {
        title: formData.title,
        date: formData.date,
        link_url: formData.link_url,
        status: formData.status,
        img_url: uploadedUrl, 
      },
    ]);
  
    if (error) {
      alert("이벤트 등록 실패");
      console.error(error); 
    } else {
      alert("이벤트가 등록되었습니다");
      navigate("/event");
    }
  };

  return (
    <div className="main">
      <div className="header">이벤트 등록</div>
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
            <label>날짜</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>유튜브 링크</label>
            <input
              type="text"
              name="link_url"
              value={formData.link_url}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>이미지 첨부</label>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {previewUrl && (
              <div style={{ marginTop: "10px" }}>
                <img
                  src={previewUrl}
                  alt="미리보기"
                  style={{ maxWidth: "200px", borderRadius: "6px" }}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>상태</label>
            <div className="custom-select-wrapper">
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="이벤트 진행중">이벤트 진행중</option>
                <option value="이벤트 종료">이벤트 종료</option>
              </select>
              <FontAwesomeIcon icon={faArrowDown} className="select-icon" />
            </div>
          </div>

          <div className="form-button-wrapper">
            <button
              type="button"
              className="btn btn-back"
              onClick={() => navigate(-1)}
            >
              뒤로가기
            </button>
            <button type="submit" className="btn btn-add-confirm">
              등록 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventAdd;
