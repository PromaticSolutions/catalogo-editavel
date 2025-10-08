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
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [quantity, setQuantity] = useState(''); // Estado para quantidade
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(String(product.price));
      setCategoryId(String(product.category_id));
      setImageUrl(product.image_url);
      setQuantity(String(product.quantity)); // Carrega a quantidade do produto existente
    } else {
      // Limpa o formulário para um novo produto
      setName('');
      setDescription('');
      setPrice('');
      setCategoryId('');
      setImageUrl('');
      setQuantity(''); // Limpa a quantidade
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const productData = {
      name,
      description,
      price: parseFloat(price),
      category_id: parseInt(categoryId),
      image_url: imageUrl,
      quantity: parseInt(quantity, 10), // Adiciona a quantidade ao objeto a ser salvo
    };

    let error;
    if (product) {
      // Atualiza produto existente
      const { error: updateError } = await supabase
        .from('products')
        .update(productData)
        .eq('id', product.id);
      error = updateError;
    } else {
      // Cria novo produto
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
            {/* Coluna da Esquerda */}
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
                <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required>
                  <option value="" disabled>Selecione uma categoria</option>
                  {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                </select>
              </div>
              {/* CAMPO DE QUANTIDADE ADICIONADO AQUI */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="quantity">Quantidade em Estoque</label>
                <input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required min="0" placeholder="Ex: 10" />
              </div>
            </div>
            
            {/* Coluna da Direita */}
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

          {/* Descrição */}
          <div className="mt-4">
            <label className="block text-gray-700 mb-2" htmlFor="description">Descrição</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-lg" rows={4}></textarea>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300">{isSubmitting ? 'Salvando...' : 'Salvar Produto'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
