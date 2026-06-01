import LineIcon from "../LineIcon";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const VendorSidebar = ({ shop, tabs, currentTab, onTabChange }) => {
    const shopLogoSrc = shop?.logo
        ? (shop.logo.startsWith("http") ? shop.logo : `${API_URL}${shop.logo}`)
        : null;

    return (
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm h-fit">
            <div className="flex items-center gap-3 px-3 py-4 border-b border-gray-50 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-50 text-[#00b14f] flex items-center justify-center font-bold text-lg border border-green-100 overflow-hidden">
                    {shopLogoSrc ? <img src={shopLogoSrc} className="w-full h-full object-cover" alt={shop?.name} /> : <LineIcon name="shop" size={20} />}
                </div>
                <div>
                    <h2 className="font-extrabold text-sm text-gray-900 truncate max-w-37.5">{shop?.name}</h2>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded-full w-fit mt-1">
                        Đang hoạt động
                    </p>
                </div>
            </div>

            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
                        currentTab === tab.id
                            ? "bg-[#00b14f] text-white shadow-md shadow-green-100"
                            : "text-gray-600 hover:bg-gray-50"
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </aside>
    );
};

export default VendorSidebar;
