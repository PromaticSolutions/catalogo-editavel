// src/components/admin/Categories.tsx - VERSÃO COM ÍCONE CORRETO

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Package, Plus, Edit, Trash2 } from 'lucide-react'; // << ÍCONE CORRIGIDO

interface Category {
  id: string;
  name: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
    setLoading(false);
  };

  const handleSave = async () => {
    const name = editingCategory ? editingCategory.name : newCategoryName;
    if (!name.trim()) return;

    if (editingCategory) {
      // Update
      const { error } = await supabase.from('categories').update({ name }).eq('id', editingCategory.id);
      if (!error) setEditingCategory(null);
    } else {
      // Insert
      const { error } = await supabase.from('categories').insert({ name });
      if (!error) setNewCategoryName('');
    }
    loadCategories();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza? Excluir uma categoria removerá a associação de todos os produtos, mas não excluirá os produtos.')) {
      await supabase.from('categories').delete().eq('id', id);
      loadCategories();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Categorias</h2>
        <p className="text-gray-600">Gerencie as categorias dos seus produtos</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="font-semibold mb-4">Nova Categoria</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Ex: Sedas"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
          />
          <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
            <Plus className="h-5 w-5" /> Salvar
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="font-semibold mb-4">Categorias Existentes</h3>
        <ul className="space-y-3">
          {loading ? <p>Carregando...</p> : categories.map(cat => (
            <li key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              {editingCategory?.id === cat.id ? (
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
                />
              ) : (
                <span className="flex items-center gap-2"><Package className="h-4 w-4 text-gray-500" /> {cat.name}</span> // << ÍCONE CORRIGIDO
              )}
              <div className="flex gap-3">
                {editingCategory?.id === cat.id ? (
                  <button onClick={handleSave} className="text-green-600 hover:text-green-800">Salvar</button>
                ) : (
                  <button onClick={() => setEditingCategory(cat)} className="text-blue-600 hover:text-blue-800"><Edit className="h-5 w-5" /></button>
                )}
                <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-800"><Trash2 className="h-5 w-5" /></button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
