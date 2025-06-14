import React, { useState, useEffect } from "react";
import { MemberlistUser } from "../pages/MemberlistUser";
import "../css/Memberlist.css";
import Pagination from "./pagination.jsx";
import LookupSearch from "./LookupSearch.jsx";
import UserList from "./UserList.jsx";
import { Checkbox } from "antd";
import supabaseRole from "../lib/supabaserole.js";

function Memberlist() {
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const [searchTerm2, setSearchTerm2] = useState("");
  const [currentPage2, setCurrentPage2] = useState(1);
  const usersPerPage2 = 10;

  const indexOfLastUser2 = currentPage2 * usersPerPage2;
  const indexOfFirstUser2 = indexOfLastUser2 - usersPerPage2;
  const currentUsers2 = users
    .filter((user) => {
      if (!searchTerm2) return true;
      const displayName =
        user.user_metadata && user.user_metadata.name === "-"
          ? "설정 안함"
          : user.user_metadata?.name || "-";
      return (
        displayName.toLowerCase().includes(searchTerm2.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm2.toLowerCase())
      );
    })
    .slice(indexOfFirstUser2, indexOfLastUser2);

  const totalPages2 = Math.ceil(users.length / usersPerPage2);

  const handleSearch2 = (value) => {
    setSearchTerm2(value);
    setCurrentPage2(1);
    setSelectedIds([]);
  };

  useEffect(() => {
    const getUsers = async () => {
      const { data, error } = await MemberlistUser();
      if (error) return;

      const sortedData2 = data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
  
      setUsers(sortedData2);
    };

    getUsers();
  }, []);

  const noResultsMessage =
    currentUsers2.length === 0 && searchTerm2 !== "" ? (
      <tr>
        <td colSpan="7" style={{ textAlign: "center" }}>
          일치하는 회원이 없습니다.
        </td>
      </tr>
    ) : null;

  const checkbox = (checked) => {
    if (checked) {
      setSelectedIds(currentUsers2.map((user) => user.id));
    } else {
      setSelectedIds([]);
    }
  };

   const deleteUser = async (userId) => {
    const { error } = await supabaseRole.auth.admin.deleteUser(userId);
    if (error) {
      console.error("삭제 실패:", error);
      throw error;
    }
    console.log("사용자 삭제 완료");
  };

  const DeleteSelected = async () => {
    if (!window.confirm('선택한 회원을 삭제하시겠습니까?')) return;

    try {
      for (const userId of selectedIds) {
        await deleteUser(userId);
      }

      setUsers(users.filter((user) => !selectedIds.includes(user.id)));
      setSelectedIds([]);
      alert('삭제 완료되었습니다.');
    } catch (err) {
      console.error(err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      <div className="content2">
        <div className="Memberlist_top">
          <h1>회원 목록</h1>
        </div>
        <div className="Memberlist_content card">
          <div className="Memberlist_search">
            <LookupSearch
              onSearch={handleSearch2}
              placeholder="검색어를 입력하세요"
            />
          </div>
          <table>
            <colgroup>
              <col style={{ width: "1%" }} />
              <col style={{ width: "1%" }} />
              <col style={{ width: "3%" }} />
              <col style={{ width: "5%" }} />
              <col style={{ width: "2%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "4%" }} />
            </colgroup>
            <thead>
              <tr>
                <th className="th_first">
                  <Checkbox
                    onChange={(e) => checkbox(e.target.checked)}
                    checked={
                      currentUsers2.length > 0 &&
                      currentUsers2.every((user) =>
                        selectedIds.includes(user.id)
                      )
                    }
                  />
                </th>
                <th>순번</th>
                <th>성함</th>
                <th>Email</th>
                <th>회원 구분</th>
                <th>최초 가입일</th>
                <th>마지막 로그인</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers2.map((user, index) => (
                <UserList
                  key={user.id}
                  user={user}
                  index={index}
                  indexOfFirstUser2={indexOfFirstUser2}
                  selectedIds={selectedIds}
                  setSelectedIds={setSelectedIds}
                  totalUsers={users.length}
                />
              ))}
              {noResultsMessage}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="7">
                  <div className="foot_btn">
                    {selectedIds.length > 0 && (
                      <button
                        className="btn_delete"
                        onClick={DeleteSelected}
                      >
                        선택 삭제 ({selectedIds.length})
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
          <Pagination
            currentPage2={currentPage2}
            totalPages2={totalPages2}
            setCurrentPage2={setCurrentPage2}
          />
        </div>
      </div>
    </>
  );
}

export default Memberlist;
