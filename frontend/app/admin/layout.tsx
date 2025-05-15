"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Navbar from "@/app/components/Navbar";
import { SidebarProvider, useSidebar } from "@/app/context/SidebarContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) return null;

  return (
    <SidebarProvider>
      <InnerAdminLayout>{children}</InnerAdminLayout>
    </SidebarProvider>
  );
}

function InnerAdminLayout({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const toggleProfile = () => setIsProfileOpen((prev) => !prev);

  return (
    <div className="min-h-screen">
      <Navbar
        isAuthenticated={true}
        isSidebarOpen={isSidebarOpen}
        isProfileOpen={isProfileOpen}
        toggleSidebar={toggleSidebar}
        toggleProfile={toggleProfile}
      />
      <main
        className="flex-1 p-6 max-w-screen overflow-hidden bg-no-repeat bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `url('/bg-mylesson.png')`,
          minHeight: "100vh",
        }}
      >
        {children}
      </main>
    </div>
  );
}
