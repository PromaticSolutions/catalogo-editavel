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
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState(''); // Manter como string
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(String(product.price));
      // CORREÇÃO AQUI: Garante que o ID da categoria seja uma string para o <select>
      setCategoryId(String(product.category_id)); 
      setImageUrl(product.image_url);
    } else {
      // Ao criar um novo produto, define a primeira categoria da lista como padrão
      // para evitar que o campo fique vazio.
      setName('');
      setDescription('');
      setPrice('');
      setCategoryId(categories.length > 0 ? String(categories[0].id) : ''); // CORREÇÃO AQUI
      setImageUrl('');
    }
  }, [product, categories]); // Adicionado 'categories' à lista de dependências

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validação para garantir que categoryId não é uma string vazia
    if (!categoryId) {
      toast.error("Por favor, selecione uma categoria.");
      setIsSubmitting(false);
      return;
    }

    const productData = {
      name,
      description,
      price: parseFloat(price),
      category_id: parseInt(categoryId, 10), // A conversão para número acontece aqui
      image_url: imageUrl,
    };

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
      toast.error('Erro ao salvar produto: ' + error.message);
    } else {
      toast.success(`Produto ${product ? 'atualizado' : 'criado'} com sucesso!`);
      onClose();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">{product ? 'Editar Produto' : 'Adicionar Novo Produto'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="name">Nome do Produto</label>
                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="price">Preço</label>
                <input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="category">Categoria</label>
                <select 
                  id="category" 
                  value={categoryId} 
                  onChange={(e) => setCategoryId(e.target.value)} 
                  className="w-full px-3 py-2 border rounded-lg" 
                  required
                >
                  {/* Removida a opção "Selecione uma categoria" para garantir que sempre haja um valor */}
                  {categories.map((cat) => (
                    <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="imageUrl">URL da Imagem</label>
                <input id="imageUrl" type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="https://exemplo.com/imagem.png" required />
              </div>
              {imageUrl && (
                <div className="mb-4">
                  <p className="block text-gray-700 mb-2 text-sm">Pré-visualização:</p>
                  <img src={imageUrl} alt="Pré-visualização" className="w-full h-40 object-contain rounded-lg border" />
                </div>
               )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-gray-700 mb-2" htmlFor="description">Descrição</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-lg" rows={4}></textarea>
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
