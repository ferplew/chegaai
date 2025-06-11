
"use client"; // Necessário para useState e useEffect

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChegaAiLogo } from '@/components/icons/ChegaAiLogo';
import { AnimatedPanelIcon } from '@/components/icons/AnimatedPanelIcon';
import { Footer } from '@/components/layout/Footer';
import {
  Package, BarChart3, History, MonitorSmartphone, Users, Lock, SunMoon,
  Sparkles, Cloud, RefreshCw, BadgePercent, MinusCircle, LayoutGrid, Calculator, TrendingUp, Clock, UserPlus, PlusCircle, LayoutDashboard
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";

const features = [
  { icon: <Package className="w-8 h-8 text-primary" />, title: "Cadastro e controle de pedidos", description: "Gerencie todos os seus pedidos de forma simples e organizada." },
  { icon: <BarChart3 className="w-8 h-8 text-primary" />, title: "Relatórios de vendas e pedidos", description: "Analise suas vendas por período e identifique tendências." },
  { icon: <History className="w-8 h-8 text-primary" />, title: "Histórico completo", description: "Acesse o histórico de todas as movimentações financeiras e de pedidos." },
  { icon: <MonitorSmartphone className="w-8 h-8 text-primary" />, title: "Acesso multidispositivo", description: "Utilize o painel em desktops ou tablets, onde quer que esteja." },
  { icon: <Users className="w-8 h-8 text-primary" />, title: "Controle por usuários", description: "Gerencie permissões de acesso para sua equipe com segurança." },
  { icon: <SunMoon className="w-8 h-8 text-primary" />, title: "Modo claro e escuro", description: "Escolha o tema que melhor se adapta à sua preferência visual." },
];

const differentials = [
  { icon: <Sparkles className="w-6 h-6 text-primary" />, text: "Interface simples e ágil" },
  { icon: <Cloud className="w-6 h-6 text-primary" />, text: "Sistema leve, 100% web" },
  { icon: <RefreshCw className="w-6 h-6 text-primary" />, text: "Atualizações em tempo real" },
  { icon: <BadgePercent className="w-6 h-6 text-primary" />, text: "Sem taxas por pedido" },
  { icon: <Users className="w-6 h-6 text-primary" />, text: "Suporte para múltiplos usuários" },
];

const results = [
  { icon: <MinusCircle className="w-6 h-6 text-primary" />, text: "Redução de erros nos pedidos" },
  { icon: <LayoutGrid className="w-6 h-6 text-primary" />, text: "Maior organização nas operações" },
  { icon: <Calculator className="w-6 h-6 text-primary" />, text: "Agilidade no fechamento de caixa" },
  { icon: <TrendingUp className="w-6 h-6 text-primary" />, text: "Clareza no que mais vende" },
  { icon: <Clock className="w-6 h-6 text-primary" />, text: "Otimização de tempo e pessoal" },
];

const steps = [
  { icon: <UserPlus className="w-10 h-10 text-primary" />, title: "Crie sua conta", description: "Restaurante cria sua conta de forma rápida." },
  { icon: <Package className="w-10 h-10 text-primary" />, title: "Cadastro de Itens", description: "Cadastre seus produtos e monte seu cardápio." },
  { icon: <LayoutDashboard className="w-10 h-10 text-primary" />, title: "Acompanhe no painel", description: "Monitore tudo em tempo real no dashboard." },
  { icon: <BarChart3 className="w-10 h-10 text-primary" />, title: "Analise e cresça", description: "Utilize os relatórios para otimizar e expandir." },
];

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Call on mount to check initial scroll position

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        isScrolled ? "py-3 bg-background/95 shadow-lg backdrop-blur-sm" : "py-6 bg-background/80 backdrop-blur-md"
      )}>
        <div className="container mx-auto px-4 flex justify-start items-center"> {/* Changed to justify-start */}
          <Link href="/" aria-label="Página Inicial Chega Aí">
            <ChegaAiLogo className="h-10 text-primary" />
          </Link>
          {/* Navigation removed from here */}
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="pt-32 pb-16 md:pt-48 md:pb-24 bg-background flex items-center justify-center text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 animate-gradient-bg" style={{ background: 'linear-gradient(-45deg, hsl(var(--primary)), hsl(var(--background)), hsl(var(--accent)), hsl(var(--background)))', backgroundSize: '400% 400%' }}></div>
          <div className="container mx-auto px-4 z-10">
            <h1 className="text-4xl md:text-6xl font-bold font-headline mb-6">
              Chega Aí: seu restaurante no <span className="text-primary">controle</span>, do pedido ao relatório.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              Gerencie vendas, acompanhe pedidos e analise seus resultados em um único painel fácil e rápido.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto" asChild>
                <Link href="/login?action=register">Cadastrar meu restaurante</Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                <Link href="/login">Acessar o painel</Link>
              </Button>
            </div>
            <div className="mt-12 flex justify-center">
              <AnimatedPanelIcon />
            </div>
          </div>
        </section>

        {/* Sobre o Chega Aí */}
        <section id="sobre" className="py-16 md:py-24 bg-background/90">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline mb-6">Tecnologia feita para restaurantes que querem <span className="text-primary">ir além</span>.</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-4">
              Chega Aí é uma plataforma online para restaurantes organizarem e acompanharem seus pedidos.
            </p>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Tudo centralizado: pedidos, valores, status, relatórios. Foco em facilidade, velocidade e eficiência operacional.
            </p>
          </div>
        </section>

        {/* Funcionalidades */}
        <section id="funcionalidades" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-12">O que o <span className="text-primary">Chega Aí</span> oferece?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="bg-card hover:shadow-primary/20 hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="items-center text-center">
                    {feature.icon}
                    <CardTitle className="mt-4 text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Diferenciais */}
        <section id="diferenciais" className="py-16 md:py-24 bg-background/90">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-12"><span className="text-primary">Diferenciais</span> que impulsionam seu negócio</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {differentials.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-4 bg-card rounded-lg shadow-md">
                  {item.icon}
                  <span className="text-md">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Resultados que importam */}
        <section id="resultados" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline mb-12">Resultados visíveis desde o <span className="text-primary">primeiro dia</span>.</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {results.map((result, index) => (
                <Card key={index} className="bg-card p-6 text-left">
                  <div className="flex items-center space-x-3">
                    {result.icon}
                    <h3 className="text-lg font-semibold">{result.text}</h3>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Etapas de Uso */}
        <section id="etapas" className="py-16 md:py-24 bg-background/90">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-16">Comece a usar em <span className="text-primary">4 passos</span> simples</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 relative">
              {/* Connecting line (pseudo-element or SVG needed for better visual) */}
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 mt-[-20px]"/>
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center text-center z-10">
                  <div className="bg-card p-4 rounded-full mb-4 border-2 border-primary shadow-lg">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                  {index < steps.length -1 && <div className="lg:hidden w-0.5 h-12 bg-border my-4"/>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Depoimento */}
        <section id="depoimento" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <div className="bg-card p-8 md:p-12 rounded-xl shadow-xl">
              <svg className="w-16 h-16 rounded-full mx-auto mb-6 text-primary bg-primary/10 p-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <p className="text-xl md:text-2xl italic text-foreground mb-6">
                “Organizamos toda nossa operação em poucos dias. Hoje tudo é mais rápido e os erros caíram pela metade.”
              </p>
              <p className="font-semibold text-primary">— Restaurante Sabor da Vila</p>
            </div>
          </div>
        </section>

        {/* Call-to-Action Final */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-background to-card text-center relative overflow-hidden">
           <div className="absolute inset-0 opacity-10 animate-gradient-bg" style={{ background: 'linear-gradient(-45deg, hsl(var(--primary)), hsl(var(--background)), hsl(var(--accent)), hsl(var(--background)))', backgroundSize: '400% 400%' }}></div>
          <div className="container mx-auto px-4 z-10">
            <h2 className="text-3xl md:text-5xl font-bold font-headline mb-4">Gerencie melhor. Cresça mais. <span className="text-primary">Chega Aí.</span></h2>
            <p className="text-lg text-muted-foreground mb-10">Experimente agora sem custo e transforme a gestão do seu restaurante.</p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto" asChild>
                <Link href="/login?action=register">Cadastrar meu restaurante</Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                <Link href="/login">Acessar o painel</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
