import React, { useEffect, useState } from "react";
import custody from "../assets/Icon/custody.svg";
import delivery from "../assets/Icon/delivery.svg";
import AdminStyle from "../css/Admin.module.css";
import supabase from "../lib/supabase.js";
import { SearchOutlined } from "@ant-design/icons";

import Lookup from "../../src/layouts/Lookup.jsx";
import { Radio, Input } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAnglesLeft,
  faChevronLeft,
  faChevronRight,
  faAnglesRight,
} from "@fortawesome/free-solid-svg-icons";

function Admin() {
  const selectOptions = {
    배송: ["접수", "배송중", "완료", "취소"],
    보관: ["접수", "보관중", "완료", "취소"],
  };

  const [deliveryt, setdelivery] = useState([]);
  const [storage, setstorage] = useState([]);
  const [twoData, settwoData] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusLogs, setStatusLogs] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [canceledPrice, setCanceledPrice] = useState(0);
  const actualPayment = totalPrice - canceledPrice;
  const [filterType, setFilterType] = useState("");
  const [completeCount, setCompleteCount] = useState(0);
  const [cancelCount, setCancelCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [todayDeliveryCount, setTodayDeliveryCount] = useState(0);
  const [todayStorageCount, setTodayStorageCount] = useState(0);

  const today = new Date();
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(today);
  const todayStr = `${parts.find((p) => p.type === "year").value}-${
    parts.find((p) => p.type === "month").value
  }-${parts.find((p) => p.type === "day").value}`;

  const [openRow, setOpenRow] = useState(null);

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const toggleRow = async (index, item) => {
    const newOpenRow = openRow === index ? null : index;
    setOpenRow(newOpenRow);

    if (newOpenRow !== null) {
      const tableName = item.type === "배송" ? "delivery" : "storage";
      const keyValue =
        item[tableName === "delivery" ? "re_num" : "reservation_number"];

      const userName = sessionStorage.getItem("name") || "알 수 없음";

      const { data, error } = await supabase
        .from("status_logs")
        .select("*")
        .eq("key_value", keyValue)
        .order("updated_at", { ascending: true });

      if (error) {
        console.error("로그 가져오기 실패", error);
        return;
      }
      if (data.length === 0) {
        const reserveTime = item.reserve_time || item.reservation_time;

        const { error: logError } = await supabase.from("status_logs").insert([
          {
            table_name: tableName,
            key_value: keyValue,
            prev_status: "접수",
            new_status: "접수",
            updated_at: reserveTime,
            received_at: reserveTime,
            operator: "",
          },
        ]);

        const { data: newData, error: newError } = await supabase
          .from("status_logs")
          .select("*")
          .eq("key_value", keyValue)
          .order("updated_at", { ascending: true });

        if (newError) {
          console.error("로그 가져오기 실패", newError);
          return;
        }

        setStatusLogs((prev) => ({ ...prev, [index]: newData }));
      } else {
        setStatusLogs((prev) => ({ ...prev, [index]: data }));
      }
    }
  };

  useEffect(() => {
    const supaData = async () => {
      const { data: deliveryData, error: deliveryError } = await supabase
        .from("delivery")
        .select("*")
        .order("reserve_time", { ascending: false });

      if (deliveryError) {
        console.error("delivery Error", deliveryError);
      } else {
        setdelivery(deliveryData);
      }

      const { data: storageData, error: storageerror } = await supabase
        .from("storage")
        .select("*")
        .order("reservation_time", { ascending: false });

      if (storageerror) {
        console.error("storage error", storageerror);
      } else {
        setstorage(storageData);
      }
      const deliveryType = deliveryData.map((item) => ({
        ...item,
        type: "배송",
      }));

      const storageType = storageData.map((item) => ({
        ...item,
        type: "보관",
      }));

      const AllData = [...deliveryType, ...storageType];

      AllData.sort((a, b) =>
        (b.reservation_time || b.reserve_time)?.localeCompare(
          a.reservation_time || a.reserve_time
        )
      );
      settwoData(AllData);

      const todayDeliveryCount = deliveryData.filter(
        (item) => item.reserve_time?.slice(0, 10) === todayStr
      ).length;

      const todayStorageCount = storageData.filter(
        (item) => item.reservation_time?.slice(0, 10) === todayStr
      ).length;

      const completeCount = AllData.filter(
        (item) =>
          (item.reservation_time || item.reserve_time)?.slice(0, 10) ===
            todayStr && item.situation === "완료"
      ).length;

      const cancelCount = AllData.filter(
        (item) =>
          (item.reservation_time || item.reserve_time)?.slice(0, 10) ===
            todayStr && item.situation === "취소"
      ).length;

      const totalPrice = AllData.filter(
        (item) =>
          (item.reservation_time || item.reserve_time)?.slice(0, 10) ===
          todayStr
      ).reduce((sum, item) => sum + (item.price || 0), 0);

      const canceledPrice = AllData.filter(
        (item) =>
          (item.reservation_time || item.reserve_time)?.slice(0, 10) ===
            todayStr && item.situation === "취소"
      ).reduce((sum, item) => sum + (item.price || 0), 0);

      setTotalPrice(totalPrice);
      setCanceledPrice(canceledPrice);

      setCompleteCount(completeCount);
      setCancelCount(cancelCount);

      setTodayCount(todayDeliveryCount + todayStorageCount);
      setTodayDeliveryCount(todayDeliveryCount);
      setTodayStorageCount(todayStorageCount);
    };
    supaData();
  }, [todayStr, twoData]);

  const eChange = async (e, item) => {
    const status = e.target.value;
    const tableName = item.type === "배송" ? "delivery" : "storage";

    const keyColumn = item.type === "배송" ? "re_num" : "reservation_number";
    const keyValue = item[keyColumn];
    const prevStatus = item.situation || "접수";

    const updates = {
      situation: status,
      status_updated_at: new Date().toISOString(),
    };

    if (status === "완료") {
      updates.success_time = new Date().toISOString();
    } else {
      updates.success_time = null;
    }

    const userName = sessionStorage.getItem("name") || "알 수 없음";

    const { error } = await supabase
      .from(tableName)
      .update(updates)
      .eq(keyColumn, keyValue);

    if (error) {
      console.error(`${tableName} 업데이트 실패`, error);
      alert("업데이트 중 오류가 발생했습니다.");
      return;
    }

    const { data: existingLogs, error: logError } = await supabase
      .from("status_logs")
      .select("*")
      .eq("key_value", keyValue)
      .order("updated_at", { ascending: false });

    if (existingLogs.length === 0) {
      const reserveTime = item.reserve_time || item.reservation_time;

      const { error: logInsertError } = await supabase
        .from("status_logs")
        .insert([
          {
            table_name: tableName,
            key_value: keyValue,
            prev_status: "접수",
            new_status: "접수",
            updated_at: reserveTime,
            received_at: reserveTime,
            operator: userName,
          },
        ]);

      if (logInsertError) {
        console.error("최초 접수 로그 저장 실패", logInsertError);
      }
    }

    const { error: logStatusError } = await supabase
      .from("status_logs")
      .insert([
        {
          table_name: tableName,
          key_value: keyValue,
          prev_status: prevStatus,
          new_status: status,
          updated_at: new Date().toISOString(),
          operator: userName,
        },
      ]);

    if (logStatusError) {
      console.error("상태 변경 로그 저장 실패", logStatusError);
    }


    const { data: updatedLogs, error: updatedLogsError } = await supabase
      .from("status_logs")
      .select("*")
      .eq("key_value", keyValue)
      .order("updated_at", { ascending: true });

    if (updatedLogsError) {
      console.error("업데이트된 로그 가져오기 실패", updatedLogsError);
    } else {
      const openIndex = twoData.findIndex((i) => i[keyColumn] === keyValue);
      setStatusLogs((prev) => ({ ...prev, [openIndex]: updatedLogs }));
    }

    settwoData((prevData) =>
      prevData.map((i) =>
        i[keyColumn] === keyValue
          ? {
              ...i,
              situation: status,
              status_updated_at: new Date().toISOString(),
              success_time: status === "완료" ? new Date().toISOString() : null,
            }
          : i
      )
    );
  };

  const filteredData = twoData.filter(
    (item) => {
      const dateStr = (item.reservation_time || item.reserve_time)?.slice(
        0,
        10
      );
      const isToday = dateStr === todayStr;

      const phoneClean = item.phone.replace(/-/g, "");
      const isTypeMatch = filterType === "" || item.type === filterType;
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = item.name.toLowerCase().includes(searchLower);
      const phoneMatch = phoneClean.includes(searchLower);

      return isToday && isTypeMatch && (nameMatch || phoneMatch);
    },
    [twoData, searchTerm, filterType, todayStr]
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const goToFirstGroup = () => setCurrentPage(1);
  const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const pageNumbers =
    totalPages > 0 ? Array.from({ length: totalPages }, (_, i) => i + 1) : [1];

  return (
    <>
      <div className="main">
        <div className={AdminStyle.Admin_top}>관리자 메인</div>
        <div className={AdminStyle.Admin_content}>
          <div className={AdminStyle.top}>
            <div className={AdminStyle.left}>
              <div className={AdminStyle.left1}>
                <h3>금일 신규예약</h3>
                <p>{today.toLocaleDateString()}</p>
              </div>
              <div className={AdminStyle.left2}>
                <span className={AdminStyle.left2_1}>{todayCount}</span>
                <span className={AdminStyle.left2_2}>건</span>
              </div>
              <div className={AdminStyle.left3}>
                <div className={AdminStyle.left3_1}>
                  <img src={delivery} alt="" />
                  <h4>배송</h4>
                  <p>DELIVERY</p>
                  <span>{todayDeliveryCount}건</span>
                </div>
                <div className={AdminStyle.left3_2}>
                  <img src={custody} alt="" />
                  <h4>보관</h4>
                  <p>STORAGE</p>
                  <span>{todayStorageCount}건</span>
                </div>
              </div>
            </div>
          </div>
          <div className={AdminStyle.top2}>
            <div className={AdminStyle.center1}>
              <h3>금일배송/보관관리</h3>
              <span>{todayCount}건</span>
            </div>
            <div className={AdminStyle.center2_3}>
              <div className={AdminStyle.center2}>
                <h3>처리완료</h3>
                <span>{completeCount}건</span>
              </div>
              <div className={AdminStyle.center3}>
                <h3>취소</h3>
                <span>{cancelCount}건</span>
              </div>
            </div>
          </div>
          <div className={AdminStyle.top3}>
            <div className={AdminStyle.right1}>
              <h3>금일 실결제액</h3>
              <p>{actualPayment.toLocaleString()}원</p>
              <span>
                결제금액 {todayCount}건 {totalPrice.toLocaleString()}원
              </span>
              <span>
                결제취소 {cancelCount}건 {canceledPrice.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>
        <div className={AdminStyle.Admin_list}>
          <div className={`${AdminStyle.list} card`}>
            <div className={AdminStyle.list_up}>
              <div className={AdminStyle.list_title}>
                <h3>실시간 예약현황</h3>
              </div>
              <div className={AdminStyle.admin_search}>
                <div>
                  <Radio.Group
                    value={filterType}
                    buttonStyle="solid"
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <Radio.Button
                      value=""
                      className={AdminStyle.custom_radio_button}
                    >
                      전체
                    </Radio.Button>
                    <Radio.Button
                      value="보관"
                      className={AdminStyle.custom_radio_button}
                    >
                      보관
                    </Radio.Button>
                    <Radio.Button
                      value="배송"
                      className={AdminStyle.custom_radio_button}
                    >
                      배송
                    </Radio.Button>
                  </Radio.Group>
                </div>
                <div>
                  <Input.Search
                    placeholder="검색"
                    allowClear
                    enterButton={
                      <span>
                        <SearchOutlined style={{ marginRight: 4 }} />
                        검색
                      </span>
                    }
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onSearch={handleSearch}
                    className={`${AdminStyle.searchin} search-input default-style`}
                  />
                </div>
              </div>
            </div>
            <div className={AdminStyle.table_over}>
              <table>
                <colgroup>
                  <col style={{ width: "4%" }} />
                  <col style={{ width: "3%" }} />
                  <col style={{ width: "4%" }} />
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "11%" }} />
                  <col style={{ width: "4%" }} />
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "6%" }} />
                </colgroup>
                <thead>
                  <tr className={AdminStyle.noPointer}>
                    <th>신청일</th>
                    <th>구분</th>
                    <th>예약자명</th>
                    <th>연락처</th>
                    <th>예약기간</th>
                    <th>짐갯수</th>
                    <th>결제금액</th>
                    <th>완료일</th>
                    <th>처리현황</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems
                      .filter((item) => {
                        const dateStr = (
                          item.reservation_time || item.reserve_time
                        )?.slice(0, 10);
                        const isToday = dateStr === todayStr;
                        const isTypeMatch =
                          filterType === "" || item.type === filterType;
                        return isToday && isTypeMatch;
                      })
                      .map((item, index) => {
                        const sizes = [
                          Number(item.small) > 0 ? `S ${item.small}개` : null,
                          Number(item.medium) > 0 ? `M ${item.medium}개` : null,
                          Number(item.large) > 0 ? `L ${item.large}개` : null,
                        ].filter(Boolean);

                        const inches = [
                          Number(item.under) > 0
                            ? `26"이하 : ${item.under}개`
                            : null,
                          Number(item.over) > 0
                            ? `26"이상 : ${item.over}개`
                            : null,
                        ].filter(Boolean);

                        const luggageInfo =
                          sizes.length > 0
                            ? sizes.join(", ")
                            : inches.length > 0
                            ? inches.join(", ")
                            : "입력된 수량이 없습니다.";

                        return (
                          <React.Fragment key={index}>
                            <tr
                              className={AdminStyle.trpointer}
                              onClick={() => toggleRow(index, item)}
                            >
                              <td>
                                {item.reservation_time || item.reserve_time
                                  ? (item.reservation_time || item.reserve_time)
                                      .slice(0, 10)
                                  : "-"}
                              </td>
                              <td>{item.type}</td>
                              <td>{item.name}</td>
                              <td>{item.phone}</td>
                              <td>
                                {item.storage_start_date &&
                                item.storage_end_date
                                  ? `${item.storage_start_date} ~ ${item.storage_end_date}`
                                  : item.delivery_date
                                  ? item.delivery_date
                                  : "-"}
                              </td>
                              <td>{luggageInfo}</td>
                              <td>{`${item.price.toLocaleString()}원`}</td>
                              <td>
                                {item.situation === "완료" && item.success_time
                                  ? item.success_time
                                      .slice(0, 16)
                                      .replace("T", " ")
                                  : "-"}
                              </td>
                              <td>
                                <select
                                  className={AdminStyle.select}
                                  value={item.situation || "접수"}
                                  onChange={(e) => eChange(e, item)}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {selectOptions[item.type].map((status) => (
                                    <option key={status} value={status}>
                                      {status}
                                    </option>
                                  ))}
                                </select>
                              </td>
                            </tr>

                            {openRow === index && (
                              <tr>
                                <td colSpan="9">
                                  <div className={AdminStyle.status_details}>
                                    <div className={AdminStyle.status_log_list}>
                                      {statusLogs[index]?.length > 0 ? (
                                        <table className={AdminStyle.log_table}>
                                          <colgroup>
                                            <col style={{ width: "3%" }} />
                                            <col style={{ width: "3%" }} />
                                            <col style={{ width: "4%" }} />
                                            <col style={{ width: "4%" }} />
                                          </colgroup>
                                          <thead>
                                            <tr>
                                              <th>변경시간</th>
                                              <th>이전상태</th>
                                              <th>변경상태</th>
                                              <th>처리자</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {statusLogs[index].map(
                                              (log, logIndex) => (
                                                <tr key={logIndex}>
                                                  <td>
                                                    {(() => {
                                                      const date = new Date(
                                                        log.updated_at
                                                      );
                                                      const year =
                                                        date.getFullYear();
                                                      const month =
                                                        date.getMonth() + 1;
                                                      const day =
                                                        date.getDate();
                                                      const hour =
                                                        date.getHours();
                                                      const minute =
                                                        date.getMinutes();
                                                      const second =
                                                        date.getSeconds();
                                                      const ampm =
                                                        hour < 12
                                                          ? "오전"
                                                          : "오후";
                                                      const displayHour =
                                                        hour % 12 === 0
                                                          ? 12
                                                          : hour % 12;
                                                      return `${year}-${month}-${day} ${ampm} ${displayHour}:${minute
                                                        .toString()
                                                        .padStart(
                                                          2,
                                                          "0"
                                                        )}:${second
                                                        .toString()
                                                        .padStart(2, "0")}`;
                                                    })()}
                                                  </td>
                                                  <td>{log.prev_status}</td>
                                                  <td>{log.new_status}</td>
                                                  <td>{log.operator}</td>
                                                </tr>
                                              )
                                            )}
                                          </tbody>
                                        </table>
                                      ) : (
                                        <p>변경 이력이 없습니다.</p>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                  ) : (
                    <tr>
                      <td className={AdminStyle.falsetext} colSpan="9">
                        {searchTerm
                          ? "일치하는 접수건이 없습니다."
                          : "접수된 이력이 없습니다."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className={AdminStyle.pagination}>
              <button
                className={AdminStyle.arrow_btn}
                onClick={goToFirstGroup}
                disabled={currentPage === 1}
              >
                <FontAwesomeIcon icon={faAnglesLeft} />
              </button>
              <button
                className={AdminStyle.arrow_btn}
                onClick={goToPrevPage}
                disabled={currentPage === 1}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>

              {pageNumbers.map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`${AdminStyle.page_btn} ${
                    currentPage === page ? AdminStyle.page_btn_active : ""
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                className={AdminStyle.arrow_btn}
                onClick={goToNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Admin;
