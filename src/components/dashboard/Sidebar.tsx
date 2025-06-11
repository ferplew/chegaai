"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ClipboardList,
  Package,
  BarChart3,
  Users,
  Settings,
  Home,
  PanelLeft
} from 'lucide-react';
import { ChegaAiLogo } from '@/components/icons/ChegaAiLogo';
import {
  Sidebar as ShadSidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar'; // Using the enhanced sidebar
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/pedidos', label: 'Pedidos', icon: ClipboardList },
  { href: '/dashboard/produtos', label: 'Produtos', icon: Package },
  { href: '/dashboard/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/dashboard/usuarios', label: 'Usuários', icon: Users },
  { href: '/dashboard/configuracoes', label: 'Configurações', icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { state, toggleSidebar, isMobile } = useSidebar();

  const sidebarContent = (
    <>
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard">
            <ChegaAiLogo className="h-8 text-primary data-[collapsed=true]:hidden" />
          </Link>
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="data-[collapsed=false]:hidden"
              onClick={toggleSidebar}
              aria-label="Expandir menu"
            >
              <PanelLeft />
            </Button>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                  tooltip={{ children: item.label, side: 'right', hidden: state === 'expanded' || isMobile }}
                  className="justify-start"
                  aria-label={item.label}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 mt-auto border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          &copy; {new Date().getFullYear()} Chega Aí
        </p>
      </SidebarFooter>
    </>
  );

  return (
    <ShadSidebar side="left" variant="sidebar" collapsible={isMobile ? "offcanvas" : "icon"}>
      {sidebarContent}
    </ShadSidebar>
  );
}
