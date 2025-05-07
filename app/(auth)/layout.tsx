"use client";

import React from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from '@/components/ui/separator';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    //   // Get sidebar state from cookies on client-side
    //   const [defaultOpen, setDefaultOpen] = React.useState(true);

    //   React.useEffect(() => {
    //     const match = document.cookie.match(/(?:^|;\s*)sidebar_state=([^;]*)/);
    //     setDefaultOpen(match ? match[1] === "true" : true);
    //   }, []);

    return (
        <SidebarProvider defaultOpen={true}>
            <AppSidebar />
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
