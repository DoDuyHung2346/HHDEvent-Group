import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#4f46e5",
};

export const metadata: Metadata = {
  title: "EventHHD · Hệ Thống Quản Lý & Tư Vấn Sự Kiện Thượng Hạng",
  description:
    "Nền tảng công nghệ quản lý, tổ chức sự kiện thượng hạng và báo giá tự động chuẩn hóa hàng đầu tại Việt Nam.",
  keywords: "EventHHD, tổ chức sự kiện, Gala Dinner, hội nghị khách hàng, tiệc cưới luxury, báo giá sự kiện",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#f7f9fb] text-[#191c1e] min-h-screen antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}
