import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Elphy",
    description: "Smart Study Assistant - Remember Everything 🐘",
    icons: {
        icon: "/dmgstories_Minimalist_app_icon_for_an_educational_app_called__1f34b5e9-68b8-4e44-914a-f25cbdfaa98d_2.png",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>{children}</body>
        </html>
    );
}
