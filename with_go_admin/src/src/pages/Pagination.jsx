import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

function Pagination({ currentPage2, totalPages2, setCurrentPage2 }) {
  const goToFirstGroup2 = () => setCurrentPage2(1);
  const goToPrevPage2 = () => setCurrentPage2((prev) => Math.max(prev - 1, 1));
  const goToNextPage2 = () => setCurrentPage2((prev) => Math.min(prev + 1, totalPages2));
  const pageNumbers2 = Array.from({ length: totalPages2 }, (_, i) => i + 1);

  return (
    <div className="pagination2">
      <button className="arrow-btn2" onClick={goToFirstGroup2} disabled={currentPage2 === 1}>
        <FontAwesomeIcon icon={faAnglesLeft} />
      </button>
      <button className="arrow-btn2" onClick={goToPrevPage2} disabled={currentPage2 === 1}>
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>

      {pageNumbers2.map((page) => (
        <button
          key={page}
          onClick={() => setCurrentPage2(page)}
          className={`page-btn2 ${currentPage2 === page ? "active" : ""}`}
        >
          {page}
        </button>
      ))}

      <button className="arrow-btn2" onClick={goToNextPage2} disabled={currentPage2 === totalPages2}>
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    </div>
  );
}

export default Pagination;