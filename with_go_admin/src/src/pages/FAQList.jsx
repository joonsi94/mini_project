
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Checkbox, Switch } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faAnglesLeft,
    faAnglesRight,
    faChevronLeft,
    faChevronRight,
    faChevronDown,
    faChevronUp
} from '@fortawesome/free-solid-svg-icons';
import supabase from '../lib/supabase';
import '../css/FAQ.css';

const FAQList = ({ filterType = '', searchKeyword = '' }) => {
    const [faqs, setFaqs] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState('desc');
    const [expanded, setExpanded] = useState(null);
    const navigate = useNavigate();
    const itemsPerPage = 7;

    useEffect(() => {
        fetchFAQs();
    }, [filterType, searchKeyword, sortOrder]);

    const fetchFAQs = async () => {
        let query = supabase.from('withgo_faqs').select('*');
        if (filterType) query = query.eq('category', filterType);
        if (searchKeyword) query = query.ilike('question', `%${searchKeyword}%`);
        query = query.order('created_at', { ascending: sortOrder === 'asc' });
        const { data, error } = await query;
        if (!error) setFaqs(data);
    };

    const handleDeleteSelected = async () => {
        if (!window.confirm('선택한 FAQ를 삭제할까요?')) return;
        const { error } = await supabase.from('withgo_faqs').delete().in('id', selectedIds);
        if (!error) {
            setFaqs(faqs.filter(faq => !selectedIds.includes(faq.id)));
            setSelectedIds([]);
        }
    };

    const handleStatusToggle = async (id, newStatus) => {
        const { error } = await supabase
            .from('withgo_faqs')
            .update({ status: newStatus ? '공개' : '숨김' })
            .eq('id', id);
        if (!error) {
            setFaqs(faqs.map(f => f.id === id ? { ...f, status: newStatus ? '공개' : '숨김' } : f));
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedIds.length === currentItems.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(currentItems.map(item => item.id));
        }
    };

    const toggleSortOrder = () => {
        setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = faqs.slice(startIndex, startIndex + itemsPerPage);
    const totalPages = Math.ceil(faqs.length / itemsPerPage);

    return (
        <div className="faq-list-page">
            <table className="faq-table">
                <thead>
                <tr>
                    <th className="col-select">
                        <Checkbox onChange={toggleAll} checked={selectedIds.length === currentItems.length} />
                    </th>
                    <th className="col-category">카테고리</th>
                    <th className="col-title">질문</th>
                    <th className="col-content">답변</th>
                    <th className="col-visible">공개</th>
                    <th className="col-date" onClick={toggleSortOrder}>
                        등록일 <FontAwesomeIcon icon={sortOrder === 'asc' ? faChevronUp : faChevronDown} />
                    </th>
                    <th className="col-actions">관리</th>
                </tr>
                </thead>
                <tbody>
                {currentItems.map((faq) => (
                    <tr key={faq.id}>
                        <td><Checkbox onChange={() => toggleSelect(faq.id)} checked={selectedIds.includes(faq.id)} /></td>
                        <td>{faq.category}</td>
                        <td className="col-title">{faq.question}</td>
                        <td className="col-content">
                            <div
                                className={`faq-toggle-box ${expanded === faq.id ? 'open' : ''}`}
                                onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}
                                dangerouslySetInnerHTML={{
                                    __html: expanded === faq.id
                                        ? faq.answer
                                        : faq.answer.replace(/<br\s*\/?>/gi, ' ')
                                }}
                            ></div>

                        </td>
                        <td>
                            <Switch checked={faq.status === '공개'} onChange={(checked) => handleStatusToggle(faq.id, checked)} />
                        </td>
                        <td>{faq.created_at?.split('T')[0]}</td>
                        <td>
                            <button className="btn btn-edit" onClick={() => navigate(`/faq-edit/${faq.id}`)}>수정</button>
                        </td>
                    </tr>
                ))}
                </tbody>
                <tfoot>
                <tr>
                    <td colSpan="7">
                        <div className="add-button-wrapper">
                            {selectedIds.length > 0 && (
                                <button className="btn btn-delete btn-standard" onClick={handleDeleteSelected}>
                                    선택 삭제 ({selectedIds.length})
                                </button>
                            )}
                            <button className="btn btn-add-event btn-standard" onClick={() => navigate('/faq-add')}>
                                새 FAQ 등록
                            </button>
                        </div>
                    </td>
                </tr>
                </tfoot>
            </table>

            <div className="pagination">
                <button className="arrow-btn" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                    <FontAwesomeIcon icon={faAnglesLeft} />
                </button>
                <button className="arrow-btn" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                    <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                {[...Array(totalPages)].map((_, idx) => (
                    <button
                        key={idx + 1}
                        className={`page-btn ${currentPage === idx + 1 ? 'active' : ''}`}
                        onClick={() => setCurrentPage(idx + 1)}
                    >
                        {idx + 1}
                    </button>
                ))}
                <button className="arrow-btn" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                    <FontAwesomeIcon icon={faChevronRight} />
                </button>
                <button className="arrow-btn" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                    <FontAwesomeIcon icon={faAnglesRight} />
                </button>
            </div>
        </div>
    );
};

export default FAQList;
