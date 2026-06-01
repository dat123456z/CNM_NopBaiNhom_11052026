import { useState, useEffect } from "react";
import LineIcon from "../../components/LineIcon";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const fmt = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";

const VendorOverview = ({ shop }) => {
    const [revenueData, setRevenueData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!shop) return;
        fetchOverview();
    }, [shop]);

    const fetchOverview = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API_URL}/api/revenues/shop`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setRevenueData(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-extrabold text-gray-900">Tổng quan kinh doanh</h1>
                <span className="text-xs text-gray-400">Cập nhật hôm nay</span>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-[#00b14f] border-t-transparent rounded-full" /></div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm flex flex-col justify-between">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tổng doanh thu</span>
                            <span className="text-2xl font-black text-gray-900 mt-2">{fmt(revenueData?.summary?.totalRevenue)}</span>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm flex flex-col justify-between">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Đơn hàng hoàn thành</span>
                            <span className="text-2xl font-black text-gray-900 mt-2">{revenueData?.summary?.totalOrders || 0} đơn</span>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm flex flex-col justify-between">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Số dư ví hiện tại</span>
                            <span className="text-2xl font-black text-green-600 mt-2">{fmt(revenueData?.summary?.balance || shop?.balance)}</span>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm flex flex-col justify-between">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Đánh giá trung bình</span>
                            <span className="text-2xl font-black text-amber-500 mt-2 inline-flex items-center gap-2">
                                <LineIcon name="star" size={22} />
                                {Number(revenueData?.summary?.rating || shop?.rating || 0).toFixed(1)} / 5
                            </span>
                        </div>
                    </div>

                    {/* Visual Chart */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm">
                        <h3 className="font-extrabold text-gray-900 mb-6">Biểu đồ doanh thu gần đây</h3>
                        {revenueData?.chart && revenueData.chart.length > 0 ? (
                            <div className="flex items-end justify-between h-48 gap-3 pt-6 border-b border-gray-100">
                                {revenueData.chart.map((c, idx) => {
                                    const maxRevenue = Math.max(...revenueData.chart.map(item => Number(item.revenue)));
                                    const percentHeight = maxRevenue > 0 ? (Number(c.revenue) / maxRevenue) * 100 : 0;
                                    return (
                                        <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full mb-2 bg-gray-900 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md z-10">
                                                {fmt(c.revenue)} ({c.orderCount} đơn)
                                            </div>
                                            {/* Bar Container */}
                                            <div className="w-full flex-1 flex items-end relative">
                                                {/* Bar */}
                                                <div
                                                    style={{ height: `${Math.max(percentHeight, 8)}%` }}
                                                    className="w-full bg-[#00b14f] hover:bg-green-600 rounded-t-lg transition-all duration-300 shadow-xs"
                                                />
                                            </div>
                                            <span className="text-[10px] text-gray-400 font-semibold mt-2 select-none truncate max-w-[60px]">{c.period}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-sm text-gray-400">Chưa có dữ liệu giao dịch hoàn thành để thống kê.</div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default VendorOverview;
