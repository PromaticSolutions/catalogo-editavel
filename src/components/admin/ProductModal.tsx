// src/components/admin/ProductModal.tsx - VERSÃO FINAL CORRIGIDA

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types/Product';
import { Category } from '../../types/Category';
// --- CORREÇÃO 1: Importar 'AttributeOption' também ---
import { Attribute, AttributeOption } from '../../lib/supabase';
import { toast } from 'react-toastify';
import { Package } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
}

export default function ProductModal({ product, categories, onClose }: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    imageUrl: '',
    stockQuantity: '0',
    referencia: '',
  });

  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAttributes = async () => {
    const { data, error } = await supabase
      .from('attributes')
      .select(`id, name, attribute_options ( id, value )`);
    
    if (error) {
      toast.error("Erro ao buscar filtros: " + error.message);
    } else {
      setAttributes(data as Attribute[]);
    }
  };

  const fetchProductAttributes = async (productId: string) => {
    const { data, error } = await supabase
      .from('product_attributes')
      .select('*, attribute_options(*, attributes(*))')
      .eq('product_id', productId);

    if (error) {
      toast.error("Erro ao buscar os filtros do produto.");
    } else {
      const initialSelections: Record<string, string> = {};
      for (const pa of data) {
        if (pa.attribute_options && pa.attribute_options.attributes) {
          const attributeId = pa.attribute_options.attributes.id;
          const optionId = pa.option_id;
          initialSelections[attributeId] = optionId;
        }
      }
      setSelectedAttributes(initialSelections);
    }
  };

  useEffect(() => {
    fetchAttributes();
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: String(product.price || ''),
        categoryId: product.category_id || '',
        imageUrl: product.image_url || '',
        stockQuantity: String(product.stock_quantity || '0'),
        referencia: product.referencia || '',
      });
      setPreviewUrl(product.image_url || null);
      fetchProductAttributes(product.id);
    } else {
      setFormData({ name: '', description: '', price: '', categoryId: '', imageUrl: '', stockQuantity: '0', referencia: '' });
      setSelectedFile(null);
      setPreviewUrl(null);
      setSelectedAttributes({});
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAttributeChange = (attributeId: string, optionId: string) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [attributeId]: optionId,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
      toast.error('Por favor, selecione uma categoria.');
      return;
    }
    
    setIsSubmitting(true);
    let finalImageUrl = formData.imageUrl;

    if (selectedFile) {
      const fileName = `${Date.now()}-${selectedFile.name.replace(/\s/g, '_')}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, selectedFile);
      if (uploadError) {
        toast.error(`Erro no upload: ${uploadError.message}`);
        setIsSubmitting(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
      finalImageUrl = publicUrlData.publicUrl;
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category_id: formData.categoryId,
      image_url: finalImageUrl,
      stock_quantity: parseInt(formData.stockQuantity, 10) || 0,
      referencia: formData.referencia || null,
    };

    try {
      let productId = product?.id;
      let error;

      if (product) {
        // --- CORREÇÃO 2: Remover a declaração de 'data' que não é usada ---
        const { error: updateError } = await supabase.from('products').update(productData).eq('id', product.id);
        error = updateError;
      } else {
        // --- CORREÇÃO 3: Renomear 'data' para pegar o ID do novo produto ---
        const { data: insertedData, error: insertError } = await supabase.from('products').insert(productData).select().single();
        error = insertError;
        if (insertedData) productId = insertedData.id;
      }

      if (error) throw error;
      if (!productId) throw new Error("ID do produto não encontrado após salvar.");

      await supabase.from('product_attributes').delete().eq('product_id', productId);

      const attributesToInsert = Object.values(selectedAttributes)
        .filter(optionId => optionId)
        .map(optionId => ({ product_id: productId, option_id: optionId }));

      if (attributesToInsert.length > 0) {
        const { error: attrError } = await supabase.from('product_attributes').insert(attributesToInsert);
        if (attrError) throw attrError;
      }

      toast.success(`Produto ${product ? 'atualizado' : 'criado'} com sucesso!`);
      onClose();

    } catch (err: any) {
      console.error("Erro ao salvar produto ou atributos:", err);
      toast.error('Erro ao salvar: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">{product ? 'Editar Produto' : 'Adicionar Novo Produto'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Nome do Produto</label>
                <input name="name" type="text" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Referência / SKU</label>
                <input name="referencia" type="text" value={formData.referencia} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Ex: PITEIRA-001" />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Preço</label>
                <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Categoria</label>
                <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required>
                  <option value="" disabled>Selecione uma categoria</option>
                  {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Quantidade em Estoque</label>
                <input name="stockQuantity" type="number" min="0" value={formData.stockQuantity} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Fazer Upload da Imagem</label>
                <label htmlFor="file-upload" className="w-full flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                  <Package className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-600">{selectedFile ? 'Arquivo selecionado!' : 'Escolher arquivo'}</span>
                </label>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Colar URL da Imagem</label>
                <input name="imageUrl" type="text" value={formData.imageUrl} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="https://exemplo.com/imagem.png" />
              </div>
              {(previewUrl || formData.imageUrl ) && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pré-visualização:</p>
                  <img src={previewUrl || formData.imageUrl} alt="Pré-visualização" className="w-full h-40 object-contain rounded-lg border bg-gray-50" />
                </div>
              )}
            </div>
          </div>
          
          {attributes.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4">Filtros / Atributos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attributes.map(attr => (
                  <div key={attr.id}>
                    <label className="block text-gray-700 mb-1">{attr.name}</label>
                    <select
                      value={selectedAttributes[attr.id] || ''}
                      onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Nenhum</option>
                      {/* --- CORREÇÃO 4: Adicionar o tipo explícito a 'opt' --- */}
                      {attr.attribute_options.map((opt: AttributeOption) => (
                        <option key={opt.id} value={opt.id}>{opt.value}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t">
            <label className="block text-gray-700 mb-1">Descrição</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" rows={3}></textarea>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
              {isSubmitting ? 'Salvando...' : 'Salvar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
