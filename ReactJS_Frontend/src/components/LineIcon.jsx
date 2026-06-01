const paths = {
    alert: <path d="M12 9v4m0 4h.01M10.3 4.2 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z" />,
    bank: <path d="M3 10h18M5 10l7-5 7 5M6 10v8m4-8v8m4-8v8m4-8v8M4 18h16M3 21h18" />,
    bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />,
    box: <path d="m21 8-9-5-9 5 9 5 9-5ZM3 8v8l9 5 9-5V8M12 13v8" />,
    card: <path d="M3 7h18v10H3zM3 10h18M7 14h3" />,
    cart: <path d="M3 3h2l2 12h11l3-8H6M9 20h.01M17 20h.01" />,
    check: <path d="m5 12 4 4L19 6" />,
    clipboard: <path d="M9 4h6l1 2h3v15H5V6h3l1-2ZM9 10h6M9 14h6M9 18h4" />,
    coin: <path d="M12 6c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3ZM4 9v6c0 1.7 3.6 3 8 3s8-1.3 8-3V9" />,
    edit: <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3ZM14 8l2 2" />,
    gift: <path d="M20 12v8H4v-8M3 8h18v4H3zM12 8v12M12 8H8.5A2.5 2.5 0 1 1 12 5.5V8Zm0 0h3.5A2.5 2.5 0 1 0 12 5.5V8Z" />,
    heart: <path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21l8.8-8.3a5 5 0 0 0 0-7.1Z" />,
    home: <path d="m3 11 9-8 9 8v10h-6v-6H9v6H3z" />,
    mapPin: <path d="M12 21s7-5.3 7-12A7 7 0 1 0 5 9c0 6.7 7 12 7 12ZM12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />,
    packageCheck: <path d="m21 8-9-5-9 5 9 5 9-5ZM3 8v8l9 5 9-5V8M8 16l2 2 5-5" />,
    phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.4 2.4a2 2 0 0 1-.6 1.8L7.7 9.1a16 16 0 0 0 7.2 7.2l1.2-1.2a2 2 0 0 1 1.8-.6l2.4.4a2 2 0 0 1 1.7 2Z" />,
    receipt: <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3ZM9 8h6M9 12h6M9 16h4" />,
    search: <path d="m21 21-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />,
    shield: <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />,
    shop: <path d="M4 10h16l-1-6H5l-1 6ZM6 10v10h12V10M9 20v-6h6v6" />,
    star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1-4.4-4.3 6.1-.9L12 3Z" />,
    truck: <path d="M3 6h11v10H3zM14 10h4l3 3v3h-7zM7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />,
    users: <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />,
    wallet: <path d="M3 7h15a3 3 0 0 1 3 3v8H3V7Zm0 0V5a2 2 0 0 1 2-2h12v4M17 13h.01" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
};

const LineIcon = ({ name = "bell", size = 20, className = "", strokeWidth = 1.8 }) => (
    <svg
        aria-hidden="true"
        className={className}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        {paths[name] || paths.bell}
    </svg>
);

export default LineIcon;
