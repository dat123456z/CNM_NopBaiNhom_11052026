import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import UserHeader from "./user/Header";
import VendorHeader from "./vendor/Header";

const Navbar = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { items } = useCart();
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    const isVendor = pathname.startsWith("/vendor");
    const cartCount = items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

    useEffect(() => {
        const syncAuth = () => {
            const nextToken = localStorage.getItem("accessToken");
            const rawUser = localStorage.getItem("user");
            setToken(nextToken);
            try {
                setUser(rawUser ? JSON.parse(rawUser) : null);
            } catch {
                setUser(null);
            }
        };

        syncAuth();
        window.addEventListener("storage", syncAuth);
        return () => window.removeEventListener("storage", syncAuth);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
        navigate("/login");
    };

    if (isVendor) {
        return <VendorHeader user={user} token={token} onLogout={handleLogout} />;
    }

    return <UserHeader user={user} token={token} cartCount={cartCount} onLogout={handleLogout} />;
};

export default Navbar;
