import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Checkbox } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faAnglesLeft, faAnglesRight,
    faChevronLeft, faChevronRight
} from '@fortawesome/free-solid-svg-icons';

import supabase from '../../lib/supabase.js';
import '../../css/layout.css';
import '../../css/ui.css';
import '../../css/inquiry.css';

const InquiryList = ({ filterType = '', searchKeyword = '' }) => {
    const [inquiries, setInquiries] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [expanded, setExpanded] = useState(null);
    const navigate = useNavigate();
    const itemsPerPage = 7;

    useEffect(() => {
        fetchInquiries();
    }, [filterType, searchKeyword]);

    const fetchInquiries = async () => {
        let query = supabase.from('question').select('*');
        if (filterType) query = query.eq('type', filterType);
        if (searchKeyword) query = query.ilike('question_txt', `%${searchKeyword}%`);
        const { data, error } = await query.order('text_num', { ascending: false });
        if (!error) setInquiries(data || []);
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        const ids = currentItems.map(i => i.text_num);
        setSelectedIds(prev => prev.length === ids.length ? [] : ids);
    };

    const handleDeleteSelected = async () => {
        if (!window.confirm('선택한 항목을 삭제할까요?')) return;
        await supabase.from('question').delete().in('text_num', selectedIds);
        setInquiries(inquiries.filter(i => !selectedIds.includes(i.text_num)));
        setSelectedIds([]);
    };

    const toggleStatus = async (id, newStat) => {
        await supabase.from('question').update({ stat: newStat }).eq('text_num', id);
        setInquiries(inquiries.map(i => i.text_num === id ? { ...i, stat: newStat } : i));
    };

    const totalPages = Math.ceil(inquiries.length / itemsPerPage);
    const groupSize = 7;
    const currentGroup = Math.floor((currentPage - 1) / groupSize);
    const startPage = currentGroup * groupSize + 1;
    const endPage = Math.min(startPage + groupSize - 1, totalPages);

    const startIdx = (currentPage - 1) * itemsPerPage;
    const currentItems = inquiries.slice(startIdx, startIdx + itemsPerPage);

    return (
        <div className="faq-list-wrapper">
            <div className="table-wrapper">
                <table className="common-table inquiry-table">
                    <thead>
                    <tr>
                        <th><Checkbox onChange={toggleSelectAll} checked={selectedIds.length === currentItems.length && currentItems.length > 0} /></th>
                        <th className="inquiry-col-number">번호</th>
                        <th className="inquiry-col-category">구분</th>
                        <th className="inquiry-col-title">제목</th>
                        <th className="inquiry-col-content">내용</th>
                        <th className="inquiry-col-writer">작성자</th>
                        <th className="inquiry-col-date">작성일</th>
                        <th className="inquiry-col-status">처리현황</th>
                        <th className="inquiry-col-actions">관리</th>
                    </tr>
                    </thead>
                    <tbody>
                    {currentItems.map((item, idx) => (
                        <tr key={item.text_num} className={item.stat?.trim() === '답변완료' ? 'inquiry-answered' : ''}>
                            <td>
                                <Checkbox
                                    checked={selectedIds.includes(item.text_num)}
                                    onChange={() => toggleSelect(item.text_num)}
                                />
                            </td>
                            <td>{inquiries.length - startIdx - idx}</td>
                            <td>{item.type}</td>
                            <td className="inquiry-col-title">{item.title}</td>
                            <td className="inquiry-col-content">
                                <div
                                    className={`inquiry-toggle-box ${expanded === item.text_num ? 'open' : ''}`}
                                    onClick={() => setExpanded(expanded === item.text_num ? null : item.text_num)}
                                >
                                    {expanded === item.text_num
                                        ? item.question_txt
                                        : (item.question_txt || '').slice(0, 40) + (item.question_txt?.length > 40 ? '...' : '')}
                                </div>
                            </td>
                            <td>{item.name}</td>
                            <td>{item.created_at?.split('T')[0]}</td>
                            <td>
                                <button
                                    className={`btn-best ${item.stat?.trim() === '답변완료' ? 'orange' : 'blue'}`}
                                    onClick={() => {
                                        const newStat = item.stat?.trim() === '답변완료' ? '접수중' : '답변완료';
                                        toggleStatus(item.text_num, newStat);
                                    }}
                                >
                                    {item.stat}
                                </button>
                            </td>
                            <td>
                                <button
                                    className="btn btn-edit"
                                    onClick={() => navigate(`/inquiry-edit/${item.text_num}`)}
                                >
                                    답변
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
            </div>

            <div className="pagination-wrapper">
                <div className="pagination">
                    <button className="group-btn" onClick={() => setCurrentPage(1)} disabled={currentGroup === 0}>
                        <FontAwesomeIcon icon={faAnglesLeft} />
                    </button>
                    <button className="arrow-btn" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
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
                    <button className="arrow-btn" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
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

export default InquiryList;