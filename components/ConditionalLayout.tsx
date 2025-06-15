"use client";

import { usePathname } from "next/navigation";
import { Header, Footer } from "@/components";

interface ConditionalLayoutProps {
    children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith("/auth");
    const isDashboardPage = pathname?.startsWith("/dashboard");

    if (isAuthPage) {
        return <>{children}</>;
    }

    if (isDashboardPage) {
        return <>{children}</>
    }

    return (
        <>
            <Header />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </>
    );
}
