'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Ambiente, Categoria, SubCategoria, Prioridade, CompraItem } from '../types';
import {
  X,
  Save,
  Calculator,
  Link as LinkIcon,
  Trash2,
  ChefHat,
  Tv,
  Sun,
  Bath,
  Monitor,
  Bed,
  Package,
  Zap,
  Clock,
  PauseCircle,
  FileText,
  CheckCircle2,
  Hammer,
  Smartphone,
  Utensils,
  Shirt,
  AlertCircle,
  ExternalLink,
  ImageIcon,
  Plus,
} from 'lucide-react';
import { comprasService } from '../services/comprasService';
import { CustomSelect, SelectOption } from '@/components/CustomSelect';
import { CurrencyInput } from '@/components/CurrencyInput';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ImageUpload, ImageUploadHandle } from '@/components/ImageUpload';
import { useImageUpload } from '@/hooks/useImageUpload';
import {
  ALL_AMBIENTES,
  ALL_CATEGORIAS,
  PRIORIDADE_ORDER,
  SUB_CATEGORIAS_BY_CATEGORIA,
} from '../constants';

interface ItemFormProps {
  onSave: (item: Omit<CompraItem, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => Promise<void>;
  onClose: () => void;
  initialData?: CompraItem;
  defaultAmbiente?: Ambiente;
}

const AMBIENTES_OPTIONS: SelectOption<Ambiente>[] = [
  { value: '1. Cozinha', label: 'Cozinha', icon: <ChefHat className="w-4 h-4" /> },
  { value: '2. Sala', label: 'Sala', icon: <Tv className="w-4 h-4" /> },
  { value: '3. Varanda', label: 'Varanda', icon: <Sun className="w-4 h-4" /> },
  { value: '4. Banheiro', label: 'Banheiro', icon: <Bath className="w-4 h-4" /> },
  { value: '5. Escritório', label: 'Escritório', icon: <Monitor className="w-4 h-4" /> },
  { value: '6. Quarto', label: 'Quarto', icon: <Bed className="w-4 h-4" /> },
  { value: '7. Gerais', label: 'Gerais', icon: <Package className="w-4 h-4" /> },
];

const PRIORIDADES_OPTIONS: SelectOption<Prioridade>[] = [
  {
    value: 'Comprar agora',
    label: 'Comprar agora',
    icon: <Zap className="w-4 h-4 text-amber-500" />,
  },
  { value: 'Quando der', label: 'Quando der', icon: <Clock className="w-4 h-4 text-blue-500" /> },
  {
    value: 'Pode esperar',
    label: 'Pode esperar',
    icon: <PauseCircle className="w-4 h-4 text-slate-400" />,
  },
  {
    value: 'Aguardando projeto',
    label: 'Aguardando projeto',
    icon: <FileText className="w-4 h-4 text-purple-500" />,
  },
  {
    value: 'Adquirido',
    label: 'Adquirido',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  },
];

const CATEGORIAS_OPTIONS: SelectOption<Categoria>[] = [
  { value: '1. Reforma', label: 'Reforma', icon: <Hammer className="w-4 h-4" /> },
  { value: '2. Eletros', label: 'Eletros', icon: <Smartphone className="w-4 h-4" /> },
  { value: '3. Utensílios', label: 'Utensílios', icon: <Utensils className="w-4 h-4" /> },
  { value: '4. Enxoval', label: 'Enxoval', icon: <Shirt className="w-4 h-4" /> },
];

export function ItemForm({ onSave, onClose, initialData, defaultAmbiente }: ItemFormProps) {
  const { deleteImage } = useImageUpload();
  const initialPrioridade = initialData?.adquirido
    ? 'Adquirido'
    : initialData?.prioridade || PRIORIDADE_ORDER[0];
  const initialAdquirido = initialPrioridade === 'Adquirido' || (initialData?.adquirido ?? false);

  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>(
    initialData?.imagemUrl,
  );
  const [currentImagePosition, setCurrentImagePosition] = useState<string | undefined>(
    initialData?.imagemPosition,
  );
  const imageUploadRef = useRef<ImageUploadHandle>(null);
  const [formData, setFormData] = useState({
    nome: initialData?.nome || '',
    ambiente: initialData?.ambiente || defaultAmbiente || ALL_AMBIENTES[0],
    categoria: initialData?.categoria || ALL_CATEGORIAS[0],
    subCategoria: initialData?.subCategoria || SUB_CATEGORIAS_BY_CATEGORIA[ALL_CATEGORIAS[0]][0],
    prioridade: initialPrioridade,
    quantidade: initialData?.quantidade || 1,
    valorUnitario: initialData?.valorUnitario || 0,
    modelo: initialData?.modelo || '',
    fabricante: initialData?.fabricante || '',
    links: initialData?.links ?? (initialData?.link ? [initialData.link] : ['']),
    observacoes: initialData?.observacoes || '',
    adquirido: initialAdquirido,
    quantidadeAdquirida: initialData?.quantidadeAdquirida ?? 0,
  });

  useEffect(() => {
    setFormData((f) => {
      if (f.quantidade <= 1) return f;
      const qtdAdquirida = Math.min(f.quantidadeAdquirida, f.quantidade);
      const isComplete = qtdAdquirida >= f.quantidade;
      const prioridade = isComplete
        ? 'Adquirido'
        : f.prioridade === 'Adquirido'
          ? 'Quando der'
          : f.prioridade;
      const adquirido = isComplete;
      if (
        qtdAdquirida === f.quantidadeAdquirida &&
        prioridade === f.prioridade &&
        adquirido === f.adquirido
      ) {
        return f;
      }
      return { ...f, quantidadeAdquirida: qtdAdquirida, prioridade, adquirido };
    });
  }, [formData.quantidadeAdquirida, formData.quantidade]);

  const valorTotalAproximado = formData.quantidade * formData.valorUnitario;

  const subCategoriasOptions: SelectOption<SubCategoria>[] = SUB_CATEGORIAS_BY_CATEGORIA[
    formData.categoria
  ].map((subCategory) => ({
    value: subCategory,
    label: subCategory.includes('. ') ? subCategory.split('. ')[1] : subCategory,
    icon: CATEGORIAS_OPTIONS.find((categoryOption) => categoryOption.value === formData.categoria)
      ?.icon,
  }));

  const handleDelete = async () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!initialData?.id) return;
    setLoading(true);
    try {
      // Best-effort: delete image from Storage without blocking
      if (initialData.imagemUrl && !initialData.imagemUrl.startsWith('blob:')) {
        deleteImage(initialData.imagemUrl).catch(() => {});
      }
      await comprasService.deleteItem(initialData.id);
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      console.error('Erro ao deletar item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setSaveError(null);
    try {
      const finalPrioridade = formData.adquirido ? 'Adquirido' : formData.prioridade;

      let imagemUrl = currentImageUrl;
      if (imageUploadRef.current) {
        try {
          imagemUrl = await imageUploadRef.current.upload();
        } catch {
          // Upload error is displayed inside the ImageUpload component
          setLoading(false);
          return;
        }
      }

      // Se havia uma imagem antes e agora ela foi removida OU substituída por uma nova
      if (
        initialData?.imagemUrl &&
        initialData.imagemUrl !== imagemUrl &&
        !initialData.imagemUrl.startsWith('blob:')
      ) {
        // Tentativa de deleção em background
        deleteImage(initialData.imagemUrl).catch((err) =>
          console.error('Falha ao deletar imagem antiga:', err),
        );
      }

      const savedLinks = formData.links.filter((l) => l.trim());
      const qtdTotal = formData.quantidade;
      const qtdAdquirida = Math.min(formData.quantidadeAdquirida, qtdTotal);
      const adquiridoFinal =
        qtdTotal > 1 ? qtdAdquirida >= qtdTotal : finalPrioridade === 'Adquirido';
      await onSave(
        {
          ...formData,
          imagemUrl: imagemUrl || '',
          imagemPosition: currentImagePosition || '50% 50%',
          links: savedLinks,
          link: savedLinks[0],
          prioridade: finalPrioridade,
          adquirido: adquiridoFinal,
          quantidadeAdquirida: qtdAdquirida,
          valorTotalAproximado: valorTotalAproximado,
        },
        initialData?.id,
      );
      // NÃO chamar onClose() aqui — o pai fecha via onSave
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      setSaveError('Não foi possível salvar. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="bg-white w-full max-w-[550px] h-[94dvh] sm:h-auto sm:max-h-[90dvh] rounded-t-[48px] sm:rounded-[40px] overflow-hidden flex flex-col shadow-2xl animate-pop"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Drag handle — mobile only */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">
              {initialData ? 'Editar Item' : 'Novo Item'}
            </h2>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
              Detalhes da Compra
            </p>
          </div>
          <div className="flex items-center gap-3">
            {initialData && (
              <button
                type="button"
                onClick={handleDelete}
                className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-400 hover:text-red-600 transition-all active:scale-90 shadow-sm border border-white"
                title="Excluir Item"
                aria-label="Excluir item"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all active:scale-90 shadow-sm border border-white"
              aria-label="Fechar formulário"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 min-h-0 overflow-y-auto px-10 py-8 space-y-8 no-scrollbar scroll-smooth pb-40 bg-white"
        >
          <div className="space-y-3">
            <label
              htmlFor="item-nome"
              className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"
            >
              O que vamos comprar?
            </label>
            <input
              required
              id="item-nome"
              type="text"
              placeholder="Nome do item..."
              className="w-full h-16 bg-slate-50 border-2 border-transparent focus:border-brand-pink focus:bg-white rounded-[24px] px-6 text-lg font-bold text-slate-900 transition-all outline-none shadow-sm"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CustomSelect<Ambiente>
              label="Ambiente"
              options={AMBIENTES_OPTIONS}
              value={formData.ambiente}
              onChange={(selectedValue) => setFormData({ ...formData, ambiente: selectedValue })}
              searchable
              color="blue"
            />
            <CustomSelect<Prioridade>
              label="Prioridade"
              options={PRIORIDADES_OPTIONS}
              value={formData.prioridade}
              onChange={(selectedValue) => {
                const isAdquirido = selectedValue === 'Adquirido';
                setFormData({
                  ...formData,
                  prioridade: selectedValue,
                  adquirido: isAdquirido,
                  quantidadeAdquirida: isAdquirido
                    ? formData.quantidade
                    : formData.quantidadeAdquirida,
                });
              }}
              color="pink"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label
                htmlFor="item-quantidade"
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"
              >
                Quantidade
              </label>
              <input
                id="item-quantidade"
                type="number"
                min="1"
                className="w-full h-16 bg-slate-50 border-2 border-transparent focus:border-brand-green focus:bg-white rounded-[24px] px-6 text-lg font-bold text-slate-900 outline-none shadow-sm transition-all"
                value={formData.quantidade}
                onChange={(event) => {
                  const quantityValue = Math.max(1, Number(event.target.value));
                  setFormData({ ...formData, quantidade: quantityValue });
                }}
              />
            </div>
            <CurrencyInput
              label="Preço Unitário"
              value={formData.valorUnitario}
              onChange={(newAmount) => setFormData({ ...formData, valorUnitario: newAmount })}
            />
          </div>

          {initialData && formData.quantidade > 1 && (
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Quantidade já adquirida
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((f) => ({
                      ...f,
                      quantidadeAdquirida: Math.max(0, f.quantidadeAdquirida - 1),
                    }))
                  }
                  className="w-14 h-14 bg-slate-50 rounded-2xl font-black text-xl text-slate-600 hover:bg-slate-100 active:scale-90 transition-all"
                >
                  −
                </button>
                <div className="flex-1 h-14 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-2xl text-slate-900">
                  {formData.quantidadeAdquirida}
                  <span className="text-slate-300 font-bold text-base ml-1">
                    /{formData.quantidade}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((f) => ({
                      ...f,
                      quantidadeAdquirida: Math.min(f.quantidade, f.quantidadeAdquirida + 1),
                    }))
                  }
                  className="w-14 h-14 bg-slate-50 rounded-2xl font-black text-xl text-slate-600 hover:bg-slate-100 active:scale-90 transition-all"
                >
                  +
                </button>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-green rounded-full transition-all duration-300"
                  style={{
                    width: `${(formData.quantidadeAdquirida / formData.quantidade) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Valor Total com Estilo Chá Revelação */}
          <div
            className="bg-gradient-to-br from-brand-blue-light to-white p-8 rounded-[32px] border border-brand-blue/20 flex items-center justify-between shadow-premium"
            role="status"
            aria-label={`Total estimado: ${formatCurrency(valorTotalAproximado)}`}
          >
            <div className="flex items-center gap-3 text-brand-blue-dark">
              <Calculator className="w-6 h-6" aria-hidden="true" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                Total Estimado
              </span>
            </div>
            <span className="text-3xl font-black text-slate-900 tracking-tighter">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                valorTotalAproximado,
              )}
            </span>
          </div>

          <div className="space-y-4">
            <CustomSelect<Categoria>
              label="Categoria"
              options={CATEGORIAS_OPTIONS}
              value={formData.categoria}
              onChange={(selectedValue) => {
                setFormData({
                  ...formData,
                  categoria: selectedValue,
                  subCategoria: SUB_CATEGORIAS_BY_CATEGORIA[selectedValue][0],
                });
              }}
              color="slate"
            />
            <CustomSelect<SubCategoria>
              label="Estilo / Subcategoria"
              options={subCategoriasOptions}
              value={formData.subCategoria}
              onChange={(selectedValue) =>
                setFormData({ ...formData, subCategoria: selectedValue })
              }
              color="pink"
              placeholder="Selecione o estilo..."
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between ml-1 mr-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <LinkIcon className="w-4 h-4" aria-hidden="true" /> Links do Produto
              </label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, links: [...formData.links, ''] })}
                className="flex items-center gap-1 text-[10px] font-black text-slate-400 hover:text-brand-blue-dark uppercase tracking-widest transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </button>
            </div>
            <div className="space-y-2">
              {formData.links.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://..."
                    className="flex-1 h-16 bg-slate-50 border-2 border-transparent rounded-[24px] px-6 text-sm font-bold text-slate-900 outline-none shadow-sm focus:border-brand-blue focus:bg-white transition-all"
                    value={link}
                    onChange={(e) => {
                      const links = [...formData.links];
                      links[index] = e.target.value;
                      setFormData({ ...formData, links });
                    }}
                  />
                  {link.trim() && (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Abrir link"
                      className="shrink-0 w-11 h-11 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-brand-blue-dark hover:bg-slate-100 transition-all shadow-sm border border-white"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {formData.links.length > 1 && (
                    <button
                      type="button"
                      aria-label="Remover link"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          links: formData.links.filter((_, i) => i !== index),
                        })
                      }
                      className="shrink-0 w-11 h-11 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all shadow-sm border border-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label
              htmlFor="item-observacoes"
              className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"
            >
              Observações <span className="text-[8px] opacity-50 ml-1">(Opcional)</span>
            </label>
            <textarea
              id="item-observacoes"
              rows={5}
              className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] p-6 text-sm font-bold text-slate-900 outline-none shadow-sm focus:border-slate-300 focus:bg-white transition-all resize-none"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" aria-hidden="true" /> Foto do Item{' '}
              <span className="text-[8px] opacity-50 ml-1">(Opcional)</span>
            </label>
            <ImageUpload
              ref={imageUploadRef}
              value={currentImageUrl}
              onChange={(url) => setCurrentImageUrl(url)}
              imagePosition={currentImagePosition}
              onPositionChange={(pos) => setCurrentImagePosition(pos)}
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="bg-white border-t border-slate-50 sticky bottom-0 z-10 shadow-[0_-20px_40px_rgba(0,0,0,0.02)]">
          {saveError && (
            <div className="px-10 pt-6">
              <div
                className="bg-red-50 border border-red-100 rounded-2xl px-5 py-3 flex items-center gap-3"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-xs font-bold text-red-600">{saveError}</p>
              </div>
            </div>
          )}

          <div className="p-10 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-16 rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all shadow-sm border border-white touch-manipulation"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.nome}
              className="flex-[2] h-16 rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] text-white bg-slate-900 hover:bg-black flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50 shadow-xl shadow-slate-900/10 touch-manipulation"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar Item
                </>
              )}
            </button>
          </div>
        </div>

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Excluir item"
          message="Esta ação não pode ser desfeita. O item será removido permanentemente."
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          variant="danger"
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      </div>
    </div>
  );
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
}
