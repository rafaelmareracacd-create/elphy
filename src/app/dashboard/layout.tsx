"use client"

import Sidebar from "@/components/dashboard/Sidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-full relative bg-[#F8F9FA]">
            {/* Top Navbar - Fixed */}
            <TopNavbar />

            {/* Sidebar - Light theme */}
            <div className="hidden h-full md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40 pt-16">
                <Sidebar />
            </div>

            {/* Main Content */}
            <main className="md:pl-64 pt-16">
                {children}
            </main>
        </div>
    );
}
