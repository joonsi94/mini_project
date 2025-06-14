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
import '../../css/Review.css';

function ReviewList({ filterType, statusFilter, searchKeyword }) {
    const [reviews, setReviews] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [expanded, setExpanded] = useState(null);
    const [sortField, setSortField] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const navigate = useNavigate();
    const itemsPerPage = 7;

    useEffect(() => {
        fetchReviews();
    }, [sortField, sortOrder]);

    const fetchReviews = async () => {
        const { data, error } = await supabase
            .from('review')
            .select('*')
            .not('review_num', 'is', null)
            .order(sortField, { ascending: sortOrder === 'asc' });
        if (!error) setReviews(data);
    };

    const formatDate = (dateStr) => new Date(dateStr).toISOString().split('T')[0];

    const handleSelect = (checked, id) => {
        setSelectedIds((prev) =>
            checked ? [...prev, id] : prev.filter((item) => item !== id)
        );
    };

    const handleSelectAll = (checked) => {
        if (checked) setSelectedIds(currentItems.map((r) => r.review_num));
        else setSelectedIds([]);
    };

    const handleDeleteSelected = async () => {
        if (!window.confirm('선택한 후기를 삭제하시겠습니까?')) return;
        const { error } = await supabase
            .from('review')
            .delete()
            .in('review_num', selectedIds);

        if (!error) {
            setReviews(reviews.filter((r) => !selectedIds.includes(r.review_num)));
            setSelectedIds([]);
            alert('삭제 완료되었습니다.');
        }
    };

    const toggleBest = async (id, current) => {
        const { error } = await supabase
            .from('review')
            .update({ is_best: !current })
            .eq('review_num', id);
        if (!error) fetchReviews();
    };

    const toggleStatus = async (id, checked) => {
        const newStatus = checked ? '공개' : '숨김';
        const { error } = await supabase
            .from('review')
            .update({ status: newStatus })
            .eq('review_num', id);
        if (!error) fetchReviews();
    };

    const handleSort = (field) => {
        if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const filteredReviews = reviews
        .filter((r) => (filterType ? r.type === filterType : true))
        .filter((r) => (statusFilter ? r.status === statusFilter : true))
        .filter((r) => {
            if (!searchKeyword) return true;
            const lower = searchKeyword.toLowerCase();
            return (
                (r.title && r.title.toLowerCase().includes(lower)) ||
                (r.review_txt && r.review_txt.toLowerCase().includes(lower))
            );
        });

    const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredReviews.slice(indexOfFirstItem, indexOfLastItem);

    const groupSize = 7;
    const currentGroup = Math.floor((currentPage - 1) / groupSize);
    const startPage = currentGroup * groupSize + 1;
    const endPage = Math.min(startPage + groupSize - 1, totalPages);

    return (
        <div className="faq-list-wrapper">
            <div className="table-wrapper">
                <table className="review-table common-table">
                    <thead>
                    <tr>
                        <th className="review-col-select">
                            <Checkbox
                                onChange={(e) => handleSelectAll(e.target.checked)}
                                checked={selectedIds.length === currentItems.length && currentItems.length > 0}
                            />
                        </th>
                        <th className="review-col-title" onClick={() => handleSort('title')}>
                            제목 <FontAwesomeIcon icon={sortField === 'title' && sortOrder === 'asc' ? faChevronUp : faChevronDown} />
                        </th>
                        <th className="review-col-content">내용</th>
                        <th className="review-col-writer" onClick={() => handleSort('name')}>
                            작성자 <FontAwesomeIcon icon={sortField === 'name' && sortOrder === 'asc' ? faChevronUp : faChevronDown} />
                        </th>
                        <th className="review-col-type">구분</th>
                        <th className="review-col-date" onClick={() => handleSort('created_at')}>
                            등록일 <FontAwesomeIcon icon={sortField === 'created_at' && sortOrder === 'asc' ? faChevronUp : faChevronDown} />
                        </th>
                        <th className="review-col-visible">공개여부</th>
                        <th className="review-col-status">베스트리뷰</th>
                        <th className="review-col-actions">관리</th>
                    </tr>
                    </thead>
                    <tbody>
                    {currentItems.map((r) => (
                        <tr key={r.review_num} className={r.is_best ? 'review-best' : ''}>
                            <td className="review-col-select">
                                <Checkbox
                                    onChange={(e) => handleSelect(e.target.checked, r.review_num)}
                                    checked={selectedIds.includes(r.review_num)}
                                />
                            </td>
                            <td className="review-col-title">{r.title || '(제목 없음)'}</td>
                            <td className="review-col-content">
                                <div
                                    className={`review-toggle-box ${expanded === r.review_num ? 'open' : ''}`}
                                    onClick={() => setExpanded(expanded === r.review_num ? null : r.review_num)}
                                >
                                    {expanded === r.review_num
                                        ? r.review_txt || '(내용 없음)'
                                        : (r.review_txt || '').slice(0, 40) + (r.review_txt?.length > 40 ? '...' : '')}
                                </div>
                            </td>
                            <td className="review-col-writer">{r.name || '익명'}</td>
                            <td className="review-col-type">{r.type || '없음'}</td>
                            <td className="review-col-date">{r.created_at ? formatDate(r.created_at) : '날짜 없음'}</td>
                            <td className="review-col-visible">
                                <Switch
                                    checked={r.status === '공개'}
                                    onChange={(checked) => toggleStatus(r.review_num, checked)}
                                />
                            </td>
                            <td className="review-col-status">
                                <button
                                    className={`btn-best ${r.is_best ? 'orange' : 'blue'}`}
                                    onClick={() => toggleBest(r.review_num, r.is_best)}
                                >
                                    {r.is_best ? '해제' : '등록'}
                                </button>
                            </td>
                            <td className="review-col-actions">
                                <button
                                    className="btn btn-edit"
                                    onClick={() => navigate(`/review-edit/${r.review_num}`)}
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
}

export default ReviewList;
