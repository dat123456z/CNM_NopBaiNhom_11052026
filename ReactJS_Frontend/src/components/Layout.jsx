import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import UserFooter from "./user/Footer";
import VendorFooter from "./vendor/Footer";

const Layout = () => {
    const { pathname } = useLocation();
    const isVendor = pathname.startsWith("/vendor");

    return (
        <div className="min-h-screen bg-[#f8f9fb] flex flex-col font-sans text-gray-800">
            <Navbar />
            <div className="flex-1 flex flex-col">
                <Outlet />
            </div>
            {isVendor ? <VendorFooter /> : <UserFooter />}
        </div>
    );
};

export default Layout;
