// src/components/admin/ProductModal.tsx - VERSÃO FINAL CORRIGIDA E LIMPA

import { useState, useEffect } from 'react';
import { X, Package } from 'lucide-react';
import { supabase, Product } from '../../lib/supabase';

interface Category {
  id: string;
  name: string;
}

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onSaveSuccess: () => void;
}

export default function ProductModal({ product, onClose, onSaveSuccess }: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    is_active: true,
    category_id: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase.from('categories').select('id, name').order('name');
      if (data) setCategories(data);
    };
    loadCategories();

    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        stock_quantity: product.stock_quantity.toString(),
        is_active: product.is_active,
        category_id: product.category_id || '',
      });
      setImagePreview(product.image_url || null);
    } else {
      setFormData({ name: '', description: '', price: '', stock_quantity: '', is_active: true, category_id: '' });
      setImageFile(null);
      setImagePreview(null);
    }
  }, [product]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => { setImagePreview(reader.result as string); };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    let imageUrl = product ? product.image_url : '';

    if (imageFile) {
      setUploading(true);
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const options = {
        cacheControl: '3600',
        upsert: true,
        contentType: imageFile.type,
      };

      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('product-images')
        .upload(fileName, imageFile, options);

      if (uploadError) {
        setErrorMessage(`Erro no upload: ${uploadError.message}`);
        setLoading(false);
        setUploading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(uploadData.path);
      imageUrl = publicUrlData.publicUrl;
      setUploading(false);
    }

    const dataToSave = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      image_url: imageUrl,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      is_active: formData.is_active,
      category_id: formData.category_id || null,
    };

    if (product) {
      const { error } = await supabase.from('products').update(dataToSave).eq('id', product.id);
      if (error) { setErrorMessage(`Falha ao atualizar: ${error.message}`); } 
      else { onSaveSuccess(); onClose(); }
    } else {
      const { error } = await supabase.from('products').insert(dataToSave);
      if (error) { setErrorMessage(`Falha ao criar: ${error.message}`); } 
      else { onSaveSuccess(); onClose(); }
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{product ? 'Editar Produto' : 'Novo Produto'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço *</label>
              <input type="number" step="0.01" min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estoque *</label>
              <input type="number" min="0" value={formData.stock_quantity} onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
              <option value="">Sem categoria</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagem do Produto</label>
            <div className="mt-2 flex items-center gap-4">
              <div className="w-24 h-24 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
                {imagePreview ? <img src={imagePreview} alt="Preview" className="h-full w-full object-cover rounded-lg" /> : <Package className="h-8 w-8 text-gray-400" />}
              </div>
              <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">Produto ativo</label>
          </div>
          {errorMessage && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"><strong>Erro:</strong> {errorMessage}</div>}
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={loading || uploading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">{uploading ? 'Enviando...' : loading ? 'Salvando...' : product ? 'Atualizar' : 'Criar'}</button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
