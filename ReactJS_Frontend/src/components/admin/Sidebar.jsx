import LineIcon from "../LineIcon";

const AdminSidebar = ({ tabs, activeTab, onTabChange, onLogout }) => (
    <aside className="w-64 shrink-0 bg-[#eaf1fb] border-r border-slate-200 flex flex-col">
        <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-200">
            <div className="w-9 h-9 rounded-lg bg-red-500 text-white flex items-center justify-center font-black">
                U
            </div>
            <div>
                <p className="text-sm font-black text-red-500">UTEShop Admin</p>
                <p className="text-[10px] font-semibold text-slate-500">Quản trị hệ thống</p>
            </div>
        </div>

        <nav className="p-4 space-y-1">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`w-full h-10 px-3 rounded-md flex items-center gap-2 text-xs font-bold transition-colors ${
                        activeTab === tab.id ? "bg-red-500 text-white" : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
                    }`}
                >
                    <LineIcon name={tab.icon} size={16} />
                    {tab.label}
                </button>
            ))}
        </nav>

        <div className="mt-auto p-4 border-t border-slate-200 space-y-2 text-xs text-slate-500">
            <button onClick={onLogout} className="flex items-center gap-2 hover:text-slate-900">
                <LineIcon name="x" size={14} />
                Đăng xuất
            </button>
        </div>
    </aside>
);

export default AdminSidebar;
