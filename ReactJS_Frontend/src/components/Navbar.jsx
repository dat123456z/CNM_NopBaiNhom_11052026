import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    const isVendor = pathname.startsWith('/vendor');
    const { items } = useCart();
    const cartCount = items?.reduce((sum, i) => sum + (i.quantity || 1), 0) || 0;

    useEffect(() => {
        const syncAuth = () => {
            const t = localStorage.getItem('accessToken');
            const u = localStorage.getItem('user');
            setToken(t);
            try {
                setUser(u ? JSON.parse(u) : null);
            } catch {
                setUser(null);
            }
        };

        syncAuth();
        window.addEventListener('storage', syncAuth);
        return () => window.removeEventListener('storage', syncAuth);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        navigate('/login');
    };

    return (
        <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

                <div className="flex items-center gap-3">
                    <Link to={isVendor ? '/vendor/dashboard' : '/'} className="text-2xl font-extrabold tracking-tight text-[#00b14f]">
                        UTEShop
                    </Link>

                    {isVendor ? (
                        <>
                            <div className="h-6 w-px bg-gray-200" />
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-3 py-1 rounded-full">
                                Kênh Người Bán
                            </span>
                        </>
                    ) : (
                        <nav className="hidden md:flex items-center gap-1 ml-2">
                            <Link to="/" className="text-sm text-gray-600 hover:text-[#00b14f] px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                                Trang chủ
                            </Link>
                            <Link to="/products" className="text-sm text-gray-600 hover:text-[#00b14f] px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                                Sản phẩm
                            </Link>
                        </nav>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {isVendor ? (
                        <>
                            {token && user && <NotificationBell />}
                            <Link
                                to="/"
                                className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1.5"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Trang mua hàng
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="bg-[#008a3d] hover:bg-[#007031] text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            >
                                Đăng xuất
                            </button>
                        </>
                    ) : token && user ? (
                        <>
                            {(user.role === 'vendor' || user.role === 'manager' || user.role === 'admin') && (
                                <Link
                                    to={user.role === 'manager' || user.role === 'admin' ? '/manager/dashboard' : '/vendor/dashboard'}
                                    className="text-xs font-semibold text-[#00b14f] hover:underline hidden md:block"
                                >
                                    {user.role === 'vendor' ? 'Kênh người bán' : 'Quản lý'}
                                </Link>
                            )}
                            <NotificationBell />
                            <Link
                                to="/orders"
                                className="p-2 text-gray-500 hover:text-[#00b14f] hover:bg-gray-50 rounded-lg transition-colors"
                                title="Đơn hàng"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </Link>
                            <Link
                                to="/wishlist"
                                className="p-2 text-gray-500 hover:text-[#00b14f] hover:bg-gray-50 rounded-lg transition-colors"
                                title="Yêu thích"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </Link>
                            <Link
                                to="/cart"
                                className="relative p-2 text-gray-500 hover:text-[#00b14f] hover:bg-gray-50 rounded-lg transition-colors"
                                title="Giỏ hàng"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {cartCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#00b14f] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </Link>
                            <Link
                                to="/profile"
                                className="text-sm font-semibold text-gray-700 hover:text-[#00b14f] transition-colors"
                            >
                                {user.name || 'Tài khoản'}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-xs font-bold px-4 py-1.5 bg-[#00b14f] hover:bg-[#009943] text-white rounded-lg transition-colors cursor-pointer"
                            >
                                Đăng xuất
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="text-sm font-semibold text-gray-700 hover:text-[#00b14f] transition-colors"
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                to="/register"
                                className="text-sm font-bold px-4 py-1.5 bg-[#00b14f] hover:bg-[#009943] text-white rounded-lg transition-colors"
                            >
                                Đăng ký
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;