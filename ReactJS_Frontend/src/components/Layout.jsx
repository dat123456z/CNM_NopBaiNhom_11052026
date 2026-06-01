import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";

const Footer = () => (
    <footer className="bg-white border-t border-gray-100 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <span className="font-bold text-[#00b14f] text-base">UTEShop</span>
            <span>© {new Date().getFullYear()} UTEShop. All rights reserved.</span>
            <div className="flex gap-4">
                <a href="#" className="hover:text-gray-700 transition-colors">Điều khoản</a>
                <a href="#" className="hover:text-gray-700 transition-colors">Chính sách</a>
                <a href="#" className="hover:text-gray-700 transition-colors">Liên hệ</a>
            </div>
        </div>
    </footer>
);

const Layout = () => (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col font-sans text-gray-800">
        <Navbar />
        <div className="flex-1 flex flex-col">
            <Outlet />
        </div>
        <Footer />
    </div>
);

export default Layout;