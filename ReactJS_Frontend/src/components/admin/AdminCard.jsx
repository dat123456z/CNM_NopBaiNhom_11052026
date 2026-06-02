const AdminCard = ({ className = "", children }) => (
    <div className={`bg-white border border-slate-200 rounded-lg shadow-sm ${className}`}>
        {children}
    </div>
);

export const AdminStatCard = ({ icon, label, value, sub, tone = "blue" }) => {
    const tones = {
        blue: "text-blue-600 bg-blue-50",
        green: "text-emerald-600 bg-emerald-50",
        red: "text-rose-600 bg-rose-50",
        amber: "text-amber-600 bg-amber-50",
    };

    return (
        <AdminCard className="p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-wide">{label}</p>
                    <p className="mt-3 text-2xl font-black text-slate-950">{value}</p>
                    {sub && <p className={`mt-2 text-xs font-bold ${tone === "red" ? "text-rose-600" : "text-emerald-600"}`}>{sub}</p>}
                </div>
                <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${tones[tone] || tones.blue}`}>
                    {icon}
                </span>
            </div>
        </AdminCard>
    );
};

export default AdminCard;
