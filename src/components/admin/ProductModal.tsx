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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name ?? '');
      setDescription(product.description ?? '');
      setPrice(String(product.price ?? ''));
      setCategoryId(String(product.category_id ?? ''));
      setImageUrl(product.image_url ?? '');
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setCategoryId('');
      setImageUrl('');
    }
  }, [product]);

  // Função que realmente executa a submissão (chamada pelo onSubmit e pelo botão)
  const submitData = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    console.log('submitData chamado', { name, price, categoryId, imageUrl, description });

    // Validações em JS
    if (!name.trim()) {
      toast.error('Por favor, informe o nome do produto');
      setIsSubmitting(false);
      return;
    }

    const parsedPrice = parseFloat(price as string);
    if (isNaN(parsedPrice)) {
      toast.error('Preço inválido');
      setIsSubmitting(false);
      return;
    }

    const parsedCategoryId = Number(categoryId);
    if (!parsedCategoryId || isNaN(parsedCategoryId)) {
      toast.error('Por favor, selecione uma categoria válida');
      setIsSubmitting(false);
      return;
    }

    if (!imageUrl.trim()) {
      toast.error('Por favor, informe a URL da imagem');
      setIsSubmitting(false);
      return;
    }

    const productData = {
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      category_id: parsedCategoryId,
      image_url: imageUrl.trim(),
    };

    try {
      let error = null;
      if (product) {
        const { data, error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id)
          .select();
        console.log('resultado update', { data, updateError });
        error = updateError;
      } else {
        const { data, error: insertError } = await supabase
          .from('products')
          .insert([productData])
          .select();
        console.log('resultado insert', { data, insertError });
        error = insertError;
      }

      if (error) {
        console.error('Erro supabase:', error);
        toast.error('Erro ao salvar produto: ' + (error.message ?? JSON.stringify(error)));
      } else {
        toast.success(`Produto ${product ? 'atualizado' : 'criado'} com sucesso!`);
        onClose();
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      toast.error('Erro inesperado ao salvar produto');
    } finally {
      setIsSubmitting(false);
    }
  };

  // handler do form (para quando o usuário apertar Enter)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitData();
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
                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="price">Preço</label>
                <input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="category">Categoria</label>
                <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                  <option value="" hidden>Selecione uma categoria</option>
                  {categories && categories.map((cat) => (
                    <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="imageUrl">URL da Imagem</label>
                <input id="imageUrl" type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="https://exemplo.com/imagem.png" />
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
            {/* O botão chama submitData diretamente para garantir que clique sempre funcione */}
            <button type="button" onClick={submitData} disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
              {isSubmitting ? 'Salvando...' : 'Salvar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
