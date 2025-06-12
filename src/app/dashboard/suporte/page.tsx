
import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LifeBuoy, HelpCircle, Loader2 } from "lucide-react";

const SuporteTicketForm = dynamic(() => import('@/components/dashboard/forms/SuporteTicketForm'), {
  ssr: false,
  loading: () => (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Loader2 className="h-5 w-5 text-primary animate-spin"/> Carregando Formulário...</CardTitle>
        <CardDescription>Aguarde um momento.</CardHeader>
      </CardHeader>
      <CardContent className="h-48 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </CardContent>
    </Card>
  ),
});

export const revalidate = 86400; // Revalidate once a day for FAQ content

const faqItems = [
  {
    id: "faq-1",
    question: "Como altero a senha de administrador?",
    answer: "Vá para 'Configurações' > 'Conta e Segurança'. Na seção 'Alterar Senha de Administrador', insira sua senha atual e a nova senha desejada. Clique em 'Alterar Senha'.",
  },
  {
    id: "faq-2",
    question: "Posso cadastrar um item sem imagem?",
    answer: "Sim, a imagem do item é opcional. Você pode cadastrar um item fornecendo apenas nome, valor e categoria. A imagem pode ser adicionada ou gerada por IA depois.",
  },
  {
    id: "faq-3",
    question: "Como gero um QR Code para o cardápio virtual?",
    answer: "Acesse a seção 'Cardápio Virtual'. O link público será exibido. Clique em 'Gerar QR Code' para visualizar e depois em 'Baixar QR Code' para salvar a imagem.",
  },
  {
    id: "faq-4",
    question: "Onde configuro os horários de funcionamento?",
    answer: "Em 'Configurações' > 'Perfil do Negócio', você encontrará a seção 'Horários de Funcionamento', onde pode definir os dias e horários que seu estabelecimento está aberto.",
  },
  {
    id: "faq-5",
    question: "Como cadastro um novo funcionário sem acesso de login?",
    answer: "Vá em 'Cadastros' > 'Funcionários' e clique em 'Novo Funcionário'. Preencha o nome, a função e defina o status. Este cadastro é para controle interno e não cria um login.",
  },
];

function OriginalSuportePage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <LifeBuoy className="h-8 w-8 text-primary" />
        <div>
            <h1 className="text-3xl font-bold font-headline">Suporte e Ajuda</h1>
            <p className="text-muted-foreground">Encontre respostas ou entre em contato conosco.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><HelpCircle className="h-5 w-5 text-primary"/> Perguntas Frequentes (FAQ)</CardTitle>
            <CardDescription>Respostas rápidas para as dúvidas mais comuns.</CardDescription>
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

        <Suspense fallback={
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Loader2 className="h-5 w-5 text-primary animate-spin"/> Carregando Formulário...</CardTitle>
                    <CardDescription>Aguarde um momento.</CardHeader>
                </CardHeader>
                <CardContent className="h-48 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        }>
          <SuporteTicketForm />
        </Suspense>
      </div>
    </div>
  );
}

const SuportePage = React.memo(OriginalSuportePage);
export default SuportePage;
