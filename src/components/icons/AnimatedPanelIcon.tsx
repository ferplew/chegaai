import type { SVGProps } from 'react';
import { BarChart3, LayoutDashboard, TrendingUp } from 'lucide-react';

export function AnimatedPanelIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="relative w-full max-w-lg h-64 md:h-80 rounded-lg border border-primary/30 bg-background/50 p-6 shadow-xl overflow-hidden backdrop-blur-sm">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <LayoutDashboard className="w-16 h-16 text-primary mb-4 animate-pulse" />
        <h3 className="text-2xl font-headline text-foreground mb-2">Painel de Gestão</h3>
        <p className="text-sm text-muted-foreground text-center">Pedidos, Vendas, Performance</p>
        <div className="flex space-x-4 mt-6">
          <BarChart3 className="w-8 h-8 text-primary/70" />
          <TrendingUp className="w-8 h-8 text-primary/70" />
        </div>
      </div>
      
      {/* Subtle animated background elements */}
      <div className="absolute top-5 left-5 w-4 h-4 bg-primary/50 rounded-full animate-ping opacity-50"></div>
      <div className="absolute bottom-10 right-10 w-6 h-6 bg-primary/30 rounded-full animate-subtle-pulse opacity-70"></div>
      <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-primary/40 rounded-sm animate-subtle-pulse animation-delay-500 opacity-60"></div>
    </div>
  );
}
