const Product = require("../models/Product");

const SHOP_ID = 1;

const PRODUCT_DATA = [
    // ================================================
    // DANH MỤC 1: THỜI TRANG NAM (ID sản phẩm: 1 - 10)
    // ================================================
    // Sản phẩm 1
    {
        shopId: SHOP_ID,
        title: "Áo thun basic unisex",
        description:
            "Áo thun cotton 100% mềm mại, form regular vừa vặn. Thoáng khí, thấm hút mồ hôi tốt, phù hợp mặc hàng ngày.",
        price: 150000,
        originalPrice: 200000,
        images: [
            "https://cdn.phototourl.com/member/2026-05-28-e4a6999e-687d-4fdc-9599-f839f47fc0f7.png",
            "https://cdn.phototourl.com/member/2026-05-28-d2263d98-c237-4543-aff1-4d243ef5a05c.png",
            "https://cdn.phototourl.com/member/2026-05-28-55bf3f93-8085-4ba3-82c5-f2ef2f2e70bb.png",
            "https://cdn.phototourl.com/member/2026-05-28-0b896cf9-7d8f-4b2b-acd3-c95f85c4f54c.png"
        ],
        category: "Thời trang Nam",
        stock: 25,
        sold: 120,
        similarIds: [3, 7],
        colors: [
            { label: "Đen", value: "#161616" },
            { label: "Đỏ", value: "#9A0102" },
            { label: "Xanh rêu", value: "#02382C" },
            { label: "Xanh dương", value: "#0A2A7D" }
        ],
    },
    // Sản phẩm 2
    {
        shopId: SHOP_ID,
        title: "Quần jean slim fit",
        description:
            "Quần jean co giãn nhẹ, dáng slim phong cách. Chất liệu denim cao cấp bền bỉ, dễ phối đồ.",
        price: 350000,
        originalPrice: 400000,
        images: [
            "https://cdn.phototourl.com/member/2026-05-28-ffc97669-a6c9-4b1c-86f1-01382b0bfe48.png",
            "https://cdn.phototourl.com/member/2026-05-28-0736e72d-1bae-42f8-acf6-2c628a9527af.png",
            "https://cdn.phototourl.com/member/2026-05-28-307c9e56-f38f-4acb-a8b6-feba7e3714e4.png",
            "https://cdn.phototourl.com/member/2026-05-28-65b4101f-0f05-4f13-a83c-5979751bc93c.png"
        ],
        category: "Thời trang Nam",
        stock: 8,
        sold: 89,
        similarIds: [4, 10],
        colors: [
            { label: "Vintage", value: "#A7A797" },
            { label: "Xám sáng", value: "#595C67" },
            { label: "Wash vàng", value: "#8A8B86" },
            { label: "Đen", value: "#16171B" }
        ],
    },
    // Sản phẩm 3
    {
        shopId: SHOP_ID,
        title: "Áo sơ mi nam công sở",
        description:
            "Áo sơ mi tay dài form chuẩn, vải chống nhăn và cực mát, thích hợp đi làm và sự kiện.",
        price: 320000,
        originalPrice: 400000,
        images: [
            "https://cdn.phototourl.com/member/2026-05-28-24fe7e23-6f77-4d91-96d2-e70179e5c1e9.png",
            "https://cdn.phototourl.com/free/2026-05-28-c1dbc4b8-5796-4956-a905-3d7bbfbde398.png",
            "https://cdn.phototourl.com/free/2026-05-28-3709f106-6722-4c63-befa-4d70d49082fa.png"
        ],
        category: "Thời trang Nam",
        stock: 40,
        sold: 150,
        similarIds: [1, 7],
        colors: [
            { label: "Trắng", value: "#ffffff" },
            { label: "Xanh dương", value: "#33365B" },
            { label: "Xám đen", value: "#2A2A2A" }
        ],
    },
    // Sản phẩm 4
    {
        shopId: SHOP_ID,
        title: "Áo khoác da biker mạnh mẽ",
        description:
            "Áo khoác da PU cao cấp, kiểu dáng biker mạnh mẽ, nam tính và chống gió tốt.",
        price: 850000,
        originalPrice: 1200000,
        images: [
            "https://cdn.phototourl.com/free/2026-05-28-ecb3ae45-70ec-4c9b-aee3-61eef0b6aa58.png",
            "https://cdn.phototourl.com/free/2026-05-28-3d8c25a6-a987-435d-8070-c3f2d3178dde.png",
        ],
        category: "Thời trang Nam",
        stock: 15,
        sold: 34,
        similarIds: [9],
        colors: [
            { label: "Đen", value: "#161616" },
            { label: "Đỏ", value: "#84171E" }
        ],
    },
    // Sản phẩm 5
    {
        shopId: SHOP_ID,
        title: "Quần short kaki túi hộp",
        description:
            "Quần short nam phong cách bụi bặm, nhiều túi tiện lợi, chất kaki washed bền bỉ.",
        price: 220000,
        originalPrice: 300000,
        images: [
            "https://cdn.phototourl.com/free/2026-05-28-453af397-f2ef-4f18-b50a-a93046b228da.png",
            "https://cdn.phototourl.com/free/2026-05-28-7af571b9-9331-4a82-83e7-ffc663f97612.png",
            "https://cdn.phototourl.com/free/2026-05-28-6b5b75b1-ad55-4cb0-8ebc-faf5ae9d4c70.png"
        ],
        category: "Thời trang Nam",
        stock: 30,
        sold: 56,
        similarIds: [4],
        colors: [
            { label: "Trắng", value: "#ffffff" },
            { label: "Đen", value: "#16171B" },
            { label: "Be", value: "#E6D8CF" }
        ],
    },
    // Sản phẩm 6
    {
        shopId: SHOP_ID,
        title: "Áo polo nam phối bo cổ",
        description:
            "Áo polo chất cá sấu cotton co giãn 4 chiều, thấm hút mồ hôi, phom dáng lịch sự.",
        price: 250000,
        originalPrice: 320000,
        images: [
            "https://cdn.phototourl.com/free/2026-05-28-31036e59-217b-4a09-bcbb-f876598134f7.png",
            "https://cdn.phototourl.com/free/2026-05-28-5d0cd6ac-253f-4b07-8df5-18101a3cfed2.png",
            "https://cdn.phototourl.com/free/2026-05-28-7a152f2e-e267-468b-9704-6bdfef4f4f95.png"
        ],
        category: "Thời trang Nam",
        stock: 50,
        sold: 210,
        similarIds: [1, 3],
        colors: [
            { label: "Đen", value: "#16171B" },
            { label: "Trắng", value: "#ffffff" },
            { label: "Nâu", value: "#341D13" }
        ],
    },
    // Sản phẩm 7
    {
        shopId: SHOP_ID,
        title: "Bộ vest nam lịch lãm",
        description:
            "Bộ suit nam gồm áo vest và quần tây đồng màu, đường may tinh tế chuẩn dáng công sở.",
        price: 1850000,
        originalPrice: 2500000,
        images: [
            "https://cdn.phototourl.com/member/2026-05-28-fb80e55e-7b9a-4a5c-8510-a4c06e58df85.png",
            "https://cdn.phototourl.com/member/2026-05-28-a7284c1e-ec1e-4dd1-82d5-e9b8faa2d2d1.png",
            "https://cdn.phototourl.com/member/2026-05-28-53985588-b554-434e-befd-0f3e928261d5.png",
            "https://cdn.phototourl.com/member/2026-05-28-4d29e749-e2bb-4ba7-b55f-66a309d75cce.png"
        ],
        category: "Thời trang Nam",
        stock: 10,
        sold: 12,
        similarIds: [3, 10],
        colors: [
            { label: "Be", value: "#D7C6AE" },
            { label: "Trắng", value: "#ffffff" },
            { label: "Xanh đậm", value: "#272C41" },
            { label: "Đen", value: "#16171B" }
        ],
    },
    // Sản phẩm 8
    {
        shopId: SHOP_ID,
        title: "Quần tây nam ống côn",
        description:
            "Quần tây chất vải tuyết mưa cao cấp, co giãn nhẹ, không xù lông, đứng dáng.",
        price: 290000,
        originalPrice: 380000,
        images: [
            "https://cdn.phototourl.com/member/2026-05-28-d4a442d3-0bfc-4766-a187-48c0b1bd6d50.png",
            "https://cdn.phototourl.com/member/2026-05-28-f06542d5-f5f0-4b6c-8a7b-611d23668a36.png",
            "https://cdn.phototourl.com/member/2026-05-28-80ec4347-7b86-42b9-996e-4d56b9208df7.png",
            "https://cdn.phototourl.com/member/2026-05-28-225d5f14-43d6-46e4-a62c-bb066b2846b5.png"
        ],
        category: "Thời trang Nam",
        stock: 35,
        sold: 115,
        similarIds: [4, 8],
        colors: [
            { label: "Be", value: "#D7C6AE" },
            { label: "Xám", value: "#838385" },
            { label: "Xanh than", value: "#172441" },
            { label: "Đen", value: "#16171B" }
        ],
    },

    // ===============================================
    // DANH MỤC 2: THỜI TRANG NỮ (ID sản phẩm: 11 - 20)
    // ===============================================
    // Sản phẩm 1
    {
        shopId: SHOP_ID,
        title: "Áo len cardigan nữ",
        description:
            "Áo khoác len dệt kim mỏng nhẹ phong cách Hàn Quốc, thích hợp phối đồ mùa thu đông.",
        price: 320000,
        originalPrice: 400000,
        images: [
            "https://cdn.phototourl.com/member/2026-05-28-d6c3b677-7f67-4552-a7a4-1429ad8cb4b9.png",
            "https://cdn.phototourl.com/member/2026-05-28-0fd3dc61-1e03-4a08-95e9-32f63d9265e7.png",
        ],
        category: "Thời trang Nữ",
        stock: 25,
        sold: 110,
        similarIds: [15, 18],
        colors: [
            { label: "Đen", value: "#1a1a1a" },
            { label: "Be", value: "#EFE2D4" }
        ],
    },
    // Sản phẩm 2
    {
        shopId: SHOP_ID,
        title: "Chân váy chữ A dáng ngắn",
        description:
            "Chân váy chữ A tôn dáng, chất tuyết mưa đứng form, có quần bảo hộ bên trong tiện lợi.",
        price: 180000,
        originalPrice: 240000,
        images: [
            "https://cdn.phototourl.com/free/2026-05-28-f2d497eb-44e7-4ba1-9676-4e8ef9c23850.png",
            "https://cdn.phototourl.com/free/2026-05-28-f402358d-97de-4889-a03f-d42185e8aeee.png",
            "https://cdn.phototourl.com/free/2026-05-28-0d2c695b-ec53-4e4e-965d-3266a29ab9c5.png"
        ],
        category: "Thời trang Nữ",
        stock: 40,
        sold: 210,
        similarIds: [15, 16],
        colors: [
            { label: "Đen", value: "#1a1a1a" },
            { label: "Trắng kem", value: "#ffffff" },
            { label: "Hồng pastel", value: "#DFBDBD" }
        ],
    },
    // Sản phẩm 3
    {
        shopId: SHOP_ID,
        title: "Đầm dạ hội trễ vai sang trọng",
        description:
            "Đầm dạ hội chất satin cao cấp xẻ tà quyến rũ, phù hợp cho các buổi tiệc cuối năm sang chảnh.",
        price: 890000,
        originalPrice: 1200000,
        images: [
            "https://cdn.phototourl.com/free/2026-05-28-2657255f-bead-4a53-82d9-7a3a271b906a.png",
            "https://cdn.phototourl.com/free/2026-05-28-ef087f4f-690c-4240-973a-f0a7d322129f.png",
            "https://cdn.phototourl.com/free/2026-05-28-c304e7be-916a-42e2-aacf-178692d6df79.png"
        ],
        category: "Thời trang Nữ",
        stock: 5,
        sold: 23,
        similarIds: [11, 20],
        colors: [
            { label: "Đen", value: "#1a1a1a" },
            { label: "Đỏ", value: "#991b1b" },
            { label: "Trắng", value: "#E0E4E9" }
        ],
    },
    // Sản phẩm 4
    {
        shopId: SHOP_ID,
        title: "Áo croptop thun gân",
        description:
            "Áo croptop cổ vuông ôm sát, chất thun tăm co giãn cực tốt, hack dáng năng động.",
        price: 99000,
        originalPrice: 150000,
        images: [
            "https://cdn.phototourl.com/free/2026-05-28-7ca57983-7a27-495e-8e24-458d9be023fe.png",
            "https://cdn.phototourl.com/free/2026-05-28-cb410298-9e54-4214-8bee-613d3eeff4b4.png",
            "https://cdn.phototourl.com/free/2026-05-28-626c7fc6-c53a-4e8c-a2a6-9a572d35e754.png",
            "https://cdn.phototourl.com/free/2026-05-28-41f95f99-32a4-4f61-82ff-cb0bdc91454c.png",
            "https://cdn.phototourl.com/free/2026-05-28-bca7db38-a04a-4ed0-a6e2-0b914cdb0ddc.png"
        ],
        category: "Thời trang Nữ",
        stock: 85,
        sold: 430,
        similarIds: [12, 13],
        colors: [
            { label: "Hồng", value: "#C08D88" },
            { label: "Trắng", value: "#ffffff" },
            { label: "Đen", value: "#1a1a1a" },
            { label: "Nâu", value: "#614A3B" },
            { label: "Đỏ đô", value: "#711C2F" }
        ],
    },
    // Sản phẩm 5
    {
        shopId: SHOP_ID,
        title: "Quần ống rộng culottes",
        description:
            "Quần vải ống rộng dáng dài suông cá tính, cạp cao che khuyết điểm bụng tốt.",
        price: 260000,
        originalPrice: 350000,
        images: [
            "https://cdn.phototourl.com/free/2026-05-28-2d778aba-d687-4dd7-ac19-00b7243d08b1.png",
            "https://cdn.phototourl.com/free/2026-05-28-39058204-3f24-487f-8a2b-797188d6fd3e.png",
            "https://cdn.phototourl.com/free/2026-05-28-d7b677ab-39bd-4ae8-bca6-99d881a35779.png",
            "https://cdn.phototourl.com/free/2026-05-28-2c24138a-06b7-4648-b3fa-aef6e126700a.png"
        ],
        category: "Thời trang Nữ",
        stock: 30,
        sold: 165,
        similarIds: [13, 17],
        colors: [
            { label: "Đen", value: "#1a1a1a" },
            { label: "Be khói", value: "#726D61" },
            { label: "Ghi", value: "#2B323B" },
            { label: "Trắng kem", value: "#E9E8E4" }
        ],
    },
    // Sản phẩm 6
    {
        shopId: SHOP_ID,
        title: "Áo khoác tweed dáng ngắn",
        description:
            "Áo khoác dạ tweed khuy vàng sang trọng phong cách tiểu thư quý phái.",
        price: 490000,
        originalPrice: 650000,
        images: [
            "https://cdn.phototourl.com/free/2026-05-28-9e0e4f99-2cc3-4258-a724-6f1aae949eb4.png",
            "https://cdn.phototourl.com/free/2026-05-28-3c4e5d82-a0ca-43ab-92db-981320c7e5f1.png",
        ],
        category: "Thời trang Nữ",
        stock: 12,
        sold: 58,
        similarIds: [12, 20],
        colors: [
            { label: "Trắng kem", value: "#B5BAB1" },
            { label: "Hồng", value: "#D0C0C0" }
        ],
    },
    // Sản phẩm 7
    {
        shopId: SHOP_ID,
        title: "Váy blazer thanh lịch",
        description:
            "Váy dáng blazer cổ đan tông hiện đại, vừa cá tính mạnh mẽ vừa thanh lịch quý phái.",
        price: 390000,
        originalPrice: 500000,
        images: [
            "https://cdn.phototourl.com/free/2026-05-28-c4c1a1d0-ca51-404b-a362-8b118609b3ed.png",
            "https://cdn.phototourl.com/free/2026-05-28-ebce8d8a-a0d5-4c33-aab1-92f44b0502e9.png",
        ],
        category: "Thời trang Nữ",
        stock: 20,
        sold: 74,
        similarIds: [14, 18],
        colors: [
            { label: "Trắng", value: "#ffffff" },
            { label: "Đen", value: "#1a1a1a" }
        ],
    },

    // ==========================================
    // DANH MỤC 3: GIÀY DÉP (ID sản phẩm: 21 - 30)
    // ==========================================
    // Sản phẩm 1
    {
        shopId: SHOP_ID,
        title: "Giày sneaker trắng classic",
        description:
            "Giày thể thao da micro-fiber trơn basic siêu êm ái, phù hợp cho cả đi học lẫn đi chơi.",
        price: 650000,
        originalPrice: 850000,
        images: [
            "https://cdn.phototourl.com/free/2026-05-28-a749d253-d60e-480b-a175-42f7b68d7de0.png",
            "https://cdn.phototourl.com/free/2026-05-28-d90f0b91-66c9-409f-babc-171b893eecd2.png",
            "https://cdn.phototourl.com/member/2026-05-28-7e23f4fe-628b-42a3-98ce-ce16883b1b09.png"
        ],
        category: "Giày dép",
        stock: 14,
        sold: 234,
        similarIds: [22, 30],
        colors: [
            { label: "Trắng", value: "#ffffff" }
        ],
    },
    // Sản phẩm 2
    {
        shopId: SHOP_ID,
        title: "Giày lười slip-on",
        description:
            "Giày lười vải dệt canvas nhẹ thoáng khí, xỏ chân vào là đi ngay cực kỳ tiện lợi.",
        price: 450000,
        originalPrice: 550000,
        images: [
            "https://cdn.phototourl.com/member/2026-05-28-a66858a1-3472-4d43-9cd5-4df12fab4ee7.png",
            "https://cdn.phototourl.com/member/2026-05-28-f212dc68-c331-4517-9988-f4e8ca565c2e.png",
            "https://cdn.phototourl.com/member/2026-05-28-38e27364-27da-454e-bccd-228f39437716.png"
        ],
        category: "Giày dép",
        stock: 35,
        sold: 72,
        similarIds: [21, 29],
        colors: [
            { label: "Đen", value: "#1a1a1a" },
            { label: "Be", value: "#E1D4BF" },
            { label: "Xám", value: "#6b7280" }
        ],
    },
    // Sản phẩm 3
    {
        shopId: SHOP_ID,
        title: "Dép quai ngang đúc nguyên khối",
        description:
            "Dép bánh mì chất liệu nhựa EVA siêu nhẹ, chống trượt nhà tắm và đi mưa thoải mái.",
        price: 120000,
        originalPrice: 180000,
        images: [
            "https://cdn.phototourl.com/member/2026-05-28-57ecb2bb-3e61-47c9-9526-0f46be33cee1.png",
            "https://cdn.phototourl.com/member/2026-05-28-d9eb2fdb-91bf-49f8-a282-04f3e23b0f2a.png",
            "https://cdn.phototourl.com/member/2026-05-28-4a8292cb-64b6-45a7-a41c-d9830f57bd93.png",
            "https://cdn.phototourl.com/member/2026-05-28-d2f784ee-a911-4460-bbfb-8c0e28787ac5.png"
        ],
        category: "Giày dép",
        stock: 100,
        sold: 520,
        similarIds: [28],
        colors: [
            { label: "Đen nhám", value: "#1a1a1a" },
            { label: "Trắng", value: "#f8fafc" },
            { label: "Xám", value: "#6b7280" },
            { label: "Vàng cát", value: "#fef08a" }
        ],
    },
    // Sản phẩm 4
    {
        shopId: SHOP_ID,
        title: "Giày boots da cổ cao nữ",
        description:
            "Boots da cổ thấp gót vuông 5cm sang chảnh phong cách phương Tây hiện đại.",
        price: 520000,
        originalPrice: 650000,
        images: [
            "https://cdn.phototourl.com/member/2026-05-28-1570d9ba-e641-4e3c-b36e-986b41b74ccd.png",
            "https://cdn.phototourl.com/member/2026-05-28-4594660b-55ce-4036-b24c-35c1d2de30c5.png",
        ],
        category: "Giày dép",
        stock: 12,
        sold: 45,
        similarIds: [24],
        colors: [
            { label: "Kaki", value: "#907459" },
            { label: "Nâu", value: "#291E1B" }
        ],
    },
    // Sản phẩm 5
    {
        shopId: SHOP_ID,
        title: "Giày Tây Oxford nam cổ điển",
        description:
            "Giày Tây buộc dây chất da bò thật cao cấp, form ôm chuẩn cho quý ông lịch lãm.",
        price: 1250000,
        originalPrice: 1600000,
        images: [
            "https://cdn.phototourl.com/free/2026-05-28-cac9a852-6f50-4572-9f85-8aa7e7ebc617.png",
            "https://cdn.phototourl.com/free/2026-05-28-2808b9e0-6a9b-4239-b0ac-4b992deafba4.png",
        ],
        category: "Giày dép",
        stock: 15,
        sold: 38,
        similarIds: [29],
        colors: [
            { label: "Đen bóng", value: "#1a1a1a" },
            { label: "Nâu hạt dẻ", value: "#451a03" }
        ],
    },
    // Sản phẩm 6
    {
        shopId: SHOP_ID,
        title: "Sandal học sinh quai hậu",
        description:
            "Giày sandal quai dù học sinh, đế cao su non êm chân, bền bỉ đi học hàng ngày.",
        price: 250000,
        originalPrice: 320000,
        images: [
            "https://cdn.phototourl.com/free/2026-05-28-e5c7edc6-4e18-4e1b-8414-f9017b5896ba.png",
            "https://cdn.phototourl.com/free/2026-05-28-5e1a02e0-5d86-42b0-a53d-412713870ead.png",
        ],
        category: "Giày dép",
        stock: 45,
        sold: 195,
        similarIds: [23],
        colors: [
            { label: "Đen nguyên khối", value: "#1a1a1a" },
            { label: "Xám xanh", value: "#9B9EA1" }
        ],
    },
    // Sản phẩm 7
    {
        shopId: SHOP_ID,
        title: "Dép sục cross tiện lợi",
        description:
            "Dép sục bọc mũi thông thoáng khí, tặng kèm set sticker jibbitz siêu dễ thương.",
        price: 199000,
        originalPrice: 250000,
        images: [
            "https://cdn.phototourl.com/free/2026-05-28-792b63bb-3b27-4081-a8c2-a985f74daeaa.png",
            "https://cdn.phototourl.com/free/2026-05-28-9d89ed8e-d27f-4244-9066-00f048a1a2aa.png",
            "https://cdn.phototourl.com/free/2026-05-28-70da6e22-c92f-4ca0-8e8c-5f3204e18415.png"
        ],
        category: "Giày dép",
        stock: 60,
        sold: 310,
        similarIds: [23],
        colors: [
            { label: "Trắng", value: "#f8fafc" },
            { label: "Đen", value: "#1a1a1a" },
            { label: "Kaki", value: "#C4C0B5" }
        ],
    },
    // Sản phẩm 8
    {
        shopId: SHOP_ID,
        title: "Giày chạy bộ thể thao thoáng khí",
        description:
            "Giày running chuyên dụng, công nghệ đệm khí đàn hồi cực tốt bảo vệ khớp gối.",
        price: 950000,
        originalPrice: 1350000,
        images: [
            "https://cdn.phototourl.com/free/2026-05-28-5981ffac-763a-42a8-8c77-b1b32851129b.png",
            "https://cdn.phototourl.com/free/2026-05-28-5a71a659-663c-4a04-a193-59256da721db.png",
            "https://cdn.phototourl.com/free/2026-05-28-0bee1c80-45f6-47e1-a436-44a9b276df04.png"
        ],
        category: "Giày dép",
        stock: 22,
        sold: 145,
        similarIds: [21],
        colors: [
            { label: "Trắng xanh", value: "#CAD3D4" },
            { label: "Đen", value: "#2F3238" },
            { label: "Xám Đen", value: "#444849" }
        ],
    },

    // =================================================
    // DANH MỤC 4: TÚI XÁCH & BALO (ID sản phẩm: 31 - 40)
    // =================================================
    // Sản phẩm 1
    {
        shopId: SHOP_ID,
        title: "Túi xách da tổng hợp cao cấp",
        description:
            "Túi xách tay nữ form vuông thanh lịch, vân da safiano chống xước cực tốt.",
        price: 450000,
        originalPrice: 600000,
        images: [
            "https://cdn.phototourl.com/member/2026-05-28-58e6dadb-c170-4fee-b11a-271f0bba2395.png",
            "https://cdn.phototourl.com/member/2026-05-28-609bd054-d0b9-41be-8319-c1752e27ef92.png",
            "https://cdn.phototourl.com/member/2026-05-28-c4829af2-3dd3-4cc1-aa19-9840951e6b30.png"
        ],
        category: "Túi xách & Balo",
        stock: 15,
        sold: 88,
        similarIds: [3, 7],
        colors: [
            { label: "Đen", value: "#55535D" },
            { label: "Nâu", value: "#785E60" },
            { label: "Cam đất", value: "#9B5E3A" }
        ],
    },
    // Sản phẩm 2
    {
        shopId: SHOP_ID,
        title: "Balo laptop chống nước 15.6 inch",
        description:
            "Balo công nghệ chuyên dụng, lớp đệm mút chống sốc tổ ong bảo vệ máy tính tối đa.",
        price: 550000,
        originalPrice: 700000,
        images: [
            "https://cdn.phototourl.com/member/2026-05-28-ec83fbb0-edd1-40ac-b0ae-8bdb5e6c0d87.png",
            "https://cdn.phototourl.com/member/2026-05-28-2c53683f-f494-4337-be28-2881af009452.png",
        ],
        category: "Túi xách & Balo",
        stock: 24,
        sold: 156,
        similarIds: [3, 7],
        colors: [
            { label: "Đen", value: "#131313" },
            { label: "Tan", value: "#A39B8D" }
        ],
    },
    // Sản phẩm 3
    {
        shopId: SHOP_ID,
        title: "Túi chéo mini thời trang",
        description:
            "Túi đeo chéo nhỏ gọn đựng vừa điện thoại và thỏi son, thích hợp đi dạo phố.",
        price: 150000,
        originalPrice: 200000,
        images: [
            "https://cdn.phototourl.com/member/2026-05-28-6d4b3351-0058-43a5-a17f-355b7089c3c0.png",
            "https://cdn.phototourl.com/member/2026-05-28-cf13bbb7-5e56-42f1-a39b-0f3163e67521.png",
            "https://cdn.phototourl.com/member/2026-05-28-13c93de0-c787-4850-9165-492cfbca260c.png"
        ],
        category: "Túi xách & Balo",
        stock: 45,
        sold: 320,
        similarIds: [3, 7],
        colors: [
            { label: "Đen", value: "#1a1a1a" },
            { label: "Tím", value: "#6C5C7A" },
            { label: "Xám", value: "#9E9C9B" }
        ],
    },
    // Sản phẩm 4
    {
        shopId: SHOP_ID,
        title: "Balo du lịch phượt cỡ lớn",
        description:
            "Balo trekking dã ngoại dung tích 50L, chất vải dù oxford siêu bền bỉ rách không sờn.",
        price: 750000,
        originalPrice: 850000,
        images: [
            "https://cdn.phototourl.com/member/2026-05-28-18121231-dbe4-4564-836d-63bef2f23dcf.png",
            "https://cdn.phototourl.com/member/2026-05-28-0e0d3501-5b8a-43ad-93cb-a8faa279e514.png",
            "https://cdn.phototourl.com/member/2026-05-28-54a4acaf-bc94-4f28-a86f-00efb6678eb3.png"
        ],
        category: "Túi xách & Balo",
        stock: 10,
        sold: 42,
        similarIds: [3, 7],
        colors: [
            { label: "Hồng", value: "#FCDDD7" },
            { label: "Nâu", value: "#C09576" },
            { label: "Vàng", value: "#E9B62C" }
        ],
    },
    // Sản phẩm 5
    {
        shopId: SHOP_ID,
        title: "Ví cầm tay dự tiệc nữ (Clutch)",
        description:
            "Ví dự tiệc đính đá hạt cườm lấp lánh, kèm dây xích kim loại đeo vai sang trọng.",
        price: 350000,
        originalPrice: 450000,
        images: [
            "https://cdn.phototourl.com/member/2026-05-28-41ef39fb-c957-471c-9205-ea4b07985978.png",
            "https://cdn.phototourl.com/member/2026-05-28-c494b8b7-b38c-4a69-b2fb-63c17c0a367f.png",
        ],
        category: "Túi xách & Balo",
        stock: 8,
        sold: 29,
        similarIds: [3, 7],
        colors: [
            { label: "Đen", value: "#252527" },
            { label: "Da", value: "#DDD8CC" },
        ],
    },
    // Sản phẩm 6
    {
        shopId: SHOP_ID,
        title: "Túi vải canvas đeo vai (Tote)",
        description:
            "Túi tote chất canvas dày dặn, in họa tiết chữ minimalist nhẹ nhàng cho sinh viên.",
        price: 89000,
        originalPrice: 120000,
        images: [
            "https://cdn.phototourl.com/member/2026-05-28-7c1a2d99-bfe6-4852-b4e7-0941e579a055.png",
            "https://cdn.phototourl.com/member/2026-05-28-3f6a1c26-c708-4220-9ee3-68e37eb400bc.png",
            "https://cdn.phototourl.com/free/2026-05-29-15a3449d-c2f7-469b-93b6-675cfbc01d68.png"
        ],
        category: "Túi xách & Balo",
        stock: 120,
        sold: 640,
        similarIds: [3, 7],
        colors: [
            { label: "Đỏ đô", value: "#521114" },
            { label: "Đen", value: "#1a1a1a" },
            { label: "Trắng kem", value: "#B7AFA1" }
        ],
    },
    // Sản phẩm 7
    {
        shopId: SHOP_ID,
        title: "Túi bao tử đeo bụng thể thao",
        description:
            "Túi đeo hông chạy bộ chống nước, có khe luồn tai nghe dây tiện lợi thông minh.",
        price: 135000,
        originalPrice: 190000,
        images: [
            "https://cdn.phototourl.com/member/2026-05-28-965eeb64-653f-45c9-af36-49d8090f12d7.png",
            "https://cdn.phototourl.com/member/2026-05-28-4c8d763d-9aaa-46d7-917a-2e16e3ad388c.png",
            "https://cdn.phototourl.com/member/2026-05-28-ae9955b1-f78f-447d-b5e0-5237b9d2c73a.png",
            "https://cdn.phototourl.com/member/2026-05-28-d7205d8d-7621-4829-b8b4-37f2906d0c05.png"
        ],
        category: "Túi xách & Balo",
        stock: 50,
        sold: 215,
        similarIds: [3, 7],
        colors: [
            { label: "Đen", value: "#373737" },
            { label: "Xanh lam", value: "#464C61" },
            { label: "Xanh rêu", value: "#545445" },
            { label: "Xám", value: "#59585E" }
        ],
    },
    // Sản phẩm 8
    {
        shopId: SHOP_ID,
        title: "Cặp da xách tay đựng tài liệu",
        description:
            "Cặp táp công sở da thật cao cấp đựng vừa tài liệu A4 và laptop mỏng nhẹ, đẳng cấp doanh nhân.",
        price: 1450000,
        originalPrice: 1950000,
        images: [
            "https://cdn.phototourl.com/member/2026-05-29-3d9f8d49-bc8d-4d0e-aa9c-ee34480c7b6c.png",
            "https://cdn.phototourl.com/member/2026-05-29-51338ff0-095d-41dc-bfbd-90377fda6853.png"
        ],
        category: "Túi xách & Balo",
        stock: 7,
        sold: 19,
        similarIds: [3, 7],
        colors: [
            { label: "Xanh Navy", value: "#35425D" },
            { label: "Đen Cổ Điển", value: "#1a1a1a" }
        ],
    },

    // ==========================================
    // DANH MỤC 5: PHỤ KIỆN THỜI TRANG (ID sản phẩm: 41 - 50)
    // ==========================================
    // Sản phẩm 1
    {
        shopId: SHOP_ID,
        title: "Kính râm unisex chống tia UV",
        description:
            "Kính mát phi công mắt vuông chống chói Polarized, bảo vệ mắt hoàn hảo dưới nắng gắt.",
        price: 250000,
        originalPrice: 350000,
        images: [
            "https://cdn.phototourl.com/member/2026-05-29-a33e1ca9-97cf-4c9f-84b8-de0a2ae2abce.png",
            "https://cdn.phototourl.com/member/2026-05-29-cdbf8c43-e4f8-499f-8b2f-71d974f5f946.png",
            "https://cdn.phototourl.com/member/2026-05-29-902ef5d5-ea7b-47a6-a35c-473155fcf785.png",
            "https://cdn.phototourl.com/member/2026-05-29-a365265b-f328-496d-a0fb-309b807bb652.png"
        ],
        category: "Phụ kiện thời trang",
        stock: 40,
        sold: 210,
        similarIds: [3, 7],
        colors: [
            { label: "Đen", value: "#262626" },
            { label: "Vàng chanh", value: "#BEA56F" },
            { label: "Cà phê", value: "#9D7054" },
            { label: "Xanh trong", value: "#BCCBE7" }
        ],
    },
    // Sản phẩm 2
    {
        shopId: SHOP_ID,
        title: "Đồng hồ nam dây da thanh lịch",
        description:
            "Đồng hồ kim nam quartz tối giản, dây da trơn cao cấp mặt kính chống trầy xước sinh hoạt.",
        price: 1200000,
        originalPrice: 1600000,
        images: [
            "https://cdn.phototourl.com/member/2026-05-29-6e9f6c00-4ee9-4966-b77a-fdb72d8520ae.png",
            "https://cdn.phototourl.com/member/2026-05-29-faec5b8d-4d15-46ec-b0ef-58e3ff476580.png",
            "https://cdn.phototourl.com/member/2026-05-29-f0acde95-d84f-4918-9522-21e2493f8dbe.png"
        ],
        category: "Phụ kiện thời trang",
        stock: 15,
        sold: 43,
        similarIds: [45],
        colors: [
            { label: "Đen - Trắng", value: "#1a1a1a" },
            { label: "Nâu - Trắng", value: "#7c2d12" },
            { label: "Đen - Đen", value: "#626262" }
        ],
    },
    // Sản phẩm 3
    {
        shopId: SHOP_ID,
        title: "Thắt lưng nam da bò thật",
        description:
            "Thắt lưng da nam khóa lăn tự động, bản dây mềm mại 3.5cm tinh tế dễ phối quần tây.",
        price: 300000,
        originalPrice: 310000,
        images: [
            "https://cdn.phototourl.com/member/2026-05-29-59ddd82f-ca9e-43f7-8f02-dabef0665834.png",
            "https://cdn.phototourl.com/free/2026-05-29-04842aa3-82d6-44ff-bf73-7df9efd8e36b.png",
            "https://cdn.phototourl.com/free/2026-05-29-9b6ba629-9d47-4550-95ff-cf8397292574.png"
        ],
        category: "Phụ kiện thời trang",
        stock: 55,
        sold: 180,
        similarIds: [],
        colors: [
            { label: "Đen Mờ", value: "#1a1a1a" }
        ],
    },
    // Sản phẩm 4
    {
        shopId: SHOP_ID,
        title: "Mũ lưỡi trai thêu chữ nổi",
        description:
            "Nón kết kaki washed phom mềm cá tính, đuôi khóa kim loại chỉnh size đầu dễ dàng.",
        price: 99000,
        originalPrice: 150000,
        images: [
            "https://cdn.phototourl.com/free/2026-05-29-9a2d43fd-2faa-4c89-b748-1550d382c0de.png",
            "https://cdn.phototourl.com/free/2026-05-29-c952959d-dbb9-409c-a804-c8d38c7b1734.png",
            "https://cdn.phototourl.com/free/2026-05-29-9c698bea-ad87-41a9-b826-1c7a6a25e63c.png",
            "https://cdn.phototourl.com/free/2026-05-29-0a20a42b-10e7-446c-b29d-27bc59c5d2a8.png"
        ],
        category: "Phụ kiện thời trang",
        stock: 80,
        sold: 340,
        similarIds: [46],
        colors: [
            { label: "Trắng Sữa", value: "#f1f5f9" },
            { label: "Đen Basic", value: "#1a1a1a" },
            { label: "Đỏ đô", value: "#460E13" },
            { label: "Vàng", value: "#C99F08" }
        ],
    },
    // Sản phẩm 5
    {
        shopId: SHOP_ID,
        title: "Đồng hồ nữ đính đá dây kim loại",
        description:
            "Đồng hồ lắc tay nữ sang chảnh đính đá Swarovski lấp lánh mạ vàng hồng quý phái.",
        price: 1350000,
        originalPrice: 1850000,
        images: [
            "https://cdn.phototourl.com/free/2026-05-29-f8d32c65-5349-4955-9847-3169676aa689.png",
            "https://cdn.phototourl.com/free/2026-05-29-a5e46525-bfd0-4ed9-8940-941204ce3748.png",
            "https://cdn.phototourl.com/free/2026-05-29-8a3a4197-a121-4329-bb9b-13df40c6047f.png"
        ],
        category: "Phụ kiện thời trang",
        stock: 12,
        sold: 35,
        similarIds: [42],
        colors: [
            { label: "Vàng Hồng", value: "#F3C9D0" },
            { label: "Vàng", value: "#EED4A4" },
            { label: "Bạc Khuyên", value: "#87837E" }
        ],
    },
    // Sản phẩm 6
    {
        shopId: SHOP_ID,
        title: "Mũ len beanie ấm áp mùa đông",
        description:
            "Mũ len trơn gập vành dệt kim gân dày dặn co giãn thoải mái giữ ấm tai.",
        price: 85000,
        originalPrice: 120000,
        images: [
            "https://cdn.phototourl.com/free/2026-05-29-faeb405a-13da-4992-9d16-0da7c8cc6e85.png",
            "https://cdn.phototourl.com/member/2026-05-29-7d01c9a7-ce82-461e-87b9-73268123c652.png",
            "https://cdn.phototourl.com/member/2026-05-29-abf1246c-1499-4759-8636-ef5908c3f9fb.png"
        ],
        category: "Phụ kiện thời trang",
        stock: 65,
        sold: 145,
        similarIds: [44],
        colors: [
            { label: "Đen", value: "#030508" },
            { label: "Nâu", value: "#542B12" },
            { label: "Trắng kem", value: "#C4BAA9" }
        ],
    },
    // Sản phẩm 7
    {
        shopId: SHOP_ID,
        title: "Cà vạt nam lụa cao cấp",
        description:
            "Cà vạt bản nhỏ 6cm lịch lãm dệt vân chìm sang trọng thắt sẵn tiện lợi.",
        price: 140000,
        originalPrice: 200000,
        images: [
            "https://cdn.phototourl.com/member/2026-05-29-45664ca7-1fb0-405b-a978-f570384c6844.png",
            "https://cdn.phototourl.com/member/2026-05-29-a734b74f-64ca-4e52-9b77-1bd29a889332.png",
            "https://cdn.phototourl.com/member/2026-05-29-0d59b8fc-fd55-44b9-900c-fe78fa027b90.png"
        ],
        category: "Phụ kiện thời trang",
        stock: 40,
        sold: 82,
        similarIds: [47],
        colors: [
            { label: "Đỏ Rượu", value: "#7f1d1d" },
            { label: "Xanh Navy", value: "#2B334B" },
            { label: "Đen", value: "#1a1a1a" }
        ],
    },
    // Sản phẩm 8
    {
        shopId: SHOP_ID,
        title: "Vòng tay bạc đính đá unisex",
        description:
            "Lắc tay bạc S925 thiết kế mắt xích cuban đính đá CZ lấp lánh hiphop cá tính.",
        price: 320000,
        originalPrice: 450000,
        images: [
            "https://cdn.phototourl.com/member/2026-05-29-6d3cceb7-3ed5-47e6-a0c8-7ff450540b9f.png",
            "https://cdn.phototourl.com/member/2026-05-29-685b5af0-381e-443a-a86b-fecc4ccba0b0.png",
            "https://cdn.phototourl.com/member/2026-05-29-dd14a2d5-dd36-4718-bee3-c209a35d289f.png",
            "https://cdn.phototourl.com/member/2026-05-29-780fc827-4a92-40a4-b1af-029f289e94e9.png"
        ],
        category: "Phụ kiện thời trang",
        stock: 25,
        sold: 76,
        similarIds: [],
        colors: [
            { label: "Bạc Sáng", value: "#cbd5e1" }
        ],
    },
    // Sản phẩm 9
    {
        shopId: SHOP_ID,
        title: "Găng tay da cừu cảm ứng",
        description:
            "Găng tay nam chất da cừu thật giữ nhiệt, lót nỉ nhung ấm áp bám tay lái tốt lướt điện thoại êm.",
        price: 450000,
        originalPrice: null,
        images: [
            "https://cdn.phototourl.com/member/2026-05-29-41a1a6b3-5679-42a1-8939-d984fe71c31b.png",
            "https://cdn.phototourl.com/free/2026-05-29-666f0470-05d4-483a-b23c-4e3310a376f7.png",
            "https://cdn.phototourl.com/free/2026-05-29-2fc8f722-ea76-41b1-8f54-b21486994a01.png",
            "https://cdn.phototourl.com/free/2026-05-29-772ab83b-c6ab-4453-8134-2c6f812402fd.png"
        ],
        category: "Phụ kiện thời trang",
        stock: 20,
        sold: 94,
        similarIds: [],
        colors: [
            { label: "Đen Tuyền", value: "#1a1a1a" },
            { label: "Hồng", value: "#F8CFD0" },
            { label: "Xám", value: "#A8A2A9" },
            { label: "Be", value: "#E2CBBE" }
        ],
    },

    // ==========================================
    // DANH MỤC 6: ĐỒ THỂ THAO & DÃ NGOẠI (ID sản phẩm: 51 - 60)
    // ==========================================
    // Sản phẩm 1
    {
        shopId: SHOP_ID,
        title: "Quần jogger thun co giãn",
        description:
            "Quần jogger thun nỉ bông dày dặn bo gấu năng động, phù hợp tập gym dạo phố thể thao.",
        price: 220000,
        originalPrice: 280000,
        images: [
            "https://cdn.phototourl.com/free/2026-05-29-56322d29-5cf3-4690-bf09-63623831cedf.png",
            "https://cdn.phototourl.com/free/2026-05-29-435925d0-e806-4e9b-92b4-4c8b5f135c4b.png"
        ],
        category: "Đồ thể thao & Dã ngoại",
        stock: 30,
        sold: 175,
        similarIds: [51],
        colors: [
            { label: "Đen", value: "#1a1a1a" },
            { label: "Xám", value: "#9ca3af" }
        ],
    },
    // Sản phẩm 2
    {
        shopId: SHOP_ID,
        title: "Áo khoác gió bomber thu đông",
        description:
            "Áo khoác gió 2 lớp tráng bạc chống thấm nước cản gió bụi nhẹ cực tốt đường may ép seam kĩ.",
        price: 380000,
        originalPrice: 480000,
        images: [
            "https://cdn.phototourl.com/free/2026-05-29-50f6a214-4f78-4791-8824-a6d305100735.png",
            "https://cdn.phototourl.com/free/2026-05-29-c00bdb33-0f2f-48e9-8eac-e2d2c3596500.png",
            "https://cdn.phototourl.com/free/2026-05-29-d7e61e57-9508-465f-90af-e9d15c73db0a.png",
            "https://cdn.phototourl.com/free/2026-05-29-a8064265-71fe-4608-b6f5-f8c2f3be8b5b.png"
        ],
        category: "Đồ thể thao & Dã ngoại",
        stock: 25,
        sold: 110,
        similarIds: [56],
        colors: [
            { label: "Đen nhám", value: "#1a1a1a" },
            { label: "Oliu", value: "#4E5F5C" },
            { label: "Xám", value: "#828282" },
            { label: "Be", value: "#E1D8C6" }
        ],
    },
    // Sản phẩm 3
    {
        shopId: SHOP_ID,
        title: "Áo khoác giữ nhiệt nam chạy bộ",
        description:
            "Áo running ôm body công nghệ thun lạnh giữ ấm cơ và thoát hơi mồ hôi siêu tốc.",
        price: 290000,
        originalPrice: 380000,
        images: [
            "https://cdn.phototourl.com/free/2026-05-29-53e152ea-49ac-4fd9-b635-f22eb9d31c13.png",
            "https://cdn.phototourl.com/member/2026-05-29-80a77293-5668-4775-878f-c7a423c8ed71.png",
            "https://cdn.phototourl.com/member/2026-05-29-0a429f08-90c2-4848-a87b-c532fc0e9097.png"
        ],
        category: "Đồ thể thao & Dã ngoại",
        stock: 30,
        sold: 94,
        similarIds: [53],
        colors: [
            { label: "Xám Ghi", value: "#94a3b8" },
            { label: "Đỏ đô", value: "#742A31" },
            { label: "Xanh navy", value: "#2E2D44" }
        ],
    },
    // Sản phẩm 4
    {
        shopId: SHOP_ID,
        title: "Thảm tập yoga chống trượt tpe",
        description:
            "Thảm yoga chất liệu TPE sinh học đúc 2 lớp dày 6mm có định tuyến chuẩn chống trượt tuyệt đối.",
        price: 320000,
        originalPrice: 420000,
        images: [
            "https://cdn.phototourl.com/member/2026-05-29-3ff051b2-d7eb-42f8-a7dd-b9e7a169d7f3.png",
            "https://cdn.phototourl.com/member/2026-05-29-e8b557e0-2986-4612-a42d-f1156922b81a.png",
            "https://cdn.phototourl.com/member/2026-05-29-a81f1d30-e3cf-41bf-932b-7e2ef1e795e0.png"
        ],
        category: "Đồ thể thao & Dã ngoại",
        stock: 40,
        sold: 230,
        similarIds: [],
        colors: [
            { label: "Hồng", value: "#D47BAA" },
            { label: "Xám", value: "#646464" },
            { label: "Tím", value: "#664069" }
        ],
    },
    // Sản phẩm 5
    {
        shopId: SHOP_ID,
        title: "Bình nước thể thao giữ nhiệt 1L",
        description:
            "Bình nước inox 314 sơn tĩnh điện nhám, giữ đá lạnh 24h kèm ống hút silicone tiện ích.",
        price: 260000,
        originalPrice: null,
        images: [
            "https://cdn.phototourl.com/member/2026-05-29-5f16a98d-7d44-495d-a1d8-8ed6f0ff9074.png",
            "https://cdn.phototourl.com/member/2026-05-29-a80487da-73a1-4ca8-9e56-f1b58a0bae46.png",
            "https://cdn.phototourl.com/member/2026-05-29-97b09b72-eaa4-4f57-8c21-33f9931401cd.png"
        ],
        category: "Đồ thể thao & Dã ngoại",
        stock: 80,
        sold: 310,
        similarIds: [],
        colors: [
            { label: "Đen Nhám", value: "#1a1a1a" },
            { label: "Vàng", value: "#C18317" },
            { label: "Xanh Rêu", value: "#1A3D43" }
        ],
    },

    // ==========================================
    // DANH MỤC 7: ĐỒ ĐIỆN TỬ & CÔNG NGHỆ (ID sản phẩm: 61 - 70)
    // ==========================================
    // Sản phẩm 1
    {
        shopId: SHOP_ID,
        title: "Tai nghe Bluetooth chụp tai chống ồn",
        description:
            "Tai nghe headphone ANC chủ động chống ồn, âm bass sâu lực, thời lượng pin trâu 40 tiếng liên tục.",
        price: 790000,
        originalPrice: 1100000,
        images: [
            "https://cdn.phototourl.com/member/2026-05-29-bddd17ea-4d3c-4798-823e-1c15834d4db2.png",
            "https://cdn.phototourl.com/member/2026-05-29-fc7f3c7e-9316-4a0d-8551-2caea6b58fbc.png",
            "https://cdn.phototourl.com/free/2026-05-29-33c829ba-5097-4b9d-bc69-feb317aac3e4.png"
        ],
        category: "Đồ điện tử & Công nghệ",
        stock: 25,
        sold: 140,
        similarIds: [64],
        colors: [
            { label: "Đen", value: "#1C1B1E" },
            { label: "Xanh lam", value: "#B8CAEB" },
            { label: "Trắng Sữa", value: "#E3D4BE" }
        ],
    },
    // Sản phẩm 2
    {
        shopId: SHOP_ID,
        title: "Chuột máy tính không dây công thái học",
        description:
            "Chuột bluetooth silent chống mỏi cổ tay độc đáo, nút bấm êm tuyệt đối ko gây tiếng động sát thương.",
        price: 320000,
        originalPrice: null,
        images: [
            "https://cdn.phototourl.com/free/2026-05-29-3bbd7905-c9fe-4274-a56b-8fa52fcda870.png",
            "https://cdn.phototourl.com/free/2026-05-29-e1ea3976-cf3e-4b69-8f01-013e911b4397.png",
            "https://cdn.phototourl.com/free/2026-05-29-fcf696fd-79aa-4071-8a12-3ca37aa4543d.png",
            "https://cdn.phototourl.com/free/2026-05-29-7947087b-f9be-4e52-9493-f0ae5a1537a2.png"
        ],
        category: "Đồ điện tử & Công nghệ",
        stock: 45,
        sold: 310,
        similarIds: [63],
        colors: [
            { label: "Đen Nhám", value: "#303030" },
            { label: "Xanh lam", value: "#72AFE6" },
            { label: "Xanh lá", value: "#BCD8B8" },
            { label: "Tím", value: "#D4BDF5" }
        ],
    },
    // Sản phẩm 3
    {
        shopId: SHOP_ID,
        title: "Bàn phím cơ chuyên game RGB",
        description:
            "Bàn phím layout 75% hotswap dễ độ, có lót foam tiêu âm sẵn, switch gõ siêu mượt mướt.",
        price: 850000,
        originalPrice: 1200000,
        images: [
            "https://cdn.phototourl.com/free/2026-05-29-6b53893e-f318-4e83-9246-9546f4d4bbe8.png",
            "https://cdn.phototourl.com/free/2026-05-29-4088d11d-8b81-4564-9ae9-521bf63c7d9a.png",
            "https://cdn.phototourl.com/free/2026-05-29-6b33aaaa-5444-4064-8159-e8b12b4715f5.png"
        ],
        category: "Đồ điện tử & Công nghệ",
        stock: 18,
        sold: 95,
        similarIds: [62],
        colors: [
            { label: "Xanh đen", value: "#CDE4F1" },
            { label: "Xanh navy", value: "#89A5A0" },
            { label: "Vàng đen", value: "#E7C659" }
        ],
    },
    // Sản phẩm 4
    {
        shopId: SHOP_ID,
        title: "Loa Bluetooth mini chống nước",
        description:
            "Loa cầm tay kháng nước chuẩn IPX7 nhỏ gọn bass mạnh rung màng loa ngoài cực phê.",
        price: 490000,
        originalPrice: 650000,
        images: [
            "https://cdn.phototourl.com/free/2026-05-29-f0a51a93-d9cd-45e0-961d-d7bc9005a996.png",
            "https://cdn.phototourl.com/free/2026-05-29-8942a225-a93a-4536-96ae-334823626871.png",
            "https://cdn.phototourl.com/member/2026-05-29-2e15191b-c542-4724-bc58-219733c72405.png",
            "https://cdn.phototourl.com/member/2026-05-29-5ea4d53f-fb20-445b-8390-c32022bd8b55.png"
        ],
        category: "Đồ điện tử & Công nghệ",
        stock: 30,
        sold: 210,
        similarIds: [61],
        colors: [
            { label: "Trắng", value: "#FFFFFF" },
            { label: "Đen", value: "#545354" },
            { label: "Đỏ", value: "#E56279" },
            { label: "Xanh dương", value: "#575F73" }
        ],
    },
    // Sản phẩm 5
    {
        shopId: SHOP_ID,
        title: "Sạc dự phòng nhanh 20000mAh",
        description:
            "Pin sạc dự phòng hỗ trợ sạc nhanh chuẩn PD 22.5W hiển thị % pin LED tinh xảo.",
        price: 390000,
        originalPrice: null,
        images: [
            "https://cdn.phototourl.com/member/2026-05-29-b7e0d6ce-f298-4813-ae59-fce3b4323bc9.png",
            "https://cdn.phototourl.com/member/2026-05-29-58063940-bc11-47f2-92ba-9ff4f780a924.png",
            "https://cdn.phototourl.com/member/2026-05-29-dc371995-d730-4991-bcfd-66faf2c93c56.png"
        ],
        category: "Đồ điện tử & Công nghệ",
        stock: 50,
        sold: 420,
        similarIds: [66, 67],
        colors: [
            { label: "Xanh da trời", value: "#D8ECFE" },
            { label: "Xám khói", value: "#A2A5B9" },
            { label: "Tím", value: "#917FB7" }
        ],
    },
    // Sản phẩm 6
    {
        shopId: SHOP_ID,
        title: "Cáp sạc nhanh bọc dù đa năng",
        description:
            "Dây cáp bọc dù siêu bền chống đứt gãy gập, lõi đồng dày hỗ trợ truyền dữ liệu 480Mbps.",
        price: 85000,
        originalPrice: 120000,
        images: [
            "https://cdn.phototourl.com/member/2026-05-29-17e7960b-e1ef-4b3f-8202-18e358cc6a58.png",
            "https://cdn.phototourl.com/member/2026-05-29-d0fa3abe-da1a-4933-bda8-fe15dbfc5d76.png",
            "https://cdn.phototourl.com/member/2026-05-29-6ee8c2aa-c148-4ee7-a25d-18bcd51a4b83.png"
        ],
        category: "Đồ điện tử & Công nghệ",
        stock: 150,
        sold: 680,
        similarIds: [65],
        colors: [
            { label: "Đen", value: "#3A3B3F" },
            { label: "Trắng", value: "#E1E1E1" },
            { label: "Xanh dương", value: "#B9E5EF" }
        ],
    },
    {
        shopId: SHOP_ID,
        title: "Máy phun sương tạo ẩm mini",
        description:
            "Máy phun sương cắm cổng USB, siêu âm khuếch tán êm nhẹ tích hợp đèn ngủ LED đổi màu dịu mắt.",
        price: 150000,
        originalPrice: 220000,
        images: [
            "https://cdn.phototourl.com/member/2026-05-29-21644f88-a199-47b5-be5a-dedc1760d1d1.png",
            "https://cdn.phototourl.com/member/2026-05-29-b5c195e3-ecec-4de0-9d7c-0318df7c9186.png",
            "https://cdn.phototourl.com/free/2026-05-29-f45290a3-e01d-4cc8-a99b-7f68ac68015f.png",
            "https://cdn.phototourl.com/free/2026-05-29-e7b8a17d-6d06-4be1-8b4d-46fd45e7e9c9.png"
        ],
        category: "Đồ điện tử & Công nghệ",
        stock: 35,
        sold: 215,
        similarIds: [],
        colors: [
            { label: "Hồng phấn", value: "#C8A7A0" },
            { label: "Xanh da trời", value: "#A1B1CC" },
            { label: "Đen", value: "#36323C" },
            { label: "Xanh bạc hà", value: "#9CC6AF" }
        ],
    }
];

