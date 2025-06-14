import React, {useEffect} from "react";
import {Checkbox, message} from "antd";
import DlStyle from "../css/DriverList.module.css";
import { useNavigate } from "react-router-dom";

function DriverListRow({
  driver,
  index,
  isChecked,
  onDriverCheck,
  onDriverClick,
}) {
  const navigate = useNavigate();

  const handleEditClick2 = (e) => {
      const res = sessionStorage.getItem("role");
      if (res !== '관리자') {
          message.error('권한이 없습니다!');
          return;
      }
    e.stopPropagation();
    navigate("/DriverRegistration", { state: { driver } });
  };

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onDriverCheck(e);
  };

  const handleFileClick = (e) => {
    e.stopPropagation();
  };

  const handleRowClick = (e) => {
    const ignoredTds = ["tdCenter", "noPointer"];
    const targetTd = e.target.closest("td");

    if (
      targetTd &&
      ignoredTds.some((className) =>
        targetTd.classList.contains(DlStyle[className])
      )
    ) {
      return;
    }

    if (e.target.closest('input[type="checkbox"]') || e.target.closest("a") || e.target.closest("button")) {
      return;
    }

    onDriverClick();
  };

  return (
    <tr key={driver.id} onClick={handleRowClick} className={DlStyle.rowtr}>
      <td className={DlStyle.noPointer}>
        <Checkbox checked={isChecked} onChange={handleCheckboxClick} />
      </td>
      <td>{driver.orderNum}</td>
      <td className={DlStyle.tdCenter}>
        {driver.photo_url ? (
          <img src={driver.photo_url} alt="기사사진" width="100" />
        ) : (
          "없음"
        )}
      </td>
      <td>{driver.driver_id}</td>
      <td>{driver.name}</td>
      <td>{driver.birthday}</td>
      <td>{driver.gender}</td>
      <td>
        {driver.phone
          ? driver.phone.length === 11
            ? driver.phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3")
            : driver.phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")
          : "없음"}
      </td>
      <td>{driver.email}</td>
      <td className={DlStyle.noPointer}>
        {driver.file_url ? (
          <a
            href="#"
            onClick={async (e) => {
              e.preventDefault();

              const response = await fetch(driver.file_url);
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);

              const link = document.createElement("a");
              link.href = url;
              link.download = driver.file_url.split("/").pop();
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);

              window.URL.revokeObjectURL(url);
            }}
          >
            <span className={DlStyle.tdfile}>💾</span>
          </a>
        ) : (
          "없음"
        )}
      </td>
      <td className={DlStyle.noPointer}>
        <button className="btn btn-edit" onClick={handleEditClick2}>
          수정
        </button>
      </td>
    </tr>
  );
}

export default DriverListRow;
