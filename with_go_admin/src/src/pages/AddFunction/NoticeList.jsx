import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Checkbox } from 'antd';
import supabase from '../../lib/supabase.js';
import '../../css/layout.css';
import '../../css/ui.css';
import '../../css/NoticePromotion.css';

function NoticePromotion() {
  const [notices, setNotices] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    const { data, error } = await supabase
      .from('withgo_notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setNotices(data);
  };

  const handleSelect = (checked, id) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(notices.map((n) => n.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm('선택한 공지사항을 삭제하시겠습니까?')) return;

    const { error } = await supabase
      .from('withgo_notifications')
      .delete()
      .in('id', selectedIds);

    if (!error) {
      setNotices(notices.filter((n) => !selectedIds.includes(n.id)));
      setSelectedIds([]);
      alert('삭제 완료!');
    }
  };

  return (
    <div className="main">
      <div className="header">공지사항 관리</div>
      <div className="card">
        <div className="title">공지사항 리스트</div>
        <div className="table-wrapper">
        <table className="notice-table common-table">
          <thead>
            <tr>
              <th>
                <Checkbox
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  checked={selectedIds.length === notices.length && notices.length > 0}
                  indeterminate={
                    selectedIds.length > 0 && selectedIds.length < notices.length
                  }
                />
              </th>
              <th className="notice-col-title">제목</th>
              <th className="notice-col-content">내용</th>
              <th className="notice-col-date">작성일</th>
              <th className="notice-col-actions">관리</th>
            </tr>
          </thead>
          <tbody>
            {notices.map((item) => (
              <tr key={item.id}>
                <td>
                  <Checkbox
                    checked={selectedIds.includes(item.id)}
                    onChange={(e) => handleSelect(e.target.checked, item.id)}
                  />
                </td>
                <td className="notice-col-title">{item.title}</td>
                <td className="notice-col-content">
                  <div
                    className={`notice-toggle-box ${expanded === item.id ? 'open' : ''}`}
                    onClick={() =>
                      setExpanded(expanded === item.id ? null : item.id)
                    }
                  >
                    {expanded === item.id
                      ? item.content || '(내용 없음)'
                      : (item.content || '').slice(0, 40) +
                        (item.content?.length > 40 ? '...' : '')}
                  </div>
                </td>
                <td>{item.created_at?.split('T')[0]}</td>
                <td className="notice-col-actions">
                  <button
                    className="btn btn-edit"
                    onClick={() => navigate(`/notice-edit/${item.id}`)}
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
          {selectedIds.length > 0 && (
            <button className="btn btn-delete" onClick={handleDeleteSelected}>
              선택 삭제 ({selectedIds.length})
            </button>
          )}
          <button
            className="btn btn-add-confirm"
            onClick={() => navigate('/notice-add')}
          >
            새 공지 등록
          </button>
        </div>
      </div>
    </div>
  );
}

export default NoticePromotion;
