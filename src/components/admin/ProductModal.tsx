import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types/Product';
import { Category } from '../../types/Category';
import { toast } from 'react-toastify';

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
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: String(product.price || ''),
        // A CORREÇÃO ESTÁ AQUI:
        // Se não houver category_id, o valor do select deve ser '', que corresponde a "Selecione uma categoria"
        categoryId: product.category_id ? String(product.category_id) : '',
        imageUrl: product.image_url || '',
        stockQuantity: String(product.stock_quantity || '0'),
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        imageUrl: '',
        stockQuantity: '0',
      });
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoryId) {
      toast.error('Por favor, selecione uma categoria.');
      return;
    }
    
    setIsSubmitting(true);

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category_id: parseInt(formData.categoryId, 10),
      image_url: formData.imageUrl,
      stock_quantity: parseInt(formData.stockQuantity, 10) || 0,
    };

    try {
      let error;
      if (product) {
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('products')
          .insert([productData]);
        error = insertError;
      }

      if (error) {
        console.error('Erro Supabase:', error);
        toast.error('Erro ao salvar produto: ' + error.message);
      } else {
        toast.success(`Produto ${product ? 'atualizado' : 'criado'} com sucesso!`);
        onClose();
      }
    } catch (err: any) {
      console.error('Erro inesperado:', err);
      toast.error('Erro inesperado ao salvar o produto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">{product ? 'Editar Produto' : 'Adicionar Novo Produto'}</h2>
        <form onSubmit={handleSubmit}>
          {/* O resto do formulário permanece o mesmo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Nome do Produto</label>
                <input name="name" type="text" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Preço</label>
                <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Categoria</label>
                <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required>
                  <option value="" disabled>Selecione uma categoria</option>
                  {categories.map((cat) => (<option key={cat.id} value={String(cat.id)}>{cat.name}</option>))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Quantidade em Estoque</label>
                <input name="stockQuantity" type="number" min="0" value={formData.stockQuantity} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">URL da Imagem</label>
                <input name="imageUrl" type="text" value={formData.imageUrl} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="https://exemplo.com/imagem.png" required />
              </div>
              {formData.imageUrl && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Pré-visualização:</p>
                  <img src={formData.imageUrl} alt="Pré-visualização" className="w-full h-40 object-contain rounded-lg border" />
                </div>
               )}
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-gray-700 mb-2">Descrição</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" rows={4}></textarea>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300">{isSubmitting ? 'Salvando...' : 'Salvar Produto'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
