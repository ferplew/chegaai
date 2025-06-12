
"use client";

import React, { useState, type FormEvent } from 'react'; // Adicionado React
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { LifeBuoy, Send, HelpCircle, MessageSquare, Loader2 } from "lucide-react";

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
  const { toast } = useToast();
  const [ticketAssunto, setTicketAssunto] = useState('');
  const [ticketDescricao, setTicketDescricao] = useState('');
  const [isSendingTicket, setIsSendingTicket] = useState(false);

  const handleTicketSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSendingTicket(true);

    if (!ticketAssunto.trim() || !ticketDescricao.trim()) {
      toast({ title: "Campos obrigatórios", description: "Assunto e Descrição são necessários para abrir um ticket.", variant: "destructive" });
      setIsSendingTicket(false);
      return;
    }

    // Simulação de envio de ticket
    // TODO: Implementar lógica de salvamento no Firestore ou envio para sistema de help desk
    
    // Aguardar um pouco para simular processamento
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Ticket Enviado!",
      description: "Sua solicitação foi registrada. Entraremos em contato em breve.",
    });

    setTicketAssunto('');
    setTicketDescricao('');
    setIsSendingTicket(false);
  };

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

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary"/> Abrir Ticket de Suporte</CardTitle>
            <CardDescription>Não encontrou sua resposta? Envie-nos uma mensagem.</CardDescription>
          </CardHeader>
          <form onSubmit={handleTicketSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="ticketAssunto">Assunto <span className="text-destructive">*</span></Label>
                <Input
                  id="ticketAssunto"
                  value={ticketAssunto}
                  onChange={(e) => setTicketAssunto(e.target.value)}
                  placeholder="Ex: Dúvida sobre relatórios"
                  required
                  disabled={isSendingTicket}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ticketDescricao">Descrição Detalhada <span className="text-destructive">*</span></Label>
                <Textarea
                  id="ticketDescricao"
                  value={ticketDescricao}
                  onChange={(e) => setTicketDescricao(e.target.value)}
                  placeholder="Descreva seu problema ou dúvida com o máximo de detalhes possível..."
                  rows={5}
                  required
                  disabled={isSendingTicket}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSendingTicket}>
                {isSendingTicket ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Ticket
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

const SuportePage = React.memo(OriginalSuportePage);
export default SuportePage;
