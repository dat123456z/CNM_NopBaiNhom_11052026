import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/user/Profile";
import HomePage from "./pages/user/HomePage";
import ProductPage from "./pages/user/ProductPage";
import ProductDetail from "./pages/user/ProductDetail";
import CartPage from "./pages/user/CartPage";
import CheckoutPage from "./pages/user/CheckoutPage";
import OrdersPage from "./pages/user/OrdersPage";
import OrderDetailPage from "./pages/user/OrderDetailPage";
import WishlistPage from "./pages/user/WishlistPage";
import VendorOnboarding from "./pages/vendor/VendorOnboarding";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import Navbar from "./components/Navbar";
import { CartProvider } from "./context/CartContext";

const Layout = () => (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col font-sans text-gray-800">
        <Navbar />
        <div className="flex-1 flex flex-col">
            <Outlet />
        </div>
    </div>
);

function App() {
    return (
        <BrowserRouter>
            <CartProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />

                    <Route element={<Layout />}>
                        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        <Route path="/products" element={<ProtectedRoute><ProductPage /></ProtectedRoute>} />
                        <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
                        <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                        <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                        <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
                        <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
                        <Route path="/vendor/setup" element={<ProtectedRoute><VendorOnboarding /></ProtectedRoute>} />
                        <Route path="/vendor/dashboard/*" element={<ProtectedRoute><VendorDashboard /></ProtectedRoute>} />
                        <Route path="/manager/dashboard" element={<ProtectedRoute><ManagerDashboard /></ProtectedRoute>} />
                    </Route>
                </Routes>
            </CartProvider>
        </BrowserRouter>
    );
}

export default App;