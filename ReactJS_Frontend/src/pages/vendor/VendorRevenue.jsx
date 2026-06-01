import { useState, useEffect, useCallback } from "react";
import LineIcon from "../../components/LineIcon";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const fmt = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";
const fmtMoney = (n) => fmt(n);

const STATUS_META = {
    pending:          { label: "Chờ xác nhận",  color: "#f59e0b", bg: "#fef3c7" },
    confirmed:        { label: "Đã xác nhận",   color: "#3b82f6", bg: "#dbeafe" },
    preparing:        { label: "Đang chuẩn bị", color: "#f97316", bg: "#ffedd5" },
    shipping:         { label: "Đang giao",      color: "#8b5cf6", bg: "#ede9fe" },
    delivered:        { label: "Đã giao",        color: "#00b14f", bg: "#dcfce7" },
    cancelled:        { label: "Đã hủy",         color: "#ef4444", bg: "#fee2e2" },
    cancel_requested: { label: "Yêu cầu hủy",   color: "#d97706", bg: "#fef3c7" },
    refunded:         { label: "Hoàn tiền",      color: "#6b7280", bg: "#f3f4f6" },
};

const PERIODS = [
    { value: "7d",  label: "7 ngày" },
    { value: "30d", label: "30 ngày" },
    { value: "12m", label: "12 tháng" },
];

