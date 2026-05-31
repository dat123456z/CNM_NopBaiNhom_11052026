import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const fmt = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";

const VendorRevenue = ({ shop }) => {
    const [revenueData, setRevenueData] = useState(null);
    const [loadingRevenue, setLoadingRevenue] = useState(false);
    const [walletHistory, setWalletHistory] = useState([]);
    const [loadingWallet, setLoadingWallet] = useState(false);
    const [withdrawModal, setWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("");

    useEffect(() => {
        if (!shop) return;
        fetchOverview();
        fetchWalletHistory();
    }, [shop]);

    const fetchOverview = async () => {
        try {
            setLoadingRevenue(true);
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API_URL}/api/revenues/shop`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setRevenueData(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingRevenue(false);
        }
    };

    const fetchWalletHistory = async () => {
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
    };

    const handleWithdrawSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch(`${API_URL}/api/revenues/withdraw`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ amount: Number(withdrawAmount) })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Rút tiền thất bại.");
            setWithdrawModal(false);
            setWithdrawAmount("");
            fetchOverview();
            fetchWalletHistory();
            alert("Yêu cầu rút tiền thành công!");
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-extrabold text-gray-900">Quản lý ví điện tử shop</h1>
                    <button
                        onClick={() => setWithdrawModal(true)}
                        className="px-5 py-2.5 bg-[#00b14f] hover:bg-green-600 text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer"
                    >
                        Rút tiền về ngân hàng
                    </button>
                </div>

                <div className="bg-gradient-to-br from-[#00b14f] to-green-600 p-8 rounded-3xl text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-green-100">Số dư ví khả dụng</p>
                        <h2 className="text-4xl font-black mt-2">{fmt(revenueData?.summary?.balance || shop?.balance)}</h2>
                    </div>
                    <div className="text-xs bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 max-w-sm">
                        <p className="font-bold">💡 Lưu ý rút tiền:</p>
                        <p className="text-green-50/80 mt-1 leading-relaxed">Số tiền sẽ được chuyển thẳng về tài khoản ngân hàng liên kết của chủ cửa hàng trong vòng 24h làm việc.</p>
                    </div>
                </div>

                {/* Wallet Transaction History */}
                <div className="space-y-4">
                    <h3 className="font-extrabold text-gray-900 text-lg">Lịch sử giao dịch ví</h3>
                    {loadingWallet ? (
                        <div className="flex justify-center py-6"><div className="animate-spin w-6 h-6 border-2 border-[#00b14f] border-t-transparent rounded-full" /></div>
                    ) : walletHistory.length === 0 ? (
                        <div className="bg-white border border-gray-100 p-12 text-center rounded-2xl text-gray-400 text-sm">Chưa có giao dịch nào được ghi nhận.</div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="p-4 text-xs font-bold text-gray-400 uppercase">Mã GD</th>
                                            <th className="p-4 text-xs font-bold text-gray-400 uppercase">Loại</th>
                                            <th className="p-4 text-xs font-bold text-gray-400 uppercase">Số tiền</th>
                                            <th className="p-4 text-xs font-bold text-gray-400 uppercase">Số dư sau GD</th>
                                            <th className="p-4 text-xs font-bold text-gray-400 uppercase">Nội dung</th>
                                            <th className="p-4 text-xs font-bold text-gray-400 uppercase">Thời gian</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 text-sm">
                                        {walletHistory.map(w => (
                                            <tr key={w.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="p-4 font-bold text-gray-700">#{w.id}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${w.type === "credit" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                                                        {w.type === "credit" ? "Cộng tiền" : "Rút tiền"}
                                                    </span>
                                                </td>
                                                <td className={`p-4 font-extrabold ${w.type === "credit" ? "text-green-600" : "text-red-500"}`}>
                                                    {w.type === "credit" ? "+" : ""}{fmt(w.amount)}
                                                </td>
                                                <td className="p-4 text-gray-500">{fmt(w.balanceAfter)}</td>
                                                <td className="p-4 font-semibold text-gray-800">{w.note}</td>
                                                <td className="p-4 text-gray-400 text-xs">{new Date(w.createdAt).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* WITHDRAW MODAL */}
            {withdrawModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-8 relative">
                        <button
                            onClick={() => setWithdrawModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
                        >
                            ✕
                        </button>
                        <h2 className="text-xl font-extrabold text-gray-900 mb-4">Rút tiền về tài khoản</h2>
                        <form onSubmit={handleWithdrawSubmit} className="space-y-4 text-left">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Nhập số tiền muốn rút (đ)</label>
                                <input
                                    type="number"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    placeholder="Nhập số tiền..."
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00b14f]"
                                    required
                                    min="50000"
                                    max={revenueData?.summary?.balance || shop?.balance}
                                />
                                <span className="text-[10px] text-gray-400 mt-1 block">Tối thiểu: 50.000đ. Tối đa: {fmt(revenueData?.summary?.balance || shop?.balance)}</span>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-[#00b14f] hover:bg-green-600 text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer"
                            >
                                Xác nhận rút tiền
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default VendorRevenue;
