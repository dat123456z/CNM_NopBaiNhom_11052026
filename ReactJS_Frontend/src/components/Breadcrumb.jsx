import React, { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const humanize = (seg) => {
  const labels = {
    products: "Sản phẩm",
    product: "Sản phẩm",
    cart: "Giỏ hàng",
    checkout: "Thanh toán",
    orders: "Đơn hàng",
    profile: "Tài khoản",
    wishlist: "Sản phẩm yêu thích",
    vendor: "Kênh người bán",
    manager: "Quản lý",
    admin: "Quản trị",
    dashboard: "Bảng điều khiển",
    setup: "Đăng ký cửa hàng",
    reviews: "Đánh giá",
    revenue: "Doanh thu",
    settings: "Cài đặt",
    shippers: "Nhân viên giao hàng",
    promotions: "Khuyến mãi",
  };

  try {
    const d = decodeURIComponent(seg);
    if (labels[d.toLowerCase()]) return labels[d.toLowerCase()];
    if (/^\d+$/.test(d)) return `Chi tiết #${d}`;
    return d.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  } catch (e) {
    return seg;
  }
};

const Breadcrumb = ({ items, showBack = false, align = "viewport", className = "" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const auto = useMemo(() => {
    const segs = location.pathname.split("/").filter(Boolean);
    const list = [{ label: "Trang chủ", to: "/" }];
    segs.forEach((s, i) => {
      const to = "/" + segs.slice(0, i + 1).join("/");
      list.push({ label: humanize(s), to });
    });
    return list;
  }, [location.pathname]);

  const list = Array.isArray(items) && items.length ? items : auto;

  const viewportOffsetStyle = align === "viewport"
    ? { marginLeft: "max(24px, calc((100vw - 1280px)/2 + 24px))" }
    : {};

  return (
    <div className={`w-full ${className}`}>
      <div style={viewportOffsetStyle} className="w-full">
        <nav className="w-full flex items-center gap-3 text-sm text-gray-600" aria-label="Đường dẫn điều hướng">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="px-3 py-1 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition text-xs"
              title="Quay lại"
            >
              ← Quay lại
            </button>
          )}

          <ol className="flex items-center gap-2 truncate">
            {list.map((it, idx) => {
              const last = idx === list.length - 1;
              return (
                <li key={idx} className={`flex items-center ${last ? "font-semibold text-gray-900" : "text-gray-500"}`}>
                  {!last ? (
                    <Link to={it.to} className="hover:underline truncate max-w-xs">
                      {it.label}
                    </Link>
                  ) : (
                    <span className="truncate max-w-xs">{it.label}</span>
                  )}

                  {!last && <span className="mx-2 text-gray-300">/</span>}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default Breadcrumb;
