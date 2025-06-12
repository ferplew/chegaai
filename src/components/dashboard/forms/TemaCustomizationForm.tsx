
"use client";

import React, { useState, useEffect, type ChangeEvent, useCallback } from 'react'; 
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sun, Moon, Laptop, ImagePlus, PaletteIcon, Loader2, Save, Trash2, Info } from "lucide-react"; // Removed UploadCloud
import { useToast } from "@/hooks/use-toast";
import { db, storage } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, serverTimestamp, type FirestoreError } from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject, type StorageError } from 'firebase/storage';
import Image from 'next/image';

interface TemaCustomData {
  logotipoUrl?: string | null;
  bannerUrl?: string | null;
  corPrincipalHSL?: string | null;
}

const defaultPrimaryHSL = "129 100% 54.1%"; 

function OriginalTemaCustomizationForm() {
  const { theme, setTheme } = useTheme(); 
  const { toast } = useToast();

  const [customData, setCustomData] = useState<TemaCustomData>({
    logotipoUrl: null,
    bannerUrl: null,
    corPrincipalHSL: defaultPrimaryHSL,
  });

  const [logotipoFile, setLogotipoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logotipoPreview, setLogotipoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});


  const temaDocRef = doc(db, 'configuracoes', 'temaCustom');

  const applyCustomColor = useCallback((hslString: string | null | undefined) => {
    const colorToApply = hslString || defaultPrimaryHSL;
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty('--primary', colorToApply);
      document.documentElement.style.setProperty('--sidebar-primary', colorToApply);
      document.documentElement.style.setProperty('--sidebar-accent-foreground', colorToApply);
      document.documentElement.style.setProperty('--sidebar-ring', colorToApply);
      document.documentElement.style.setProperty('--ring', colorToApply);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      try {
        const docSnap = await getDoc(temaDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as TemaCustomData;
          setCustomData(data);
          if (data.logotipoUrl) setLogotipoPreview(data.logotipoUrl);
          if (data.bannerUrl) setBannerPreview(data.bannerUrl);
          applyCustomColor(data.corPrincipalHSL);
        } else {
          applyCustomColor(defaultPrimaryHSL); 
        }
      } catch (error) {
        const firestoreError = error as FirestoreError;
        console.error("Erro ao buscar tema customizado:", firestoreError);
        toast({ title: "Erro ao carregar tema", variant: "destructive" });
        applyCustomColor(defaultPrimaryHSL); 
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, [toast, applyCustomColor]);


  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>, type: 'logotipo' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { 
        toast({ title: "Arquivo muito grande", description: "Selecione uma imagem menor que 2MB.", variant: "destructive" });
        return;
      }
      if (type === 'logotipo') {
        setLogotipoFile(file);
        setLogotipoPreview(URL.createObjectURL(file));
      } else {
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
      }
    }
  }, [toast]);
  
  const uploadFile = useCallback(async (file: File, path: string): Promise<string | null> => {
    if (!file) return null;
    const fileRef = storageRef(storage, `${path}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(prev => ({ ...prev, [path]: progress }));
        },
        (error: StorageError) => {
          console.error(`Erro no upload (${path}):`, error);
          toast({ title: `Erro no Upload (${path})`, description: error.message, variant: "destructive" });
          setUploadProgress(prev => ({ ...prev, [path]: 0}));
          reject(null);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUploadProgress(prev => ({ ...prev, [path]: 0}));
          resolve(downloadURL);
        }
      );
    });
  }, [toast]);

  const handleSaveCustomizations = useCallback(async () => {
    setIsSaving(true);
    let newLogotipoUrl = customData.logotipoUrl;
    let newBannerUrl = customData.bannerUrl;

    try {
      if (logotipoFile) {
        newLogotipoUrl = await uploadFile(logotipoFile, 'logotipos') || newLogotipoUrl;
      }
      if (bannerFile) {
        newBannerUrl = await uploadFile(bannerFile, 'banners') || newBannerUrl;
      }

      const dataToSave: TemaCustomData = {
        logotipoUrl: newLogotipoUrl,
        bannerUrl: newBannerUrl,
        corPrincipalHSL: customData.corPrincipalHSL?.trim() || defaultPrimaryHSL,
      };

      await setDoc(temaDocRef, { ...dataToSave, dataModificacao: serverTimestamp() }, { merge: true });
      setCustomData(dataToSave); 
      setLogotipoFile(null); 
      setBannerFile(null);
      applyCustomColor(dataToSave.corPrincipalHSL);
      toast({ title: "Tema Salvo!", description: "Suas personalizações foram aplicadas." });
    } catch (error) {
      console.error("Erro ao salvar tema:", error);
      toast({ title: "Erro ao Salvar Tema", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [customData, logotipoFile, bannerFile, uploadFile, toast, applyCustomColor, temaDocRef]);
  
  const handleRemoveImage = useCallback(async (type: 'logotipoUrl' | 'bannerUrl') => {
    const currentUrl = customData[type];
    if (currentUrl) {
      try {
        const imageRef = storageRef(storage, currentUrl); 
        await deleteObject(imageRef);
      } catch (error) {
        const storageError = error as StorageError;
        if (storageError.code !== 'storage/object-not-found') {
            console.warn(`Falha ao remover imagem do Storage (${type}):`, storageError);
            toast({title: "Aviso", description: `Não foi possível remover a imagem antiga do armazenamento, mas será desvinculada.`, variant:"default"});
        }
      }
    }
    const updatedCustomData = { ...customData, [type]: null };
    setCustomData(updatedCustomData);
    if (type === 'logotipoUrl') setLogotipoPreview(null);
    if (type === 'bannerUrl') setBannerPreview(null);
    
    try {
        await setDoc(temaDocRef, { ...updatedCustomData, dataModificacao: serverTimestamp() }, { merge: true });
        toast({title: "Imagem Removida", description: `A imagem (${type.replace('Url','')}) foi desvinculada.`});
    } catch (error) {
        console.error("Erro ao salvar remoção da imagem no Firestore:", error);
        toast({ title: "Erro ao Salvar Remoção", description: "Não foi possível atualizar a remoção da imagem no banco de dados.", variant: "destructive" });
    }
  }, [customData, toast, temaDocRef]);
  
  const handleColorChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value.trim();
    setCustomData(prev => ({...prev, corPrincipalHSL: newColor}));
  }, []);


  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Carregando configurações de tema...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Tema e Aparência</h1>
        <p className="text-muted-foreground">Personalize a identidade visual do seu painel e cardápio.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ImagePlus className="h-5 w-5 text-primary"/> Logotipo e Banner</CardTitle>
          <CardDescription>Imagens que representam seu restaurante.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-2">
              <Label htmlFor="logotipoFile">Logotipo (Max 2MB, recomendado PNG transparente)</Label>
              <Input id="logotipoFile" type="file" accept="image/png, image/jpeg, image/webp" onChange={(e) => handleFileChange(e, 'logotipo')} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" disabled={isSaving}/>
              {uploadProgress['logotipos'] > 0 && <progress value={uploadProgress['logotipos']} max="100" className="w-full h-2 rounded-full [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-primary transition-all"></progress>}
              {logotipoPreview && (
                <div className="mt-2 p-2 border rounded-md bg-muted/30 flex flex-col items-center gap-2">
                  <Image src={logotipoPreview} alt="Pré-visualização Logotipo" width={128} height={128} className="object-contain rounded-md max-h-32"/>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveImage('logotipoUrl')} className="text-xs text-destructive" disabled={isSaving}><Trash2 className="mr-1 h-3 w-3"/> Remover Logotipo</Button>
                </div>
              )}
              {!logotipoPreview && !customData.logotipoUrl && <p className="text-xs text-muted-foreground flex items-center gap-1"><Info className="h-3 w-3"/>Nenhum logotipo definido.</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bannerFile">Banner (Max 2MB, para cardápio público)</Label>
              <Input id="bannerFile" type="file" accept="image/png, image/jpeg, image/webp" onChange={(e) => handleFileChange(e, 'banner')} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" disabled={isSaving}/>
               {uploadProgress['banners'] > 0 && <progress value={uploadProgress['banners']} max="100" className="w-full h-2 rounded-full [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-primary transition-all"></progress>}
              {bannerPreview && (
                <div className="mt-2 p-2 border rounded-md bg-muted/30 flex flex-col items-center gap-2">
                  <Image src={bannerPreview} alt="Pré-visualização Banner" width={256} height={128} className="object-cover rounded-md max-h-32 w-full"/>
                   <Button variant="ghost" size="sm" onClick={() => handleRemoveImage('bannerUrl')} className="text-xs text-destructive" disabled={isSaving}><Trash2 className="mr-1 h-3 w-3"/> Remover Banner</Button>
                </div>
              )}
               {!bannerPreview && !customData.bannerUrl && <p className="text-xs text-muted-foreground flex items-center gap-1"><Info className="h-3 w-3"/>Nenhum banner definido.</p>}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><PaletteIcon className="h-5 w-5 text-primary"/> Cor Principal do Painel</CardTitle>
          <CardDescription>Altere a cor de destaque dos botões e elementos do painel.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="corPrincipalHSL">Cor Primária (formato HSL)</Label>
          <Input
            id="corPrincipalHSL"
            value={customData.corPrincipalHSL || ''}
            onChange={handleColorChange}
            placeholder="Ex: 220 80% 50%"
            disabled={isSaving}
          />
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Info className="h-3 w-3"/>
            Use valores HSL (Hue, Saturation, Lightness) sem "hsl()". Ex: <code className="bg-muted px-1 py-0.5 rounded">129 100% 54.1%</code> para o verde padrão.
          </p>
           <div className="mt-2 p-2 rounded-md" style={{ backgroundColor: `hsl(${customData.corPrincipalHSL || defaultPrimaryHSL})`}}>
            <p className="text-sm text-center font-semibold" style={{ color: `hsl(var(--primary-foreground))`}}>Preview da Cor</p>
           </div>
        </CardContent>
      </Card>

      <CardFooter className="border-t mt-8 pt-6">
        <div className="flex justify-end w-full">
          <Button onClick={handleSaveCustomizations} disabled={isSaving || isFetching}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Personalizações
          </Button>
        </div>
      </CardFooter>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Tema da Aplicação (Claro/Escuro)</CardTitle>
          <CardDescription>Escolha como o painel geral será exibido.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={theme} onValueChange={setTheme} className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent hover:text-accent-foreground transition-colors">
              <div className="flex items-center space-x-3"> <RadioGroupItem value="light" id="light-theme" /> <Label htmlFor="light-theme" className="flex items-center cursor-pointer"> <Sun className="mr-2 h-5 w-5" /> Claro </Label> </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent hover:text-accent-foreground transition-colors">
              <div className="flex items-center space-x-3"> <RadioGroupItem value="dark" id="dark-theme" /> <Label htmlFor="dark-theme" className="flex items-center cursor-pointer"> <Moon className="mr-2 h-5 w-5" /> Escuro </Label> </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent hover:text-accent-foreground transition-colors">
             <div className="flex items-center space-x-3"> <RadioGroupItem value="system" id="system-theme" /> <Label htmlFor="system-theme" className="flex items-center cursor-pointer"> <Laptop className="mr-2 h-5 w-5" /> Sistema </Label> </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
}

const TemaCustomizationForm = React.memo(OriginalTemaCustomizationForm);
export default TemaCustomizationForm;
