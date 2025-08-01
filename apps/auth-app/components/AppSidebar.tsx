'use client';

import { Home, FileText, LayoutDashboard, Users, Upload, BarChart3 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { EnvironmentBadge } from '@/components/ui/environment-badge';

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
} from '@docujourney/ui';
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
        <div className="flex flex-col gap-2 h-20 justify-center px-6">
          <div className="flex items-center">
            <span className="text-teal-500 text-2xl mr-2">&#10048;</span>
            <span className="font-bold text-xl">DocuJourney</span>
          </div>
          <EnvironmentBadge className="ml-8" />
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
