import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Checkbox, Switch } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown, faAnglesLeft, faAnglesRight, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

import supabase from '../../lib/supabase.js';

import '../../css/ui.css';
import '../../css/layout.css';
import '../../css/FAQ.css';

const FAQList = ({ filterType = '', searchKeyword = '' }) => {
    const [faqs, setFaqs] = useState([]);
    const [expanded, setExpanded] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState([]);
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

    const toggleStatus = async (id, checked) => {
        const newStatus = checked ? '공개' : '숨김';
        const { error } = await supabase
            .from('withgo_faqs')
            .update({ status: newStatus })
            .eq('id', id);

        if (!error) fetchFAQs();
    };

    const paginatedFaqs = faqs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const [pageSelectedIds, setPageSelectedIds] = useState([]);

    useEffect(() => {
        setPageSelectedIds([]);
    }, [currentPage]);

    const handleSelect = (checked, id) => {
        setPageSelectedIds((prev) =>
            checked ? [...prev, id] : prev.filter((item) => item !== id)
        );
    };

    const handleDeleteSelected = async () => {
        if (!window.confirm('선택한 FAQ를 삭제하시겠습니까?')) return;
        const { error } = await supabase
            .from('withgo_faqs')
            .delete()
            .in('id', pageSelectedIds);

        if (!error) {
            setFaqs(faqs.filter((faq) => !pageSelectedIds.includes(faq.id)));
            setPageSelectedIds([]);
            alert('삭제 완료되었습니다!');
        }
    };

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
                            <th className="faq-col-select">
                                <Checkbox
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        const ids = paginatedFaqs.map((item) => item.id);
                                        setPageSelectedIds(checked ? ids : []);
                                    }}
                                    checked={pageSelectedIds.length === paginatedFaqs.length && paginatedFaqs.length > 0}
                                />
                            </th>
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
                                <td>
                                    <Checkbox
                                        onChange={(e) => handleSelect(e.target.checked, item.id)}
                                        checked={pageSelectedIds.includes(item.id)}
                                    />
                                </td>
                                <td>{item.category}</td>
                                <td className="faq-col-title">{item.question}</td>
                                <td className="faq-col-content">
                                    <span
                                        className={`answer-toggle ${expanded === item.id ? 'open' : ''}`}
                                        onClick={() => toggleExpand(item.id)}
                                    >
                                        {expanded === item.id
                                            ? item.answer.replace(/<br\s*\/?>/gi, ' ')
                                            : (item.answer?.replace(/<br\s*\/?>/gi, ' ') || '').substring(0, 50) + (item.answer?.replace(/<br\s*\/?>/gi, ' ').length > 50 ? '...' : '')
                                        }
                                    </span>
                                </td>
                                <td>
                                    <Switch
                                        checked={item.status === '공개'}
                                        onChange={(checked) => toggleStatus(item.id, checked)}
                                    />
                                </td>
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
                {pageSelectedIds.length > 0 && (
                    <button className="btn btn-delete" onClick={handleDeleteSelected}>
                        선택 삭제 ({pageSelectedIds.length})
                    </button>
                )}
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