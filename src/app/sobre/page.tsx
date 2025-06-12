
import React from 'react'; 
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Zap, Users, ShieldCheck } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { ChegaAiLogo } from '@/components/icons/ChegaAiLogo';

export const revalidate = 86400; // Revalidate once a day

function OriginalSobrePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 shadow-sm backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center space-x-4 px-4 sm:justify-between sm:space-x-0">
          <Link href="/" aria-label="Página Inicial Chega Aí">
            <ChegaAiLogo className="h-8 text-primary" />
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-1">
              <Button variant="outline" asChild>
                <Link href="/login">Acessar Painel</Link>
              </Button>
              <Button asChild>
                <Link href="/login?action=register">Cadastrar Restaurante</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="mb-8">
            <Button variant="outline" size="icon" asChild className="mb-4">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Voltar para Home</span>
              </Link>
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold font-headline mb-2">Sobre o Chega Aí</h1>
            <p className="text-muted-foreground text-lg">Simplificando a gestão, impulsionando o seu sucesso.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="shadow-lg hover:shadow-primary/20 transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Zap className="text-primary"/>Nossa Missão</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <p>
                  No Chega Aí, nossa missão é revolucionar a maneira como os restaurantes gerenciam suas operações diárias. 
                  Acreditamos que a tecnologia pode ser uma aliada poderosa, simplificando processos complexos e permitindo que 
                  você, proprietário ou gerente, foque no que realmente importa: criar experiências gastronômicas incríveis 
                  para seus clientes.
                </p>
                <p>
                  Buscamos oferecer uma plataforma intuitiva, rápida e eficiente, que descomplica o controle de pedidos,
                  o acompanhamento financeiro e a análise de desempenho, tudo em um só lugar.
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-primary/20 transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="text-primary"/>Para Quem?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <p>
                  O Chega Aí foi pensado para restaurantes, lanchonetes, pizzarias, hamburguerias, food trucks e qualquer
                  estabelecimento do ramo alimentício que busca otimizar sua gestão. 
                </p>
                <p>
                  Seja você um pequeno empreendedor começando agora ou um restaurante estabelecido com alto volume de pedidos,
                  nossa plataforma é flexível para se adaptar às suas necessidades, ajudando a organizar o fluxo de trabalho,
                  reduzir erros e tomar decisões mais inteligentes baseadas em dados.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-lg hover:shadow-primary/20 transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-center mb-4">Por que escolher o <span className="text-primary">Chega Aí</span>?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-muted-foreground">
                <div className="flex flex-col items-center text-center p-4">
                  <ShieldCheck className="h-10 w-10 text-primary mb-3" />
                  <h3 className="font-semibold text-lg mb-1 text-foreground">Controle Total</h3>
                  <p>Desde o recebimento do pedido até a análise de relatórios, tenha tudo sob controle em uma interface amigável.</p>
                </div>
                <div className="flex flex-col items-center text-center p-4">
                  <Zap className="h-10 w-10 text-primary mb-3" />
                  <h3 className="font-semibold text-lg mb-1 text-foreground">Agilidade e Eficiência</h3>
                  <p>Sistema web leve e rápido, com atualizações em tempo real para não perder nenhum detalhe da sua operação.</p>
                </div>
                <div className="flex flex-col items-center text-center p-4">
                  <Users className="h-10 w-10 text-primary mb-3" />
                  <h3 className="font-semibold text-lg mb-1 text-foreground">Foco no Essencial</h3>
                  <p>Sem taxas por pedido e com suporte para múltiplos usuários, permitindo que sua equipe trabalhe em conjunto.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

const SobrePage = React.memo(OriginalSobrePage);
export default SobrePage;
