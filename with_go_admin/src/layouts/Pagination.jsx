import React from "react";
import MemberStyle from "../css/Memberlist.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAnglesLeft,
  faChevronLeft,
  faChevronRight,
  faAnglesRight,
} from "@fortawesome/free-solid-svg-icons";

function Pagination({ currentPage2, totalPages2, setCurrentPage2 }) {
  const goToFirstGroup2 = () => setCurrentPage2(1);
  const goToPrevPage2 = () => setCurrentPage2((prev) => Math.max(prev - 1, 1));
  const goToNextPage2 = () =>
    setCurrentPage2((prev) => Math.min(prev + 1, totalPages2));
  const goToLastGroup2 = () => {
    const nextGroupFirstPage =
      Math.floor(currentPage2 / pagesPerGroup) * pagesPerGroup + 1;

    if (nextGroupFirstPage < totalPages2) {
      setCurrentPage2(nextGroupFirstPage);
    } else {
      setCurrentPage2(totalPages2);
    }
  };

  const pagesPerGroup = 10;

  const pageNumbers2 = Array.from({ length: totalPages2 }, (_, i) => i + 1);

  return (
    <div className={MemberStyle.pagination2}>
      <button
        className={MemberStyle.arrow_btn2}
        onClick={goToFirstGroup2}
        disabled={currentPage2 === 1}
      >
        <FontAwesomeIcon icon={faAnglesLeft} />
      </button>
      <button
        className={MemberStyle.arrow_btn2}
        onClick={goToPrevPage2}
        disabled={currentPage2 === 1}
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>

      {pageNumbers2.map((page) => (
        <button
          key={page}
          onClick={() => setCurrentPage2(page)}
        //   className={`${MemberStyle.page_btn2} ${currentPage2 === page ? MemberStyle.page_btn2_active : ""
        //     }`}
        // >

          className={`${MemberStyle.page_btn2} ${
            currentPage2 === page ? MemberStyle.page_btn2_active : ""
          }`}
        >
          {page}
        </button>
      ))}

      <button
        className={MemberStyle.arrow_btn2}
        onClick={goToNextPage2}
        disabled={currentPage2 === totalPages2}
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
      <button
        className={MemberStyle.arrow_btn2}
        onClick={goToLastGroup2}
        disabled={currentPage2 === totalPages2 || totalPages2 <= 10}
      >
        <FontAwesomeIcon icon={faAnglesRight} />
      </button>
    </div>
  );
}

export default Pagination;
