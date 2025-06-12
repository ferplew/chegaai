
'use client';

import React from 'react'; // Adicionado React
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, HelpCircle, Mail, BookOpen } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { ChegaAiLogo } from '@/components/icons/ChegaAiLogo';

const faqItems = [
  {
    id: "faq-1",
    question: "Como cadastro um novo item no cardápio?",
    answer: "Vá para a seção 'Cadastros' > 'Itens' e clique em 'Adicionar Item'. Preencha os detalhes como nome, descrição, valor e categoria. Você também pode usar a IA para ajudar com o nome e descrição, e gerar uma imagem.",
  },
  {
    id: "faq-2",
    question: "Onde configuro meus horários de funcionamento?",
    answer: "Acesse 'Configurações' > 'Perfil do Negócio'. Lá você encontrará a seção 'Horários de Funcionamento' para definir os dias e horários de abertura e fechamento.",
  },
  {
    id: "faq-3",
    question: "Como vejo os relatórios de vendas?",
    answer: "A seção 'Ganhos' permite visualizar seus lucros e total recebido por período. Para relatórios mais detalhados sobre vendas e itens mais vendidos, acesse 'Relatórios' (funcionalidade em desenvolvimento).",
  },
  {
    id: "faq-4",
    question: "É possível usar o sistema em mais de um dispositivo?",
    answer: "Sim! O Chega Aí é uma plataforma web, acessível de qualquer dispositivo com navegador e internet, como computadores, tablets. Basta fazer login com sua conta.",
  },
];

function OriginalSuportePage() {
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
            <h1 className="text-3xl md:text-4xl font-bold font-headline mb-2">Central de Suporte Chega Aí</h1>
            <p className="text-muted-foreground text-lg">Estamos aqui para ajudar você a ter a melhor experiência.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-lg hover:shadow-primary/20 transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><HelpCircle className="text-primary"/>Perguntas Frequentes (FAQ)</CardTitle>
                <CardDescription>Encontre respostas rápidas para as dúvidas mais comuns.</CardDescription>
              </CardHeader>
              <CardContent>
                {faqItems.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {faqItems.map((item) => (
                      <AccordionItem value={item.id} key={item.id}>
                        <AccordionTrigger className="text-left hover:no-underline">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-muted-foreground">Nenhuma pergunta frequente disponível no momento.</p>
                )}
              </CardContent>
            </Card>

            <div className="space-y-8">
              <Card className="shadow-lg hover:shadow-primary/20 transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Mail className="text-primary"/>Entre em Contato</CardTitle>
                  <CardDescription>Não encontrou o que precisava? Fale conosco.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p>
                    Se você tiver dúvidas específicas, problemas técnicos ou sugestões, nossa equipe de suporte está pronta para ajudar.
                  </p>
                  <p>
                    Envie um e-mail para: <strong className="text-primary">suporte@chegaai.delivery</strong>
                  </p>
                  <p>
                    Procuramos responder a todas as solicitações o mais rápido possível.
                  </p>
                  <Button className="w-full mt-2" asChild>
                    <a href="mailto:suporte@chegaai.delivery">Enviar E-mail</a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-primary/20 transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BookOpen className="text-primary"/>Recursos e Tutoriais</CardTitle>
                  <CardDescription>Aprenda mais sobre como usar a plataforma.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p>
                    Estamos preparando uma seção com tutoriais em vídeo e guias detalhados para você aproveitar ao máximo todas as
                    funcionalidades do Chega Aí.
                  </p>
                  <p className="font-semibold">Em breve!</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

const SuportePage = React.memo(OriginalSuportePage);
export default SuportePage;
