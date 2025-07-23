'use client';

import React from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarProvider } from '@docujourney/ui';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {

    return (
        <SidebarProvider defaultOpen={true}>
            <AppSidebar />
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
