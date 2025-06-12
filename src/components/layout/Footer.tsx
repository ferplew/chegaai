
import Link from 'next/link';
import { ChegaAiLogo } from '@/components/icons/ChegaAiLogo';

export function Footer() {
  return (
    <footer className="bg-background border-t border-border/20 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="flex justify-center md:justify-start">
            <ChegaAiLogo className="h-8 text-primary" />
          </div>
          
          <nav className="flex justify-center space-x-6 text-muted-foreground">
            <Link href="/sobre" className="hover:text-primary transition-colors">Sobre</Link>
            <Link href="/suporte" className="hover:text-primary transition-colors">Suporte</Link>
            <Link href="/termos" className="hover:text-primary transition-colors">Termos</Link>
          </nav>

          <div className="text-center md:text-right text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Chega Aí Delivery</p>
            <p>Tecnologia feita para restaurantes.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
