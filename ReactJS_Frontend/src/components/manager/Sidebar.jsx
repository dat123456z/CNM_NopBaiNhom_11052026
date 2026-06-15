import LineIcon from "../LineIcon";

const ManagerSidebar = ({ tabs, activeTab, onTabChange, pendingCount = 0, onLogout }) => (
    <aside className="w-64 shrink-0 bg-[#eaf1fb] border-r border-slate-200 flex flex-col">
        <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-200">
            <div className="w-9 h-9 rounded-lg bg-[#9a4f00] text-white flex items-center justify-center font-black">
                U
            </div>
            <div>
                <p className="text-sm font-black text-[#9a4f00]">UTEShop Manager</p>
                <p className="text-[10px] font-semibold text-slate-500">Quản lý hệ thống</p>
            </div>
        </div>

        <nav className="p-4 space-y-1">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`w-full h-10 px-3 rounded-md flex items-center gap-2 text-xs font-bold transition-colors ${
                        activeTab === tab.id
                            ? "bg-[#9a4f00] text-white"
                            : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
                    }`}
                >
                    <LineIcon name={tab.icon} size={16} />
                    {tab.label}
                    {tab.id === "moderation" && pendingCount > 0 && (
                        <span className="ml-auto rounded-full bg-rose-500 px-2 py-0.5 text-[10px] text-white">
                            {pendingCount}
                        </span>
                    )}
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

export default ManagerSidebar;
