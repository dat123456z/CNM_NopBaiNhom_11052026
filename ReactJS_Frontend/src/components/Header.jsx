import React from "react";
import { Link } from "react-router-dom";

const Header = ({ title, subtitle, children, small = false }) => {
    const padding = small ? "py-6" : "py-10";
    const titleClass = small ? "text-2xl" : "text-3xl";
    const subtitleClass = small ? "text-sm" : "text-sm";

    return (
        <header className={`bg-linear-to-r from-primary/90 to-indigo-600 text-white ${padding}`}>
            <div className="container mx-auto px-4 flex items-center justify-between">
                <div>
                    <h1 className={`${titleClass} font-extrabold`}>{title}</h1>
                    {subtitle && <p className={`${subtitleClass} opacity-90`}>{subtitle}</p>}
                </div>
                <div>{children}</div>
            </div>
        </header>
    );
};

export default Header;
