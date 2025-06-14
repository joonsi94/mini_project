import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "antd";
import supabase from "../../lib/supabase.js";
import "../../css/layout.css";
import "../../css/ui.css";
import "../../css/Event.css";
// import "antd/dist/reset.css";

function EventList() {
  const [events, setEvents] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const navigate = useNavigate();

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("withgo_event")
      .select("*")
      .order("date", { ascending: false });
    if (error) {
      console.error("이벤트 로드 실패:", error);
    } else {
      setEvents(data);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const formatDate = (dateStr) => new Date(dateStr).toISOString().split("T")[0];

  const handleCheckboxChange = (id) => {
    setSelectedEvents((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedEvents(events.map((ev) => ev.id));
    } else {
      setSelectedEvents([]);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm("선택한 이벤트를 삭제하시겠습니까?")) return;

    const { error } = await supabase
      .from("withgo_event")
      .delete()
      .in("id", selectedEvents);

    if (error) {
      alert("삭제 중 오류 발생");
    } else {
      setEvents(events.filter((ev) => !selectedEvents.includes(ev.id)));
      setSelectedEvents([]);
      alert("선택한 이벤트가 삭제되었습니다");
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus =
      currentStatus === "이벤트 진행중" ? "이벤트 종료" : "이벤트 진행중";
    const { error } = await supabase
      .from("withgo_event")
      .update({ status: newStatus })
      .eq("id", id); 
    if (!error) {
      fetchEvents();
    }
  };

  return (
    <div className="main">
      <div className="header">이벤트 · 프로모션 관리</div>
      <div className="card">
        <div className="title">이벤트 리스트</div>
        <div className="table-wrapper">
          <table className="event-table common-table">
            <thead>
              <tr>
                <th>
                  <Checkbox
                    onChange={handleSelectAll}
                    checked={
                      selectedEvents.length === events.length &&
                      events.length > 0
                    }
                    indeterminate={
                      selectedEvents.length > 0 &&
                      selectedEvents.length < events.length
                    }
                  />
                </th>
                <th className="event-col-title">제목</th>
                <th className="event-col-date">날짜</th>
                <th className="event-col-link">링크</th>
                <th className="event-col-status">상태</th>
                <th className="event-col-actions">관리</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr
                  key={event.id}
                  className={
                    event.status === "이벤트 진행중" ? "event-active-row" : ""
                  }
                >
                  <td>
                    <Checkbox
                      checked={selectedEvents.includes(event.id)}
                      onChange={() => handleCheckboxChange(event.id)}
                    />
                  </td>
                  <td className="event-col-title">{event.title}</td>
                  <td>{formatDate(event.date)}</td>
                  <td>
                    <a
                      href={event.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      상세보기 →
                    </a>
                  </td>
                  <td>
                    <button
                      className={`btn-best ${
                        event.status === "이벤트 진행중" ? "orange" : "blue"
                      }`}
                      onClick={() => toggleStatus(event.id, event.status)}
                    >
                      {event.status === "이벤트 진행중"
                        ? "이벤트 진행중"
                        : "이벤트 종료"}
                    </button>
                  </td>
                  <td className="event-col-actions">
                    <button
                      className="btn btn-edit"
                      onClick={() => navigate(`/event-edit/${event.id}`)}
                    >
                      수정
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer bottom-right-btn">
          {selectedEvents.length > 0 && (
            <button className="btn btn-delete" onClick={handleBulkDelete}>
              선택 삭제 ({selectedEvents.length})
            </button>
          )}
          <button
            className="btn btn-add-confirm"
            onClick={() => navigate("/event-add")}
          >
            새 이벤트 등록
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventList;
