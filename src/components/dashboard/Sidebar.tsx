
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Archive,
  Package,
  LayoutGrid,
  Users2,
  Briefcase,
  ClipboardList,
  TicketPercent,
  MapPin,
  QrCode,
  LineChart,
  LifeBuoy,
  Store,
  ShieldCheck,
  Palette,
  LogOut,
  PanelLeft
} from 'lucide-react';
import {
  Sidebar as ShadSidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase/config'; // For sign out
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { ChegaAiLogo } from '@/components/icons/ChegaAiLogo';


const mainNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/pedidos', label: 'Pedidos', icon: ClipboardList },
  { href: '/dashboard/cupons', label: 'Cupons', icon: TicketPercent },
  { href: '/dashboard/enderecos', label: 'Endereços', icon: MapPin },
  { href: '/dashboard/cardapio-virtual', label: 'Cardápio Virtual', icon: QrCode },
  { href: '/dashboard/ganhos', label: 'Ganhos', icon: LineChart },
];

const cadastrosNavItems = [
  { href: '/dashboard/produtos', label: 'Itens', icon: Package }, 
  { href: '/dashboard/cadastros/categorias', label: 'Categorias', icon: LayoutGrid },
  { href: '/dashboard/cadastros/clientes', label: 'Clientes', icon: Users2 },
  { href: '/dashboard/usuarios', label: 'Funcionários', icon: Briefcase }, 
];

const settingsNavItems = [
  { href: '/dashboard/perfil-negocio', label: 'Perfil do Negócio', icon: Store },
  { href: '/dashboard/conta-seguranca', label: 'Conta e Segurança', icon: ShieldCheck },
  { href: '/dashboard/tema', label: 'Tema', icon: Palette },
  { href: '/dashboard/suporte', label: 'Suporte', icon: LifeBuoy },
];


export function DashboardSidebar() {
  const pathname = usePathname();
  const sidebarContextValue = useSidebar(); 
  const router = useRouter();
  const { toast } = useToast();

  // Access properties defensively to avoid destructuring errors
  const state = sidebarContextValue?.state ?? "collapsed";
  const toggleSidebar = sidebarContextValue?.toggleSidebar ?? (() => {});
  const isMobile = sidebarContextValue?.isMobile ?? false; // Default to false, useIsMobile hook in provider will determine actual
  const setOpenMobile = sidebarContextValue?.setOpenMobile ?? (() => {});


  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({ title: "Você saiu!", description: "Redirecionando para a página de login." });
      router.push('/login');
    } catch (error) {
      console.error("Erro ao sair:", error);
      toast({ title: "Erro ao sair", description: "Não foi possível deslogar. Tente novamente.", variant: "destructive" });
    }
  };

  const handleNavItemClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const renderNavItems = (items: typeof mainNavItems | typeof cadastrosNavItems | typeof settingsNavItems) => {
    return items.map((item) => (
      <SidebarMenuItem key={item.label}>
        <SidebarMenuButton
          asChild 
          isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
          tooltip={{ children: item.label, side: 'right', hidden: state === 'expanded' || isMobile }}
          className="justify-start"
          aria-label={item.label}
          onClick={handleNavItemClick} 
        >
          <Link href={item.href}>
            <item.icon className="h-5 w-5" />
            <span className="group-data-[state=collapsed]:hidden">{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));
  }

  const sidebarContent = (
    <>
      <SidebarHeader className="p-2">
        <div className="flex items-center justify-between"> 
          <Link href="/dashboard" className="ml-2 group-data-[state=collapsed]:hidden flex items-center gap-2">
             <ChegaAiLogo className="h-8 text-primary" />
          </Link>
          {!isMobile && ( 
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7" 
              onClick={toggleSidebar}
              aria-label="Alternar menu"
            >
              <PanelLeft className="h-5 w-5"/>
            </Button>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {renderNavItems(mainNavItems)}
        </SidebarMenu>

        <SidebarGroup className="p-0 mt-2">
          <SidebarGroupLabel className="px-2 group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:justify-center">
            <Archive className="h-5 w-5 group-data-[state=collapsed]:mr-0 mr-2"/>
             <span className="group-data-[state=collapsed]:hidden">Cadastros</span>
          </SidebarGroupLabel>
          <SidebarMenu>
            {renderNavItems(cadastrosNavItems)}
          </SidebarMenu>
        </SidebarGroup>
        
        <SidebarSeparator className="my-4"/>

        <SidebarMenu>
          {renderNavItems(settingsNavItems)}
        </SidebarMenu>

      </SidebarContent>
      <SidebarFooter className="p-2 mt-auto border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} className="justify-start w-full" 
              tooltip={{ children: "Sair", side: 'right', hidden: state === 'expanded' || isMobile }}>
              <LogOut className="h-5 w-5" />
              <span className="group-data-[state=collapsed]:hidden">Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <p className="text-xs text-muted-foreground group-data-[state=collapsed]:hidden text-center mt-2">
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
