import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Checkbox, Switch } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChevronUp, faChevronDown,
    faAnglesLeft, faAnglesRight,
    faChevronLeft, faChevronRight
} from '@fortawesome/free-solid-svg-icons';

import supabase from '../../lib/supabase.js';

import '../../css/ui.css';
import '../../css/layout.css';
import '../../css/FAQ.css';

const FAQList = ({ filterType = '', searchKeyword = '' }) => {
    const [faqs, setFaqs] = useState([]);
    const [expanded, setExpanded] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();
    const itemsPerPage = 7;

    useEffect(() => {
        fetchFAQs();
    }, [filterType, searchKeyword]);

    const fetchFAQs = async () => {
        let query = supabase.from('withgo_faqs').select('*');

        if (filterType) query = query.eq('type', filterType);
        if (searchKeyword) query = query.ilike('question', `%${searchKeyword}%`);

        const { data, error } = await query.order('created_at', { ascending: false });
        if (!error) setFaqs(data);
    };

    const toggleExpand = (id) => {
        setExpanded((prev) => (prev === id ? null : id));
    };

    const paginatedFaqs = faqs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(faqs.length / itemsPerPage);
    const groupSize = 7;
    const currentGroup = Math.floor((currentPage - 1) / groupSize);
    const startPage = currentGroup * groupSize + 1;
    const endPage = Math.min(startPage + groupSize - 1, totalPages);

    return (
        <div className="faq-list-wrapper">
            <div className="table-wrapper">
                <table className="faq-table common-table">
                    <thead>
                    <tr>
                        <th className="faq-col-select"><Checkbox /></th>
                        <th className="faq-col-type">구분</th>
                        <th className="faq-col-title">질문</th>
                        <th className="faq-col-content">답변</th>
                        <th className="faq-col-status">공개여부</th>
                        <th className="faq-col-date">작성일</th>
                        <th className="faq-col-actions">관리</th>
                    </tr>
                    </thead>
                    <tbody>
                    {paginatedFaqs.map((item) => (
                        <tr key={item.id}>
                            <td><Checkbox /></td>
                            <td>{item.category}</td>
                            <td className="faq-col-title">{item.question}</td>
                            <td className="faq-col-content">
                  <span
                      className={`answer-toggle ${expanded === item.id ? 'open' : ''}`}
                      onClick={() => toggleExpand(item.id)}
                      dangerouslySetInnerHTML={{
                          __html:
                              expanded === item.id
                                  ? item.answer
                                  : item.answer?.replace(/<br\s*\/?>/gi, ' ')
                      }}
                  ></span>
                            </td>
                            <td><Switch checked={item.status === '공개'} /></td>
                            <td>{item.created_at?.slice(0, 10)}</td>
                            <td>
                                <button
                                    className="btn btn-edit"
                                    onClick={() => navigate(`/faq-edit/${item.id}`)}
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
                <button
                    className="btn btn-add-event"
                    onClick={() => navigate('/faq-add')}
                >
                    새 FAQ 등록
                </button>
            </div>

            <div className="pagination-wrapper">
                <div className="pagination">
                    <button className="group-btn" onClick={() => setCurrentPage(1)} disabled={currentGroup === 0}>
                        <FontAwesomeIcon icon={faAnglesLeft} />
                    </button>
                    <button className="arrow-btn" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    {Array.from({ length: endPage - startPage + 1 }).map((_, i) => {
                        const pageNum = startPage + i;
                        return (
                            <button
                                key={pageNum}
                                className={`page-btn ${pageNum === currentPage ? 'active' : ''}`}
                                onClick={() => setCurrentPage(pageNum)}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                    <button className="arrow-btn" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                    <button className="group-btn" onClick={() => setCurrentPage(endPage + 1)} disabled={endPage === totalPages}>
                        <FontAwesomeIcon icon={faAnglesRight} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FAQList;
