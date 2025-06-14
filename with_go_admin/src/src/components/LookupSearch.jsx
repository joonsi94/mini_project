import React, { useState } from "react";
import Lookup from "../layouts/Lookup.jsx";

function LookupSearch({ onSearch }) {
  const [searchTerm2, setSearchTerm2] = useState("");

  
  const handleSearch2 = (value) => {
    setSearchTerm2(value);
    onSearch(value);
  };

  return (
    <div className="lookup_search">
      <Lookup
        onSearch={handleSearch2}
        placeholder="검색어를 입력하세요"
      />
    </div>
  );
}

export default LookupSearch;
