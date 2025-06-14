import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Checkbox, Switch } from 'antd';
import supabase from '../lib/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChevronUp, faChevronDown,
    faAnglesLeft, faAnglesRight,
    faChevronLeft, faChevronRight
} from '@fortawesome/free-solid-svg-icons';

function ReviewTable({ filterType, statusFilter, searchKeyword }) {
    const [reviews, setReviews] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;
    const navigate = useNavigate();
    const [sortField, setSortField] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        fetchReviews();
    }, [sortField, sortOrder]);

    const fetchReviews = async () => {
        const { data, error } = await supabase
            .from('review')
            .select('*')
            .not('review_num', 'is', null)
            .not('title', 'is', null)
            .not('created_at', 'is', null)
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
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
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

    const goToFirstGroup = () => setCurrentPage(1);
    const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const goToNextGroup = () => setCurrentPage(endPage + 1);
    const goToPrevGroup = () => setCurrentPage(startPage - groupSize);

    return (
        <div>
            <table>
                <thead>
                <tr>
                    <th className="col-select">
                        <Checkbox
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            checked={selectedIds.length === currentItems.length && currentItems.length > 0}
                        />
                    </th>
                    <th className="col-title" onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>
                        제목{' '}
                        {sortField === 'title' && (
                            <FontAwesomeIcon icon={sortOrder === 'asc' ? faChevronUp : faChevronDown} />
                        )}
                    </th>
                    <th className="col-content">내용</th>
                    <th className="col-writer" onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                        작성자{' '}
                        {sortField === 'name' && (
                            <FontAwesomeIcon icon={sortOrder === 'asc' ? faChevronUp : faChevronDown} />
                        )}
                    </th>
                    <th className="col-type">구분</th>
                    <th className="col-date" onClick={() => handleSort('created_at')} style={{ cursor: 'pointer' }}>
                        등록일{' '}
                        {sortField === 'created_at' && (
                            <FontAwesomeIcon icon={sortOrder === 'asc' ? faChevronUp : faChevronDown} />
                        )}
                    </th>
                    <th className="col-visible">공개여부</th>
                    <th className="col-status">베스트리뷰등록</th>
                    <th className="col-actions">관리</th>
                </tr>
                </thead>
                <tbody>
                {currentItems.map((r) => (
                    <tr key={r.review_num} className={r.is_best ? 'review-best' : ''}>
                        <td className="col-select">
                            <Checkbox
                                onChange={(e) => handleSelect(e.target.checked, r.review_num)}
                                checked={selectedIds.includes(r.review_num)}
                            />
                        </td>
                        <td className="col-title">{r.title || '(제목 없음)'}</td>
                        <td className="col-content single-line" style={{ textAlign: 'left' }}>
                            {r.review_txt || '(내용 없음)'}
                        </td>
                        <td className="col-writer">{r.name || '익명'}</td>
                        <td className="col-type">{r.type || '없음'}</td>
                        <td className="col-date">{r.created_at ? formatDate(r.created_at) : '날짜 없음'}</td>
                        <td className="col-visible">
                            <Switch
                                checked={r.status === '공개'}
                                onChange={(checked) => toggleStatus(r.review_num, checked)}

                            />
                        </td>
                        <td className="col-status">
                            <button
                                className={`btn btn-best ${r.is_best ? 'pink' : 'blue'}`}
                                onClick={() => toggleBest(r.review_num, r.is_best)}
                            >
                                {r.is_best ? '해제' : '등록'}
                            </button>
                        </td>
                        <td className="col-actions">
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
                <tfoot>
                <tr>
                    <td colSpan="9">
                        <div className="add-button-wrapper">
                            {selectedIds.length > 0 && (
                                <button
                                    className="btn btn-delete btn-standard"
                                    onClick={handleDeleteSelected}
                                >
                                    선택 삭제 ({selectedIds.length})
                                </button>
                            )}
                        </div>
                    </td>
                </tr>
                </tfoot>
            </table>

            <div className="pagination">
                <button className="group-btn" onClick={goToFirstGroup} disabled={currentGroup === 0}>
                    <FontAwesomeIcon icon={faAnglesLeft} />
                </button>
                <button className="arrow-btn" onClick={goToPrevPage} disabled={currentPage === 1}>
                    <FontAwesomeIcon icon={faChevronLeft} />
                </button>

                <div className="page-btns">
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
                </div>

                <button className="arrow-btn" onClick={goToNextPage} disabled={currentPage === totalPages}>
                    <FontAwesomeIcon icon={faChevronRight} />
                </button>
                <button className="group-btn" onClick={goToNextGroup} disabled={endPage === totalPages}>
                    <FontAwesomeIcon icon={faAnglesRight} />
                </button>
            </div>
        </div>
    );
}

export default ReviewTable;
