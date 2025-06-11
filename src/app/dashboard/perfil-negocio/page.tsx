
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Building, MapPinIcon, ClockIcon, DollarSignIcon, Lock, Eye, EyeOff, AlertCircle, Loader2, Save, Info } from "lucide-react";
import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const ADMIN_PASSWORD = "12345678"; // Senha de administrador temporária

interface HorarioDia {
  aberto: boolean;
  inicio: string;
  fim: string;
}

interface HorariosFuncionamento {
  seg: HorarioDia;
  ter: HorarioDia;
  qua: HorarioDia;
  qui: HorarioDia;
  sex: HorarioDia;
  sab: HorarioDia;
  dom: HorarioDia;
}

interface Endereco {
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

interface PerfilNegocioData {
  nomeRestaurante: string;
  sloganDescricao: string;
  telefonePrincipal: string;
  whatsapp: string;
  instagram: string;
  website: string;
  endereco: Endereco;
  horarios: HorariosFuncionamento;
  taxaEntrega: number | '';
  tempoMedioEntrega: number | ''; // em minutos
}

const initialHorarioDia: HorarioDia = { aberto: false, inicio: '09:00', fim: '18:00' };
const initialHorarios: HorariosFuncionamento = {
  seg: { ...initialHorarioDia },
  ter: { ...initialHorarioDia },
  qua: { ...initialHorarioDia },
  qui: { ...initialHorarioDia },
  sex: { ...initialHorarioDia },
  sab: { ...initialHorarioDia, aberto: true, inicio: '10:00', fim: '22:00' },
  dom: { ...initialHorarioDia, aberto: true, inicio: '10:00', fim: '20:00' },
};

const initialEndereco: Endereco = { rua: '', numero: '', bairro: '', cidade: '', estado: '', cep: '' };

export default function PerfilNegocioPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<PerfilNegocioData>({
    nomeRestaurante: '',
    sloganDescricao: '',
    telefonePrincipal: '',
    whatsapp: '',
    instagram: '',
    website: '',
    endereco: initialEndereco,
    horarios: initialHorarios,
    taxaEntrega: '',
    tempoMedioEntrega: '',
  });

  const [isSensitiveDataUnlocked, setIsSensitiveDataUnlocked] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const perfilDocRef = doc(db, 'configuracoes', 'perfilRestaurante');

  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      try {
        const docSnap = await getDoc(perfilDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<PerfilNegocioData>;
          setFormData(prev => ({
            ...prev,
            ...data,
            endereco: { ...initialEndereco, ...data.endereco },
            horarios: { ...initialHorarios, ...data.horarios },
            taxaEntrega: data.taxaEntrega !== undefined ? data.taxaEntrega : '',
            tempoMedioEntrega: data.tempoMedioEntrega !== undefined ? data.tempoMedioEntrega : '',
          }));
        } else {
          console.log("Nenhum perfil de negócio encontrado, usando valores iniciais.");
        }
      } catch (error) {
        console.error("Erro ao buscar perfil do negócio:", error);
        toast({ title: "Erro ao carregar dados", description: "Não foi possível buscar os dados do perfil.", variant: "destructive" });
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, [toast]);

