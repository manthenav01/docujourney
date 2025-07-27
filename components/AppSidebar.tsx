'use client';

import { Home, FileText, LayoutDashboard, Users, Upload, BarChart3 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { UserDropdown } from '@/components/UserDropdown';

// Menu items
const items = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Upload Document',
    url: '/upload',
    icon: Upload,
  },
  {
    title: 'Documents',
    url: '/documents',
    icon: FileText,
  },
  {
    title: 'Profiles',
    url: '/profiles',
    icon: Users,
  },
  {
    title: 'Visa Analytics',
    url: '/visa-dashboard',
    icon: BarChart3,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex h-16 items-center px-6">
          <div className="p-2 bg-primary/10 rounded-lg mr-3">
            <span className="text-primary text-xl">&#10048;</span>
          </div>
          <span className="font-bold text-xl text-foreground tracking-tight">DocuJourney</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserDropdown />
      </SidebarFooter>
    </Sidebar>
  );
}
