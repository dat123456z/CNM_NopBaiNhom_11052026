import LineIcon from "../LineIcon";

export const ManagerCard = ({ children, className = "" }) => (
    <div className={`bg-white border border-slate-200 shadow-sm rounded-lg ${className}`}>
        {children}
    </div>
);

export const ManagerStatCard = ({ icon, label, value, sub }) => (
    <ManagerCard className="p-5">
        <div className="flex items-start justify-between gap-4">
            <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
                <p className="mt-4 text-2xl font-black text-slate-950">{value}</p>
                {sub && <p className="mt-2 text-xs font-semibold text-emerald-600">{sub}</p>}
            </div>
            <LineIcon name={icon} size={22} className="text-slate-400" />
        </div>
    </ManagerCard>
);
