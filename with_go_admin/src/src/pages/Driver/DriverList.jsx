import React, { useState, useEffect } from "react";
import DlStyle from "../../css/DriverList.module.css";
import LookupSearch from "../../components/LookupSearch2.jsx";
import { Checkbox, Input } from "antd";
import { supabase } from "../../lib/supabase.js";
import DriverListRow from "../../components/DriverListRow.jsx";
import DriverListModal from "./DriverListModal.jsx";
import Pagination from "../../layouts/Pagination.jsx";
import { SearchOutlined } from "@ant-design/icons";

function DriverList() {
  const [drivers, setDrivers] = useState([]);
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [searchTerm3, setSearchTerm3] = useState("");
  const [inputValue, setInputValue] = useState("");

  const [selectedDriver, setSelectedDriver] = useState(null);
  const [currentPage3, setCurrentPage3] = useState(1);
  const usersPerPage3 = 5;

  const fetchDrivers = async () => {
    const { data, error } = await supabase
      .from("DriverList")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("데이터 불러오기 실패:", error.message);
    } else {
      setDrivers(data);
    }
  };

  useEffect(() => {
    fetchDrivers();

    const subscription = supabase
      .channel("driver_list_changes")
      .on(
        "postgres_changes",
        {
          event: "*", //
          schema: "public",
          table: "DriverList",
        },
        () => {
          fetchDrivers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleAllCheck = (e) => {
    const checked = e.target.checked;
    setIsAllChecked(checked);
    if (checked) {
      setSelectedDrivers((prev) => [
        ...prev,
        ...currentDrivers
          .filter((driver) => !prev.includes(driver.id))
          .map((driver) => driver.id),
      ]);
    } else {
      setSelectedDrivers((prev) =>
        prev.filter((id) => !currentDrivers.some((driver) => driver.id === id))
      );
    }
  };

  const handleDriverCheck = (e, driverId) => {
    const checked = e.target.checked;
    if (checked) {
      setSelectedDrivers([...selectedDrivers, driverId]);
    } else {
      setSelectedDrivers(selectedDrivers.filter((id) => id !== driverId));
    }
  };

  const filteredDrivers = drivers.filter((driver) => {
    if (!searchTerm3) return true;
    return (
      driver.name.toLowerCase().includes(searchTerm3.toLowerCase()) ||
      driver.driver_id.toLowerCase().includes(searchTerm3.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchTerm3.toLowerCase()) ||
      driver.phone.toLowerCase().includes(searchTerm3.toLowerCase()) ||
      driver.address.toLowerCase().includes(searchTerm3.toLowerCase())
    );
  });

  const handleSearch3 = (value) => {
    setSearchTerm3(value);
    setCurrentPage3(1);
    setSelectedDrivers([]);
  };

  const DeleteSelected = async () => {
    if (!window.confirm("선택한 기사를 삭제하시겠습니까?")) return;

    try {
      const { error } = await supabase
        .from("DriverList")
        .delete()
        .in("id", selectedDrivers);

      if (error) {
        console.error(error);
        alert("삭제 중 오류가 발생했습니다.");
        return;
      }

      setDrivers(
        drivers.filter((driver) => !selectedDrivers.includes(driver.id))
      );
      setSelectedDrivers([]);
      alert("삭제 완료되었습니다.");
    } catch (err) {
      console.error(err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // 현재 페이지에 맞는 데이터를 필터링
  const currentDrivers = filteredDrivers.slice(
    (currentPage3 - 1) * usersPerPage3,
    currentPage3 * usersPerPage3
  );

  useEffect(() => {
    setIsAllChecked(
      currentDrivers.length > 0 &&
        currentDrivers.every((driver) => selectedDrivers.includes(driver.id))
    );
  }, [currentDrivers, selectedDrivers]);

  const openModal = (driver) => {
    setSelectedDriver(driver);
  };

  const closeModal = () => {
    setSelectedDriver(null);
  };

  const handlePageChange4 = (page) => {
    setCurrentPage3(page);
    setSelectedDrivers([]); // ✅ 페이지 변경 시 선택 초기화
  };

  const totalPages3 = Math.ceil(filteredDrivers.length / usersPerPage3);

  return (
    <>
      <div className="main">
        <div className={DlStyle.DL_top}>기사 관리</div>
        <div className={`${DlStyle.DL_main} ${DlStyle.card}`}>
          <div className={DlStyle.MainTop}>
            <h3>기사 목록</h3>
            <div>
              <Input.Search
                placeholder="기사 검색"
                allowClear
                enterButton={
                  <span>
                    <SearchOutlined style={{ marginRight: 4 }} />
                    검색
                  </span>
                }
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onSearch={handleSearch3}
                className="search-input default-style"
              />
            </div>
          </div>
          <div className={DlStyle.dtable}>
            <table>
              <colgroup>
                <col style={{ width: "2%" }} />
                <col style={{ width: "2%" }} />
                <col style={{ width: "4%" }} />
                <col style={{ width: "4%" }} />
                <col style={{ width: "4%" }} />
                <col style={{ width: "3%" }} />
                <col style={{ width: "4%" }} />
                <col style={{ width: "5%" }} />
                <col style={{ width: "5%" }} />
                <col style={{ width: "4%" }} />
                <col style={{ width: "4%" }} />
              </colgroup>
              <thead>
                <tr className={DlStyle.headtr}>
                  <th className={DlStyle.th_first}>
                    <Checkbox
                      onChange={handleAllCheck}
                      checked={isAllChecked}
                    />
                  </th>
                  <th>순번</th>
                  <th>사진</th>
                  <th>아이디</th>
                  <th>이름</th>
                  <th>생년월일</th>
                  <th>성별</th>
                  <th>연락처</th>
                  <th>이메일</th>
                  <th>첨부파일</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {currentDrivers.length > 0 ? (
                  currentDrivers.map((driver) => {
                    const orderNum =
                      drivers.length -
                      drivers.findIndex((d) => d.id === driver.id);

                    return (
                      <DriverListRow
                        key={driver.id}
                        driver={{ ...driver, orderNum }}
                        isChecked={selectedDrivers.includes(driver.id)}
                        onDriverCheck={(e) => handleDriverCheck(e, driver.id)}
                        onDriverClick={() => openModal(driver)}
                      />
                    );
                  })
                ) : (
                  <tr>
                    <td className={DlStyle.falsetd} colSpan="11">
                      등록된 기사가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className={DlStyle.delete}>
            {selectedDrivers.length > 0 && (
              <button className={DlStyle.btn_delete} onClick={DeleteSelected}>
                <span>선택 삭제</span> ({selectedDrivers.length})
              </button>
            )}
          </div>
          <Pagination
            currentPage2={currentPage3}
            totalPages2={totalPages3}
            setCurrentPage2={handlePageChange4}
          />
        </div>
      </div>
      <DriverListModal
        visible={!!selectedDriver}
        driver={selectedDriver}
        onCancel={closeModal}
      />
    </>
  );
}

export default DriverList;