const BarChart = ({ data, valueKey, labelKey, color = "#00b14f", height = 160, formatVal }) => {
    const [hovered, setHovered] = useState(null);
    const max = Math.max(...data.map(d => d[valueKey]), 1);
    return (
        <div className="flex items-end gap-1" style={{ height }}>
            {data.map((d, i) => {
                const pct = Math.max((d[valueKey] / max) * 100, d[valueKey] > 0 ? 4 : 0);
                return (
                    <div
                        key={i}
                        className="flex-1 flex flex-col items-center justify-end group relative"
                        style={{ height: "100%" }}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                    >
                        {hovered === i && (
                            <div className="absolute bottom-full mb-2 z-20 bg-gray-900 text-white text-[10px] font-bold py-1.5 px-2.5 rounded-lg whitespace-nowrap shadow-xl pointer-events-none">
                                <div className="text-gray-300 mb-0.5">{d[labelKey]}</div>
                                {formatVal ? formatVal(d[valueKey]) : d[valueKey]}
                            </div>
                        )}
                        <div
                            className="w-full rounded-t-md transition-all duration-300 cursor-pointer"
                            style={{
                                height: `${pct}%`,
                                background: hovered === i
                                    ? color
                                    : `${color}99`,
                                minHeight: d[valueKey] > 0 ? 4 : 0
                            }}
                        />
                        {data.length <= 14 && (
                            <span className="text-[8px] text-gray-400 mt-1 truncate max-w-full px-0.5 select-none">
                                {d[labelKey]}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

const DonutChart = ({ segments, size = 120 }) => {
    const total = segments.reduce((s, seg) => s + seg.value, 0);
    if (total === 0) return <div className="text-xs text-gray-400 text-center py-4">Không có dữ liệu</div>;
    let cumAngle = -90;
    const cx = size / 2, cy = size / 2, r = size * 0.38, innerR = size * 0.24;
    const paths = segments.filter(s => s.value > 0).map((seg) => {
        const angle = (seg.value / total) * 360;
        const startRad = (cumAngle * Math.PI) / 180;
        const endRad = ((cumAngle + angle) * Math.PI) / 180;
        const x1 = cx + r * Math.cos(startRad), y1 = cy + r * Math.sin(startRad);
        const x2 = cx + r * Math.cos(endRad),   y2 = cy + r * Math.sin(endRad);
        const ix1 = cx + innerR * Math.cos(startRad), iy1 = cy + innerR * Math.sin(startRad);
        const ix2 = cx + innerR * Math.cos(endRad),   iy2 = cy + innerR * Math.sin(endRad);
        const large = angle > 180 ? 1 : 0;
        const d = `M${x1},${y1} A${r},${r},0,${large},1,${x2},${y2} L${ix2},${iy2} A${innerR},${innerR},0,${large},0,${ix1},${iy1} Z`;
        cumAngle += angle;
        return { ...seg, d };
    });
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {paths.map((seg, i) => (
                <path key={i} d={seg.d} fill={seg.color} opacity={0.9}>
                    <title>{seg.label}: {seg.value}</title>
                </path>
            ))}
            <text x={cx} y={cy - 5} textAnchor="middle" fontSize="14" fontWeight="800" fill="#111">
                {total}
            </text>
            <text x={cx} y={cy + 10} textAnchor="middle" fontSize="8" fill="#9ca3af">
                đơn
            </text>
        </svg>
    );
};

const StatCard = ({ label, value, sub, icon, accent = "#00b14f", trend, trendPositive }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
            <LineIcon name={icon} size={22} className="text-gray-400" />
        </div>
        <div>
            <div className="text-2xl font-black text-gray-900" style={{ color: accent }}>{value}</div>
            {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
        </div>
        {trend !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-bold ${trendPositive ? "text-green-600" : trend < 0 ? "text-red-500" : "text-gray-400"}`}>
                <span>{trend > 0 ? "▲" : trend < 0 ? "▼" : "—"}</span>
                <span>{Math.abs(trend)}% so với kỳ trước</span>
            </div>
        )}
    </div>
);

const VendorRevenue = ({ shop }) => {
    const [analytics, setAnalytics] = useState(null);
    const [walletHistory, setWalletHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingWallet, setLoadingWallet] = useState(false);
    const [period, setPeriod] = useState("30d");
    const [activeTab, setActiveTab] = useState("overview"); // overview | orders | products | cashflow | wallet
    const [withdrawModal, setWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [withdrawing, setWithdrawing] = useState(false);

    const fetchAnalytics = useCallback(async () => {
        if (!shop) return;
        try {
            setLoading(true);
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API_URL}/api/revenues/shop?period=${period}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setAnalytics(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [shop, period]);

    const fetchWallet = useCallback(async () => {
        if (!shop) return;
        try {
            setLoadingWallet(true);
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API_URL}/api/revenues/wallet-history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setWalletHistory(data.transactions || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingWallet(false);
        }
    }, [shop]);

    useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);
    useEffect(() => { if (activeTab === "wallet") fetchWallet(); }, [activeTab, fetchWallet]);

    const handleWithdraw = async (e) => {
        e.preventDefault();
        setWithdrawing(true);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API_URL}/api/revenues/withdraw`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ amount: Number(withdrawAmount) })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Rút tiền thất bại.");
            setWithdrawModal(false);
            setWithdrawAmount("");
            fetchAnalytics();
            fetchWallet();
            alert("Yêu cầu rút tiền thành công!");
        } catch (err) {
            alert(err.message);
        } finally {
            setWithdrawing(false);
        }
    };

    const s = analytics?.summary;
    const TABS = [
        { id: "overview",  label: "Tổng quan", icon: "receipt" },
        { id: "orders",    label: "Đơn hàng", icon: "clipboard" },
        { id: "products",  label: "Sản phẩm", icon: "box" },
        { id: "cashflow",  label: "Dòng tiền", icon: "wallet" },
        { id: "wallet",    label: "Ví Shop", icon: "coin" },
    ];

    return (
        <>
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-extrabold text-gray-900">Thống kê & Tài chính</h1>
                <div className="flex items-center gap-3">
                    {/* Period selector */}
                    <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                        {PERIODS.map(p => (
                            <button
                                key={p.value}
                                onClick={() => setPeriod(p.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${period === p.value ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-800"}`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setWithdrawModal(true)}
                        className="px-4 py-2 bg-[#00b14f] hover:bg-green-600 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
                    >
                        <LineIcon name="card" size={14} />
                        Rút tiền
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-100 overflow-x-auto">
                {TABS.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors border-b-2 -mb-px inline-flex items-center gap-2 ${activeTab === t.id ? "border-[#00b14f] text-[#00b14f]" : "border-transparent text-gray-500 hover:text-gray-800"}`}
                    >
                        <LineIcon name={t.icon} size={15} />
                        {t.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="animate-spin w-8 h-8 border-2 border-[#00b14f] border-t-transparent rounded-full" />
                </div>
            ) : !analytics ? null : (
                <>
                {activeTab === "overview" && (
                    <div className="space-y-6">
                        {/* KPI row */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                label="Doanh thu" icon="coin"
                                value={fmtMoney(s.totalRevenue)}
                                sub={`${s.totalOrders} đơn hoàn thành`}
                                trend={s.revenueGrowth}
                                trendPositive={s.revenueGrowth > 0}
                                accent="#00b14f"
                            />
                            <StatCard
                                label="Số dư ví" icon="bank"
                                value={fmtMoney(s.balance)}
                                sub="Khả dụng để rút"
                                accent="#3b82f6"
                            />
                            <StatCard
                                label="Giá trị TB / đơn" icon="receipt"
                                value={fmtMoney(s.avgOrderValue)}
                                sub={`${s.allOrdersCount} đơn trong kỳ`}
                                accent="#8b5cf6"
                            />
                            <StatCard
                                label="Khách mới" icon="users"
                                value={s.newCustomers}
                                sub={`Tổng ${s.totalUniqueCustomers} khách trong kỳ`}
                                accent="#f59e0b"
                            />
                        </div>

                        {/* Revenue chart */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-extrabold text-gray-900">Biểu đồ doanh thu</h3>
                                <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                                    Đơn đã giao
                                </span>
                            </div>
                            {analytics.chart?.some(c => c.revenue > 0) ? (
                                <BarChart
                                    data={analytics.chart}
                                    valueKey="revenue"
                                    labelKey="period"
                                    color="#00b14f"
                                    height={180}
                                    formatVal={fmt}
                                />
                            ) : (
                                <div className="py-10 text-center text-sm text-gray-400">Chưa có dữ liệu doanh thu trong kỳ này.</div>
                            )}
                        </div>

                        {/* New customers chart */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="font-extrabold text-gray-900 mb-6">Khách hàng mới theo kỳ</h3>
                            {analytics.newCustomersChart?.some(c => c.count > 0) ? (
                                <BarChart
                                    data={analytics.newCustomersChart}
                                    valueKey="count"
                                    labelKey="period"
                                    color="#3b82f6"
                                    height={140}
                                    formatVal={(v) => `${v} khách`}
                                />
                            ) : (
                                <div className="py-8 text-center text-sm text-gray-400">Chưa có khách mới trong kỳ.</div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "orders" && (
                    <div className="space-y-6">
                        {/* Status distribution */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Donut */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <h3 className="font-extrabold text-gray-900 mb-4">Phân bổ theo trạng thái</h3>
                                <div className="flex items-center gap-6">
                                    <DonutChart
                                        size={140}
                                        segments={Object.entries(analytics.statusCounts).map(([status, count]) => ({
                                            label: STATUS_META[status]?.label || status,
                                            value: count,
                                            color: STATUS_META[status]?.color || "#9ca3af"
                                        }))}
                                    />
                                    <div className="flex-1 space-y-2">
                                        {Object.entries(analytics.statusCounts)
                                            .sort((a, b) => b[1] - a[1])
                                            .map(([status, count]) => (
                                                <div key={status} className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="w-2.5 h-2.5 rounded-full shrink-0"
                                                            style={{ background: STATUS_META[status]?.color || "#9ca3af" }}
                                                        />
                                                        <span className="text-gray-600">{STATUS_META[status]?.label || status}</span>
                                                    </div>
                                                    <span className="font-bold text-gray-900">{count}</span>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>

                            {/* Order value distribution */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <h3 className="font-extrabold text-gray-900 mb-4">Phân bổ giá trị đơn hàng</h3>
                                <div className="space-y-3">
                                    {analytics.orderValueDist?.map((b) => {
                                        const maxCount = Math.max(...analytics.orderValueDist.map(x => x.count), 1);
                                        const pct = (b.count / maxCount) * 100;
                                        return (
                                            <div key={b.label}>
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="text-gray-600 font-medium">{b.label}</span>
                                                    <span className="font-bold text-gray-900">{b.count} đơn</span>
                                                </div>
                                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#00b14f] rounded-full transition-all duration-500"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Order count chart */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="font-extrabold text-gray-900 mb-6">Số đơn hoàn thành theo thời gian</h3>
                            {analytics.chart?.some(c => c.orderCount > 0) ? (
                                <BarChart
                                    data={analytics.chart}
                                    valueKey="orderCount"
                                    labelKey="period"
                                    color="#8b5cf6"
                                    height={160}
                                    formatVal={(v) => `${v} đơn`}
                                />
                            ) : (
                                <div className="py-8 text-center text-sm text-gray-400">Chưa có đơn hoàn thành.</div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "products" && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-50">
                                <h3 className="font-extrabold text-gray-900 flex items-center gap-2">
                                    <LineIcon name="star" size={18} className="text-gray-500" />
                                    Top 10 sản phẩm bán chạy nhất
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">Tính theo doanh thu từ đơn đã giao trong kỳ</p>
                            </div>
                            {analytics.topProducts?.length === 0 ? (
                                <div className="py-12 text-center text-sm text-gray-400">Chưa có dữ liệu.</div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {analytics.topProducts?.map((p, i) => {
                                        const maxRev = analytics.topProducts[0]?.totalRevenue || 1;
                                        const pct = (p.totalRevenue / maxRev) * 100;
                                        const imgSrc = p.image
                                            ? (p.image.startsWith("http") ? p.image : `${API_URL}${p.image}`)
                                            : null;
                                        return (
                                            <div key={p.productId} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                                                {/* Rank */}
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                                                    i === 0 ? "bg-amber-100 text-amber-700" :
                                                    i === 1 ? "bg-gray-100 text-gray-600" :
                                                    i === 2 ? "bg-orange-100 text-orange-700" :
                                                    "bg-gray-50 text-gray-400"
                                                }`}>
                                                    {i + 1}
                                                </div>
                                                {/* Image */}
                                                <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                                                    {imgSrc
                                                        ? <img src={imgSrc} alt={p.title} className="w-full h-full object-cover" />
                                                        : <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-300" />
                                                    }
                                                </div>
                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-bold text-gray-900 truncate">{p.title}</div>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full rounded-full"
                                                                style={{ width: `${pct}%`, background: "#00b14f" }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Stats */}
                                                <div className="text-right shrink-0">
                                                    <div className="text-sm font-extrabold text-[#00b14f]">{fmtMoney(p.totalRevenue)}</div>
                                                    <div className="text-[10px] text-gray-400 mt-0.5">{p.totalQty} sản phẩm · {p.orderCount} đơn</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── TAB: CASH FLOW ────────────────────────────────────────── */}
                {activeTab === "cashflow" && (
                    <div className="space-y-6">
                        {/* Summary cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: "Đã vào ví",      value: s.totalRevenue,   icon: "check", color: "#00b14f", sub: `${s.totalOrders} đơn giao thành công` },
                                { label: "Đang giao",       value: s.shippingRevenue, icon: "truck", color: "#8b5cf6", sub: "Sẽ vào ví khi hoàn thành" },
                                { label: "Chờ xử lý",       value: s.pendingRevenue,  icon: "receipt", color: "#f59e0b", sub: "Đơn chưa đến tay khách" },
                                { label: "Đơn bị hủy",      value: s.cancelledRevenue,icon: "x", color: "#ef4444", sub: "Doanh thu mất do hủy" },
                            ].map((c, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{c.label}</span>
                                        <LineIcon name={c.icon} size={20} className="text-gray-400" />
                                    </div>
                                    <div className="text-xl font-black" style={{ color: c.color }}>{fmtMoney(c.value)}</div>
                                    <div className="text-[10px] text-gray-400 mt-1">{c.sub}</div>
                                </div>
                            ))}
                        </div>

                        {/* Cash flow visual */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="font-extrabold text-gray-900 mb-6">Phân bổ dòng tiền</h3>
                            {(() => {
                                const total = (s.totalRevenue + s.shippingRevenue + s.pendingRevenue + s.cancelledRevenue) || 1;
                                const items = [
                                    { label: "Đã vào ví",  value: s.totalRevenue,    color: "#00b14f" },
                                    { label: "Đang giao",  value: s.shippingRevenue, color: "#8b5cf6" },
                                    { label: "Chờ xử lý", value: s.pendingRevenue,  color: "#f59e0b" },
                                    { label: "Bị hủy",    value: s.cancelledRevenue,color: "#ef4444" },
                                ].filter(x => x.value > 0);
                                return (
                                    <div className="space-y-4">
                                        {/* Stacked bar */}
                                        <div className="flex h-8 rounded-xl overflow-hidden gap-0.5">
                                            {items.map((item, i) => (
                                                <div
                                                    key={i}
                                                    className="h-full transition-all duration-500 relative group"
                                                    style={{ width: `${(item.value / total) * 100}%`, background: item.color, minWidth: item.value > 0 ? 4 : 0 }}
                                                    title={`${item.label}: ${fmt(item.value)}`}
                                                />
                                            ))}
                                        </div>
                                        {/* Legend */}
                                        <div className="flex flex-wrap gap-4">
                                            {items.map((item, i) => (
                                                <div key={i} className="flex items-center gap-2 text-xs">
                                                    <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: item.color }} />
                                                    <span className="text-gray-600">{item.label}</span>
                                                    <span className="font-bold text-gray-900">{fmt(item.value)}</span>
                                                    <span className="text-gray-400">({((item.value / total) * 100).toFixed(1)}%)</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Monthly revenue vs order count */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="font-extrabold text-gray-900 mb-2">Doanh thu theo kỳ</h3>
                            <p className="text-xs text-gray-400 mb-6">Hover để xem chi tiết doanh thu và số đơn</p>
                            <BarChart
                                data={analytics.chart}
                                valueKey="revenue"
                                labelKey="period"
                                color="#00b14f"
                                height={180}
                                formatVal={(v) => `${fmt(v)}`}
                            />
                        </div>
                    </div>
                )}

                {activeTab === "wallet" && (
                    <div className="space-y-6">
                        {/* Balance banner */}
                        <div className="bg-linear-to-br from-[#00b14f] via-green-500 to-emerald-600 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-green-100">Số dư ví khả dụng</p>
                                    <h2 className="text-4xl font-black mt-1">{fmt(s.balance)}</h2>
                                    <p className="text-xs text-green-100 mt-2">Cập nhật realtime từ đơn hoàn thành</p>
                                </div>
                                <button
                                    onClick={() => setWithdrawModal(true)}
                                    className="px-6 py-3 bg-white text-[#00b14f] rounded-2xl font-black text-sm shadow-md hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer"
                                >
                                    <LineIcon name="card" size={16} />
                                    Rút tiền về ngân hàng
                                </button>
                            </div>
                        </div>

                        {/* Transaction history */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                                <h3 className="font-extrabold text-gray-900">Lịch sử giao dịch</h3>
                                <button onClick={fetchWallet} className="text-xs text-[#00b14f] font-bold hover:underline">
                                    Làm mới
                                </button>
                            </div>
                            {loadingWallet ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin w-6 h-6 border-2 border-[#00b14f] border-t-transparent rounded-full" />
                                </div>
                            ) : walletHistory.length === 0 ? (
                                <div className="py-12 text-center text-sm text-gray-400">Chưa có giao dịch nào.</div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {walletHistory.map(w => (
                                        <div key={w.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${w.type === "credit" ? "bg-green-50" : "bg-red-50"}`}>
                                                    <LineIcon name={w.type === "credit" ? "check" : "card"} size={18} className={w.type === "credit" ? "text-green-600" : "text-red-500"} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">{w.note}</div>
                                                    <div className="text-xs text-gray-400 mt-0.5">
                                                        {new Date(w.createdAt).toLocaleString("vi-VN")}
                                                        {w.orderId && <span className="ml-2 text-gray-300">· Đơn #{w.orderId}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className={`text-base font-extrabold ${w.type === "credit" ? "text-green-600" : "text-red-500"}`}>
                                                    {w.type === "credit" ? "+" : "−"}{fmt(w.amount)}
                                                </div>
                                                <div className="text-[10px] text-gray-400 mt-0.5">Số dư: {fmt(w.balanceAfter)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                </>
            )}
        </div>

        {/* WITHDRAW MODAL */}
        {withdrawModal && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
                <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 relative">
                    <button
                        onClick={() => setWithdrawModal(false)}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        ✕
                    </button>
                    <div className="text-center mb-6">
                        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-green-700">
                            <LineIcon name="card" size={28} />
                        </div>
                        <h2 className="text-xl font-extrabold text-gray-900">Rút tiền về ngân hàng</h2>
                        <p className="text-xs text-gray-400 mt-1">Số dư: <strong className="text-green-600">{fmt(s?.balance)}</strong></p>
                    </div>
                    <form onSubmit={handleWithdraw} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Số tiền muốn rút (đ)</label>
                            <input
                                type="number"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                placeholder="Nhập số tiền..."
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00b14f] focus:ring-1 focus:ring-green-100"
                                required
                                min="50000"
                                max={s?.balance}
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Tối thiểu: 50.000đ · Tối đa: {fmt(s?.balance)}</p>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
                            <span className="inline-flex align-middle mr-1"><LineIcon name="alert" size={14} /></span>
                            Tiền sẽ được chuyển trong vòng <strong>24h làm việc</strong> sau khi xác nhận.
                        </div>
                        <button
                            type="submit"
                            disabled={withdrawing}
                            className="w-full py-3 bg-[#00b14f] hover:bg-green-600 text-white font-bold text-sm rounded-xl transition-all shadow-md disabled:opacity-60 cursor-pointer"
                        >
                            {withdrawing ? "Đang xử lý..." : "Xác nhận rút tiền"}
                        </button>
                    </form>
                </div>
            </div>
        )}
        </>
    );
};

export default VendorRevenue;
