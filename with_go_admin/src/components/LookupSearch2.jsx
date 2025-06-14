import React, { useState } from "react";
import Lookup from "../layouts/Lookup.jsx";

function LookupSearch3({ onSearch }) {
  const [searchTerm3, setSearchTerm3] = useState("");

  
  const handleSearch3 = (value) => {
    setSearchTerm3(value);
    onSearch(value);
  };

  return (
    <div className="lookup_search">
      <Lookup
        onSearch={handleSearch3}
        placeholder="검색어를 입력하세요"
      />
    </div>
  );
}

export default LookupSearch3;
