"use client";

import React, { useEffect } from "react";
import { SessionProvider, useSession, signIn } from "next-auth/react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import LoadingSpinner from "@/components/loading-indicator";

const SessionProviderComponent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return; // Add loading check
    if (status === "unauthenticated" || !session) {
      signIn(); // Use signIn() directly
    }
  }, [session, status]);

  if (status === "loading") {
    return <LoadingSpinner/>; 
  }

  if (status === "unauthenticated" || !session) {
    return null;
  }

  return <>{children}</>;
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionProviderComponent>
        <SidebarProvider>
          <AppSidebar />
          <main className="h-screen w-screen">
            <SidebarTrigger className="print:hidden" />
            {children}
          </main>
        </SidebarProvider>
      </SessionProviderComponent>
    </SessionProvider>
  );
}
