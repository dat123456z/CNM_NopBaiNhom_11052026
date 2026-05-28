import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const { itemCount } = useCart();

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            navigate(`/products?q=${encodeURIComponent(search.trim())}`);
        }
    };

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <header className="bg-[#f8f9fb] w-full pt-6 pb-4">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-8">
                {/* Logo */}
                <Link to="/" className="text-2xl font-extrabold tracking-tight text-[#00b14f]">
                    UTEShop
                </Link>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex items-center bg-[#eef2f9] rounded-md px-4 py-2 border border-gray-200 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all">
                    <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        className="bg-transparent border-none focus:outline-none text-sm w-full text-gray-700 placeholder-gray-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </form>

                {/* Right Side */}
                <div className="flex items-center gap-6">
                    <nav className="hidden lg:flex items-center gap-5 text-sm font-semibold text-gray-600">
                        <Link to="/" className={`hover:text-gray-900 ${location.pathname === '/' ? 'text-gray-900 border-b-2 border-gray-900 pb-0.5' : ''}`}>Home</Link>
                        <Link to="/products" className={`hover:text-gray-900 ${isActive('/products') ? 'text-gray-900 border-b-2 border-gray-900 pb-0.5' : ''}`}>Product</Link>
                        <Link to="/orders" className={`hover:text-gray-900 ${isActive('/orders') ? 'text-gray-900 border-b-2 border-gray-900 pb-0.5' : ''}`}>Orders</Link>
                        <Link to="/profile" className={`hover:text-gray-900 ${isActive('/profile') ? 'text-gray-900 border-b-2 border-gray-900 pb-0.5' : ''}`}>Profile</Link>
                        {(user?.role === 'manager' || user?.role === 'admin') && (
                            <Link to="/manager/dashboard" className={`hover:text-gray-900 text-emerald-600 ${isActive('/manager/dashboard') ? 'text-emerald-700 border-b-2 border-emerald-600 pb-0.5' : ''}`}>Kênh Quản Lý</Link>
                        )}
                    </nav>

                    {localStorage.getItem('accessToken') ? (
                        <button onClick={handleLogout} className="bg-[#008a3d] hover:bg-[#007031] text-white px-5 py-1.5 rounded-md text-sm font-semibold transition-colors cursor-pointer">
                            Logout
                        </button>
                    ) : (
                        <Link to="/login" className="bg-[#00b14f] hover:bg-[#008a3d] text-white px-5 py-1.5 rounded-md text-sm font-semibold transition-colors">
                            Login
                        </Link>
                    )}

                    <div className="flex items-center gap-4 text-gray-600 border-l pl-4 border-gray-300">
                        {/* Cart Icon with Badge */}
                        <Link to="/cart" className="hover:text-gray-900 transition-colors relative">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                            {itemCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-[#00b14f] text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                                    {itemCount > 99 ? '99+' : itemCount}
                                </span>
                            )}
                        </Link>
                        <button className="hover:text-gray-900 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
