import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import LineIcon from './LineIcon';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const TYPE_ICON = {
    order_new:              'cart',
    order_confirmed:        'check',
    order_preparing:        'box',
    order_shipping:         'truck',
    order_delivered:        'packageCheck',
    order_cancelled:        'x',
    order_cancel_requested: 'alert',
    review_new:             'star',
    review_reply:           'edit',
    manager_product_pending: 'clipboard',
    manager_vendor_new:      'shop',
    price_drop:               'coin',
    back_in_stock:            'box',
    system:                 'bell'
};

const NotificationBell = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const dropdownRef = useRef(null);
    const bellRef = useRef(null);

    const fetchNotifications = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/notifications?limit=15`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) return;
            const data = await res.json();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
            setHasMore(data.total > 15);
        } catch {
        } finally {
            setLoading(false);
        }
    }, []);

    useSocket((incoming) => {
        setNotifications((prev) => [incoming, ...prev].slice(0, 50));
        setUnreadCount((c) => c + 1);
    });

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {
        const handleClick = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target) &&
                bellRef.current &&
                !bellRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleOpen = async () => {
        setOpen((v) => !v);
        if (!open) await fetchNotifications();
    };

    const markOne = async (id) => {
        const token = localStorage.getItem('accessToken');
        try {
            await fetch(`${API_URL}/api/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
            setUnreadCount((c) => Math.max(0, c - 1));
        } catch {}
    };

    const markAll = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            await fetch(`${API_URL}/api/notifications/read-all`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch {}
    };

    const handleNotificationClick = async (n) => {
        if (!n.isRead) await markOne(n.id);
        setOpen(false);
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role === 'admin') {
            if (n.type === 'manager_product_pending') navigate('/admin/dashboard?tab=products');
            else if (n.type === 'manager_vendor_new') navigate('/admin/dashboard?tab=vendors');
            else navigate('/admin/dashboard');
            return;
        }
        if (user.role === 'manager') {
            if (n.type === 'manager_product_pending') navigate('/manager/dashboard?tab=moderation');
            else if (n.type === 'manager_vendor_new') navigate('/manager/dashboard?tab=vendors');
            else navigate('/manager/dashboard');
            return;
        }
        if (n.type === 'review_reply') {
            navigate('/orders');
            return;
        }
        if (n.type === 'review_new') {
            navigate('/vendor/dashboard/reviews');
            return;
        }
        if (n.productId) {
            navigate(`/product/${n.productId}`);
            return;
        }
        if (n.orderId) {
            if (user.role === 'vendor') {
                navigate('/vendor/dashboard/orders');
            } else {
                navigate(`/orders/${n.orderId}`);
            }
        }
    };

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const m = Math.floor(diff / 60000);
        if (m < 1) return 'Vừa xong';
        if (m < 60) return `${m} phút trước`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h} giờ trước`;
        return `${Math.floor(h / 24)} ngày trước`;
    };

    return (
        <div className="relative">
            <button
                ref={bellRef}
                onClick={handleOpen}
                className="relative p-2 text-gray-500 hover:text-[#00b14f] hover:bg-gray-50 rounded-lg transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div
                    ref={dropdownRef}
                    className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <span className="text-sm font-bold text-gray-900">Thông báo</span>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAll}
                                className="text-xs text-[#00b14f] font-semibold hover:underline"
                            >
                                Đánh dấu tất cả đã đọc
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="w-6 h-6 border-2 border-[#00b14f] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-10 text-center text-sm text-gray-400">
                                <LineIcon name="bell" size={32} className="mx-auto mb-2 text-gray-300" />
                                Chưa có thông báo nào
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <button
                                    key={n.id}
                                    onClick={() => handleNotificationClick(n)}
                                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex gap-3 ${!n.isRead ? 'bg-green-50/40' : ''}`}
                                >
                                    <span className="w-8 h-8 rounded-full border border-gray-200 bg-white text-gray-500 shrink-0 mt-0.5 flex items-center justify-center">
                                        <LineIcon name={TYPE_ICON[n.type] || 'bell'} size={16} />
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-semibold text-gray-900 line-clamp-1 ${!n.isRead ? 'font-bold' : ''}`}>
                                            {n.title}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                                        <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                                    </div>
                                    {!n.isRead && (
                                        <span className="w-2 h-2 bg-[#00b14f] rounded-full shrink-0 mt-1.5" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>

                    {hasMore && (
                        <div className="px-4 py-2.5 border-t border-gray-100 text-center">
                            <button className="text-xs text-[#00b14f] font-semibold hover:underline">
                                Xem tất cả thông báo
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
