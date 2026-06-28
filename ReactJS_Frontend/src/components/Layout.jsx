import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import UserFooter from "./user/Footer";
import VendorFooter from "./vendor/Footer";
import Chatbot from "./Chatbot";

const Layout = () => {
    const { pathname } = useLocation();
    const isVendor = pathname.startsWith("/vendor");
    const isManager = pathname.startsWith("/manager");
    const isAdmin = pathname.startsWith("/admin");

    if (isManager || isAdmin) {
        return <Outlet />;
    }

    return (
        <div className="min-h-screen bg-[#f8f9fb] flex flex-col font-sans text-gray-800">
            <Navbar />
            <div className="flex-1 flex flex-col">
                <Outlet />
            </div>
            {!isVendor && <Chatbot />}
            {isVendor ? <VendorFooter /> : <UserFooter />}
        </div>
    );
};

export default Layout;
