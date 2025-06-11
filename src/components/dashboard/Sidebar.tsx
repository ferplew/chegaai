
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
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase/config'; // For sign out
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

const mainNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/pedidos', label: 'Pedidos', icon: ClipboardList },
  { href: '/dashboard/cupons', label: 'Cupons', icon: TicketPercent },
  { href: '/dashboard/enderecos', label: 'Endereços', icon: MapPin },
  { href: '/dashboard/cardapio-virtual', label: 'Cardápio Virtual', icon: QrCode },
  { href: '/dashboard/ganhos', label: 'Ganhos', icon: LineChart },
];

const cadastrosNavItems = [
  { href: '/dashboard/produtos', label: 'Itens', icon: Package }, // Produtos page is used for Itens
  { href: '/dashboard/cadastros/categorias', label: 'Categorias', icon: LayoutGrid },
  { href: '/dashboard/cadastros/clientes', label: 'Clientes', icon: Users2 },
  { href: '/dashboard/usuarios', label: 'Funcionários', icon: Briefcase }, // Usuarios page is used for Funcionários
];

const settingsNavItems = [
  { href: '/dashboard/perfil-negocio', label: 'Perfil do Negócio', icon: Store },
  { href: '/dashboard/conta-seguranca', label: 'Conta e Segurança', icon: ShieldCheck },
  { href: '/dashboard/tema', label: 'Tema', icon: Palette },
  { href: '/dashboard/suporte', label: 'Suporte', icon: LifeBuoy },
];


export function DashboardSidebar() {
  const pathname = usePathname();
  const { state, toggleSidebar, isMobile } = useSidebar();
  const router = useRouter();
  const { toast } = useToast();

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

  const renderNavItems = (items: typeof mainNavItems) => {
    return items.map((item) => (
      <SidebarMenuItem key={item.label}>
        <Link href={item.href} passHref legacyBehavior={false}>
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
    ));
  }

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
          {renderNavItems(mainNavItems)}
        </SidebarMenu>

        <SidebarGroup className="p-0 mt-2">
          <SidebarGroupLabel className="px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
            <Archive className="h-5 w-5 group-data-[collapsible=icon]:mr-0 mr-2"/>
             <span className="group-data-[collapsible=icon]:hidden">Cadastros</span>
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
              <span className="group-data-[collapsible=icon]:hidden">Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <p className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden text-center mt-2">
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