console.log(`>>> Chuẩn bị seed ${PRODUCT_DATA.length} sản phẩm...`);

const seedIfEmpty = async () => {
    try {
        const User = require("../models/User");
        const Shop = require("../models/Shop");
        const bcrypt = require("bcrypt");

        const hashedPassword = await bcrypt.hash("123456", 10);

        // 1. Seed users
        let adminUser = await User.findOne({ where: { email: "admin@gmail.com" } });
        if (!adminUser) {
            adminUser = await User.create({
                name: "Admin",
                email: "admin@gmail.com",
                password: hashedPassword,
                role: "admin",
                isActive: true
            });
            console.log(">>> Seeded Admin User.");
        }

        let managerUser = await User.findOne({ where: { email: "manager@gmail.com" } });
        if (!managerUser) {
            managerUser = await User.create({
                name: "Manager",
                email: "manager@gmail.com",
                password: hashedPassword,
                role: "manager",
                isActive: true
            });
            console.log(">>> Seeded Manager User.");
        }

        let vendor1User = await User.findOne({ where: { email: "vendor1@gmail.com" } });
        if (!vendor1User) {
            vendor1User = await User.create({
                name: "Vendor 1",
                email: "vendor1@gmail.com",
                password: hashedPassword,
                role: "vendor",
                isActive: true,
                points: 500
            });
            console.log(">>> Seeded Vendor 1 User.");
        }

        let vendor2User = await User.findOne({ where: { email: "vendor2@gmail.com" } });
        if (!vendor2User) {
            vendor2User = await User.create({
                name: "Vendor 2",
                email: "vendor2@gmail.com",
                password: hashedPassword,
                role: "vendor",
                isActive: true,
                points: 500
            });
            console.log(">>> Seeded Vendor 2 User.");
        }

        let regularUser = await User.findOne({ where: { email: "user@gmail.com" } });
        if (!regularUser) {
            regularUser = await User.create({
                name: "User",
                email: "user@gmail.com",
                password: hashedPassword,
                role: "user",
                isActive: true,
                points: 100,
                addresses: [{ id: 1, text: "789 Duong 3/2, Quan 10, TP. HCM", name: "User", phone: "0911223344" }]
            });
            console.log(">>> Seeded Regular User.");
        }

        // 2. Seed shops
        let uteShop = await Shop.findOne({ where: { userId: vendor1User.id } });
        if (!uteShop) {
            uteShop = await Shop.create({
                userId: vendor1User.id,
                name: "UTEShop",
                slug: "uteshop",
                description: "Cửa hàng thời trang và phong cách sống hàng đầu.",
                logo: "https://images.unsplash.com/photo-1472851294608-062f824d296e?w=100",
                phone: "0909123456",
                email: "vendor1@gmail.com",
                address: "1 Vo Van Ngan, Thu Duc, TP. HCM",
                balance: 10000000.00,
                rating: 4.8,
                reviewCount: 0,
                status: "active",
                isVerified: true
            });
            console.log(">>> Seeded Shop UTEShop.");
        }

        let techStore = await Shop.findOne({ where: { userId: vendor2User.id } });
        if (!techStore) {
            techStore = await Shop.create({
                userId: vendor2User.id,
                name: "TechStore",
                slug: "techstore",
                description: "Siêu thị công nghệ, điện thoại, laptop, phụ kiện chính hãng.",
                logo: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=100",
                phone: "0909654321",
                email: "vendor2@gmail.com",
                address: "2 Vo Van Ngan, Thu Duc, TP. HCM",
                balance: 15000000.00,
                rating: 4.9,
                reviewCount: 0,
                status: "active",
                isVerified: true
            });
            console.log(">>> Seeded Shop TechStore.");
        }

        // 3. Seed products dynamically assigned to the two shops
        const count = await Product.count();
        if (count >= PRODUCT_DATA.length) {
            console.log(`>>> Products đã tồn tại (${count}), bỏ qua seeding.`);
            return;
        } else if (count > 0) {
            console.log(`>>> Products hiện có ${count}/${PRODUCT_DATA.length}, sẽ bổ sung sản phẩm thiếu.`);
        }

        const slugify = (text) =>
            text
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/gi, 'd')
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-')
                .replace(/[^\w-]/g, '')
                .replace(/-+/g, '-');

        let inserted = 0;
        for (const p of PRODUCT_DATA) {
            const targetShopId = p.category === "Đồ điện tử & Công nghệ" ? techStore.id : uteShop.id;
            const [prod, created] = await Product.findOrCreate({
                where: { title: p.title },
                defaults: {
                    ...p,
                    shopId: targetShopId,
                    slug: p.slug || `${slugify(p.title)}-${Date.now()}`
                }
            });
            if (created) inserted += 1;
        }
        console.log(`>>> Seed hoàn tất. Thêm mới ${inserted} / ${PRODUCT_DATA.length} sản phẩm`);
    } catch (err) {
        console.error(">>> Seed error:", err.message);
    }
};

module.exports = { seedIfEmpty };

