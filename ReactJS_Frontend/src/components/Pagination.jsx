import { useEffect, useMemo, useState } from "react";

export const PAGE_SIZE = 5;

export const usePagination = (items = [], pageSize = PAGE_SIZE) => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

    useEffect(() => {
        setCurrentPage(1);
    }, [items.length, pageSize]);

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [currentPage, totalPages]);

    const pageItems = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return items.slice(start, start + pageSize);
    }, [currentPage, items, pageSize]);

    return {
        currentPage,
        pageItems,
        setCurrentPage,
        totalPages,
    };
};

const Pagination = ({ currentPage, totalItems, totalPages, onPageChange, pageSize = PAGE_SIZE }) => {
    if (totalItems <= pageSize) return null;

    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-xs">
            <span className="font-bold text-slate-400">
                Hiển thị {start}-{end} / {totalItems}
            </span>
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="h-8 rounded-md border border-slate-200 px-3 font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Trước
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                        key={page}
                        type="button"
                        onClick={() => onPageChange(page)}
                        className={`h-8 min-w-8 rounded-md px-2 font-black ${
                            currentPage === page
                                ? "bg-slate-900 text-white"
                                : "border border-slate-200 text-slate-600"
                        }`}
                    >
                        {page}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 rounded-md border border-slate-200 px-3 font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Sau
                </button>
            </div>
        </div>
    );
};

export default Pagination;
