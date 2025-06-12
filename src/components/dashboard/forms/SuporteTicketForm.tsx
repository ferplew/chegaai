
"use client";

import React, { useState, type FormEvent, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, MessageSquare } from "lucide-react";

function OriginalSuporteTicketForm() {
  const { toast } = useToast();
  const [ticketAssunto, setTicketAssunto] = useState('');
  const [ticketDescricao, setTicketDescricao] = useState('');
  const [isSendingTicket, setIsSendingTicket] = useState(false);

  const handleTicketSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSendingTicket(true);

    if (!ticketAssunto.trim() || !ticketDescricao.trim()) {
      toast({ title: "Campos obrigatórios", description: "Assunto e Descrição são necessários para abrir um ticket.", variant: "destructive" });
      setIsSendingTicket(false);
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Ticket Enviado!",
      description: "Sua solicitação foi registrada. Entraremos em contato em breve.",
    });

    setTicketAssunto('');
    setTicketDescricao('');
    setIsSendingTicket(false);
  }, [ticketAssunto, ticketDescricao, toast]);

  return (
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
  );
}

const SuporteTicketForm = React.memo(OriginalSuporteTicketForm);
export default SuporteTicketForm;
