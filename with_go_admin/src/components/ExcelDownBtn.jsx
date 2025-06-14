import React from "react";
import * as XLSX from "xlsx";
import { Button } from "antd";
import excelIcon from "../assets/Icon/excelicon.svg";
import AdminStyle from "../css/Admin.module.css";

const ExcelDownBtn = ({ data, filename = "제목없음.xlsx" }) => {
  const handleExport = () => {
    if (!data || data.length === 0) {
      alert("다운로드할 데이터가 없습니다.");
      return;
    }

    const exportData = data.map((item) => ({
      신청일: (item.reservation_time || item.reserve_time || "").slice(0, 10),
      구분: item.type,
      예약자명: item.name,
      연락처: item.phone,
      예약기간: item.storage_start_date
        ? `${item.storage_start_date} ~ ${item.storage_end_date}`
        : item.delivery_date || "-",
      짐갯수: `S:${item.small} / M:${item.medium} / L:${item.large}`,
      결제금액: item.price,
      완료일:
        item.situation === "완료" && item.success_time
          ? item.success_time.slice(0, 16).replace("T", " ")
          : "-",
      처리현황: item.situation || "접수",
    }));

    const sheetData = [
      Object.keys(exportData[0]), // 헤더
      ...exportData.map((row) => Object.values(row)), // 데이터
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // 열 너비 자동 설정
    worksheet["!cols"] = Object.keys(exportData[0]).map((key) => {
      const max = Math.max(
        key.length,
        ...exportData.map((row) => (row[key] ? String(row[key]).length : 0))
      );
      return { wch: max + 2 };
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, filename);
  };

  return (
    <Button className={AdminStyle.excelbtn} onClick={handleExport}>
      <img className={AdminStyle.excelimg} src={excelIcon} alt="excel" />
    </Button>
  );
};

export default ExcelDownBtn;