  const handleAdminPasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (adminPasswordInput === ADMIN_PASSWORD) {
      setIsSensitiveDataUnlocked(true);
      setAuthError(null);
      toast({ title: "Acesso liberado", description: "Você pode editar as informações do restaurante." });
    } else {
      setAuthError("Senha de administrador incorreta.");
      setIsSensitiveDataUnlocked(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, section?: keyof PerfilNegocioData) => {
    const { name, value } = e.target;
    if (section === 'endereco') {
      setFormData(prev => ({ ...prev, endereco: { ...prev.endereco, [name]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'taxaEntrega' | 'tempoMedioEntrega') => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value === '' ? '' : parseFloat(value) }));
  };

  const handleHorarioChange = (dia: keyof HorariosFuncionamento, campo: keyof HorarioDia, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      horarios: {
        ...prev.horarios,
        [dia]: {
          ...prev.horarios[dia],
          [campo]: value,
        },
      },
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await setDoc(perfilDocRef, {
        ...formData,
        taxaEntrega: formData.taxaEntrega === '' ? null : Number(formData.taxaEntrega),
        tempoMedioEntrega: formData.tempoMedioEntrega === '' ? null : Number(formData.tempoMedioEntrega),
        dataModificacao: serverTimestamp()
      }, { merge: true });
      toast({ title: "Perfil Salvo!", description: "As informações do seu negócio foram atualizadas." });
    } catch (error) {
      console.error("Erro ao salvar perfil do negócio:", error);
      toast({ title: "Erro ao Salvar", description: "Não foi possível salvar as informações.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const diasDaSemana: { key: keyof HorariosFuncionamento, label: string }[] = [
    { key: 'seg', label: 'Segunda-feira' }, { key: 'ter', label: 'Terça-feira' },
    { key: 'qua', label: 'Quarta-feira' }, { key: 'qui', label: 'Quinta-feira' },
    { key: 'sex', label: 'Sexta-feira' }, { key: 'sab', label: 'Sábado' },
    { key: 'dom', label: 'Domingo' },
  ];

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Carregando perfil do negócio...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Perfil do Negócio</h1>
        <p className="text-muted-foreground">Gerencie as informações públicas e operacionais do seu restaurante.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building className="h-5 w-5 text-primary"/> Informações do Restaurante</CardTitle>
          <CardDescription>
            Dados principais do seu estabelecimento. {isSensitiveDataUnlocked ? "Você pode editar abaixo." : "Requer senha de administrador para editar."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isSensitiveDataUnlocked ? (
            <form onSubmit={handleAdminPasswordSubmit} className="space-y-4 p-4 border rounded-md bg-muted/50">
              <Label htmlFor="adminPasswordUnlock" className="font-semibold">Desbloquear Edição</Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-grow">
                   <Input
                    id="adminPasswordUnlock"
                    type={showPassword ? "text" : "password"}
                    value={adminPasswordInput}
                    onChange={(e) => { setAdminPasswordInput(e.target.value); setAuthError(null); }}
                    placeholder="Senha de Administrador"
                    className={authError ? "border-destructive" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button type="submit" variant="secondary">
                    <Lock className="mr-2 h-4 w-4"/> Desbloquear
                </Button>
              </div>
              {authError && <p className="text-sm text-destructive flex items-center gap-1"><AlertCircle className="h-4 w-4"/> {authError}</p>}
            </form>
          ) : (
            <>
              <div className="space-y-1">
                <Label htmlFor="nomeRestaurante">Nome do Restaurante</Label>
                <Input id="nomeRestaurante" name="nomeRestaurante" value={formData.nomeRestaurante} onChange={handleChange} placeholder="Nome fantasia" disabled={!isSensitiveDataUnlocked || isLoading}/>
              </div>
              <div className="space-y-1">
                <Label htmlFor="sloganDescricao">Slogan ou Descrição Curta</Label>
                <Textarea id="sloganDescricao" name="sloganDescricao" value={formData.sloganDescricao} onChange={handleChange} placeholder="Ex: O melhor sabor da cidade!" rows={2} disabled={!isSensitiveDataUnlocked || isLoading}/>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="telefonePrincipal">Telefone Principal</Label>
                  <Input id="telefonePrincipal" name="telefonePrincipal" type="tel" value={formData.telefonePrincipal} onChange={handleChange} placeholder="(00) 0000-0000" disabled={!isSensitiveDataUnlocked || isLoading}/>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input id="whatsapp" name="whatsapp" type="tel" value={formData.whatsapp} onChange={handleChange} placeholder="(00) 90000-0000" disabled={!isSensitiveDataUnlocked || isLoading}/>
                </div>
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="instagram">Instagram (opcional)</Label>
                  <Input id="instagram" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="@seu_restaurante" disabled={!isSensitiveDataUnlocked || isLoading}/>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="website">Website (opcional)</Label>
                  <Input id="website" name="website" type="url" value={formData.website} onChange={handleChange} placeholder="https://seurestaurante.com.br" disabled={!isSensitiveDataUnlocked || isLoading}/>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MapPinIcon className="h-5 w-5 text-primary"/> Endereço</CardTitle>
          <CardDescription>Localização física do seu estabelecimento.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1">
              <Label htmlFor="rua">Rua / Avenida</Label>
              <Input id="rua" name="rua" value={formData.endereco.rua} onChange={(e) => handleChange(e, 'endereco')} placeholder="Nome da rua" disabled={isLoading}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="numero">Número</Label>
              <Input id="numero" name="numero" value={formData.endereco.numero} onChange={(e) => handleChange(e, 'endereco')} placeholder="Ex: 123, S/N" disabled={isLoading}/>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="bairro">Bairro</Label>
              <Input id="bairro" name="bairro" value={formData.endereco.bairro} onChange={(e) => handleChange(e, 'endereco')} placeholder="Nome do bairro" disabled={isLoading}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="cidade">Cidade</Label>
              <Input id="cidade" name="cidade" value={formData.endereco.cidade} onChange={(e) => handleChange(e, 'endereco')} placeholder="Nome da cidade" disabled={isLoading}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="estado">Estado (UF)</Label>
              <Input id="estado" name="estado" value={formData.endereco.estado} onChange={(e) => handleChange(e, 'endereco')} placeholder="Ex: SP, RJ" maxLength={2} disabled={isLoading}/>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="cep">CEP</Label>
            <Input id="cep" name="cep" value={formData.endereco.cep} onChange={(e) => handleChange(e, 'endereco')} placeholder="00000-000" disabled={isLoading}/>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ClockIcon className="h-5 w-5 text-primary"/> Horários de Funcionamento</CardTitle>
          <CardDescription>Defina os horários que seu restaurante está aberto.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {diasDaSemana.map(dia => (
            <div key={dia.key} className="p-3 border rounded-md space-y-3 bg-muted/30">
              <div className="flex items-center justify-between">
                <Label htmlFor={`${dia.key}-aberto`} className="font-semibold">{dia.label}</Label>
                <Switch
                  id={`${dia.key}-aberto`}
                  checked={formData.horarios[dia.key].aberto}
                  onCheckedChange={(checked) => handleHorarioChange(dia.key, 'aberto', checked)}
                  disabled={isLoading}
                />
              </div>
              {formData.horarios[dia.key].aberto && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor={`${dia.key}-inicio`} className="text-xs">Abre às</Label>
                    <Input
                      id={`${dia.key}-inicio`}
                      type="time"
                      value={formData.horarios[dia.key].inicio}
                      onChange={(e) => handleHorarioChange(dia.key, 'inicio', e.target.value)}
                      disabled={isLoading || !formData.horarios[dia.key].aberto}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`${dia.key}-fim`} className="text-xs">Fecha às</Label>
                    <Input
                      id={`${dia.key}-fim`}
                      type="time"
                      value={formData.horarios[dia.key].fim}
                      onChange={(e) => handleHorarioChange(dia.key, 'fim', e.target.value)}
                      disabled={isLoading || !formData.horarios[dia.key].aberto}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><DollarSignIcon className="h-5 w-5 text-primary"/> Configurações de Entrega</CardTitle>
          <CardDescription>Taxa e tempo estimado para delivery.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="taxaEntrega">Taxa de Entrega (R$)</Label>
            <div className="relative">
                <DollarSignIcon className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    id="taxaEntrega"
                    name="taxaEntrega"
                    type="number"
                    value={formData.taxaEntrega}
                    onChange={(e) => handleNumericChange(e, 'taxaEntrega')}
                    placeholder="Ex: 5.00"
                    min="0"
                    step="0.01"
                    className="pl-8"
                    disabled={isLoading}
                />
            </div>
             <p className="text-xs text-muted-foreground flex items-center gap-1"><Info className="h-3 w-3"/>Deixe 0 ou em branco para taxa grátis.</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="tempoMedioEntrega">Tempo Médio de Entrega (minutos)</Label>
            <Input
              id="tempoMedioEntrega"
              name="tempoMedioEntrega"
              type="number"
              value={formData.tempoMedioEntrega}
              onChange={(e) => handleNumericChange(e, 'tempoMedioEntrega')}
              placeholder="Ex: 30-45"
              min="0"
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <CardFooter className="border-t mt-8 pt-6">
        <div className="flex justify-end w-full">
          <Button type="submit" disabled={isLoading || isFetching}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Alterações
          </Button>
        </div>
      </CardFooter>
    </form>
  );
}

    