import LineIcon from "../LineIcon";

const FEATURES = [
    { icon: "truck", title: "Miễn phí vận chuyển", text: "Hỗ trợ giao hàng cho các đơn đủ điều kiện." },
    { icon: "shield", title: "Hàng chính hãng", text: "Sản phẩm được kiểm duyệt từ các shop." },
    { icon: "bell", title: "Hỗ trợ nhanh", text: "Theo dõi thông báo và trạng thái đơn hàng." },
    { icon: "card", title: "Thanh toán an toàn", text: "Bảo vệ thông tin giao dịch của bạn." },
];

const UserFooter = () => (
    <footer className="w-full mt-16 pt-12 pb-8 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {FEATURES.map((feature) => (
                    <div key={feature.title} className="flex flex-col items-center">
                        <LineIcon name={feature.icon} size={24} className="text-[#00b14f] mb-2" />
                        <h4 className="font-bold text-sm text-gray-900 mb-1">{feature.title}</h4>
                        <p className="text-xs text-gray-500">{feature.text}</p>
                    </div>
                ))}
            </div>
            <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
                <span className="font-bold text-[#00b14f] text-base">UTEShop</span>
                <span>© {new Date().getFullYear()} UTEShop. All rights reserved.</span>
                <div className="flex gap-4">
                    <a href="#" className="hover:text-gray-700 transition-colors">Điều khoản</a>
                    <a href="#" className="hover:text-gray-700 transition-colors">Chính sách</a>
                    <a href="#" className="hover:text-gray-700 transition-colors">Liên hệ</a>
                </div>
            </div>
        </div>
    </footer>
);

export default UserFooter;
