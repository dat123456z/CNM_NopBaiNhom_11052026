import { Link } from "react-router-dom";
import NotificationBell from "../NotificationBell";
import LineIcon from "../LineIcon";

const VendorHeader = ({ user, token, onLogout }) => (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Link to="/vendor/dashboard" className="text-2xl font-extrabold tracking-tight text-[#00b14f]">
                    UTEShop
                </Link>
                <div className="h-6 w-px bg-gray-200" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-3 py-1 rounded-full">
                    Kênh Người Bán
                </span>
            </div>

            <div className="flex items-center gap-3">
                {token && user && <NotificationBell />}
                <Link to="/" className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1.5">
                    <LineIcon name="home" size={16} />
                    Trang mua hàng
                </Link>
                <button onClick={onLogout} className="bg-[#008a3d] hover:bg-[#007031] text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer">
                    Đăng xuất
                </button>
            </div>
        </div>
    </header>
);

export default VendorHeader;
