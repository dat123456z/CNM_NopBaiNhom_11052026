import LineIcon from "../LineIcon";
import NotificationBell from "../NotificationBell";

const AdminHeader = ({ onSwitchRole, onLogout }) => (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <p className="font-black text-red-500">UTEShop</p>
            <div className="w-72 h-8 rounded-md bg-slate-100 border border-slate-200 px-3 flex items-center gap-2 text-slate-400">
                <LineIcon name="search" size={14} />
                <span className="text-xs">Search moderation queue...</span>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <NotificationBell />
            <LineIcon name="cart" size={18} className="text-slate-600" />
            <button onClick={onSwitchRole} className="h-8 px-3 rounded-md border border-red-300 text-red-500 text-xs font-bold">
                Switch Role
            </button>
            <button onClick={onLogout} className="h-8 px-3 rounded-md border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50">
                Đăng xuất
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-black">
                A
            </div>
        </div>
    </header>
);

export default AdminHeader;
