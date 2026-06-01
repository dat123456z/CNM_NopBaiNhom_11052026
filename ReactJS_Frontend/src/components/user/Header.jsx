import { Link } from "react-router-dom";
import NotificationBell from "../NotificationBell";
import LineIcon from "../LineIcon";

const UserHeader = ({ user, token, cartCount = 0, onLogout }) => (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Link to="/" className="text-2xl font-extrabold tracking-tight text-[#00b14f]">
                    UTEShop
                </Link>
                <nav className="hidden md:flex items-center gap-1 ml-2">
                    <Link to="/" className="text-sm text-gray-600 hover:text-[#00b14f] px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                        Trang chủ
                    </Link>
                    <Link to="/products" className="text-sm text-gray-600 hover:text-[#00b14f] px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                        Sản phẩm
                    </Link>
                </nav>
            </div>

            <div className="flex items-center gap-3">
                {token && user ? (
                    <>
                        {(user.role === "vendor" || user.role === "manager" || user.role === "admin") && (
                            <Link
                                to={user.role === "manager" || user.role === "admin" ? "/manager/dashboard" : "/vendor/dashboard"}
                                className="text-xs font-semibold text-[#00b14f] hover:underline hidden md:block"
                            >
                                {user.role === "vendor" ? "Kênh người bán" : "Quản lý"}
                            </Link>
                        )}
                        <NotificationBell />
                        <Link to="/orders" className="p-2 text-gray-500 hover:text-[#00b14f] hover:bg-gray-50 rounded-lg transition-colors" title="Đơn hàng">
                            <LineIcon name="clipboard" size={20} />
                        </Link>
                        <Link to="/wishlist" className="p-2 text-gray-500 hover:text-[#00b14f] hover:bg-gray-50 rounded-lg transition-colors" title="Yêu thích">
                            <LineIcon name="heart" size={20} />
                        </Link>
                        <Link to="/cart" className="relative p-2 text-gray-500 hover:text-[#00b14f] hover:bg-gray-50 rounded-lg transition-colors" title="Giỏ hàng">
                            <LineIcon name="cart" size={20} />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#00b14f] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                                    {cartCount > 99 ? "99+" : cartCount}
                                </span>
                            )}
                        </Link>
                        <Link to="/profile" className="text-sm font-semibold text-gray-700 hover:text-[#00b14f] transition-colors">
                            {user.name || "Tài khoản"}
                        </Link>
                        <button onClick={onLogout} className="text-xs font-bold px-4 py-1.5 bg-[#00b14f] hover:bg-[#009943] text-white rounded-lg transition-colors cursor-pointer">
                            Đăng xuất
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-[#00b14f] transition-colors">
                            Đăng nhập
                        </Link>
                        <Link to="/register" className="text-sm font-bold px-4 py-1.5 bg-[#00b14f] hover:bg-[#009943] text-white rounded-lg transition-colors">
                            Đăng ký
                        </Link>
                    </>
                )}
            </div>
        </div>
    </header>
);

export default UserHeader;
