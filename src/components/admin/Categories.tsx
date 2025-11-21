import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Package, Plus, Edit, Trash2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
}

interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[];
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
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

  const buildCategoryTree = (cats: Category[]): CategoryWithChildren[] => {
    const map: Record<string, CategoryWithChildren> = {};
    const tree: CategoryWithChildren[] = [];
    cats.forEach(cat => map[cat.id] = { ...cat, children: [] });
    cats.forEach(cat => {
      if (cat.parent_id && map[cat.parent_id]) map[cat.parent_id].children.push(map[cat.id]);
      else tree.push(map[cat.id]);
    });
    return tree;
  };

  const flattenCategories = (cats: CategoryWithChildren[], level = 0) => {
    let result: { id: string; name: string; parent_id: string | null; level: number }[] = [];
    cats.forEach(cat => {
      result.push({ id: cat.id, name: cat.name, parent_id: cat.parent_id, level });
      if (cat.children.length > 0) result = result.concat(flattenCategories(cat.children, level + 1));
    });
    return result;
  };

  const handleSave = async () => {
    const name = editingCategory ? editingCategory.name : newCategoryName;
    const parent_id = editingCategory ? editingCategory.parent_id : selectedParentId;
    if (!name.trim()) return;

    if (editingCategory) {
      const { error } = await supabase.from('categories').update({ name, parent_id }).eq('id', editingCategory.id);
      if (!error) setEditingCategory(null);
    } else {
      const { error } = await supabase.from('categories').insert({ name, parent_id });
      if (!error) { 
        setNewCategoryName(''); 
        setSelectedParentId(null); 
      }
    }
    loadCategories();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Excluir esta categoria removerá associação de produtos, mas não excluirá os produtos.')) {
      await supabase.from('categories').delete().eq('id', id);
      loadCategories();
    }
  };

  const categoryTree = buildCategoryTree(categories);
  const rootCategories = categoryTree.filter(c => !c.parent_id);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Package className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Categorias</h1>
          <p className="text-gray-600">Gerencie categorias e subcategorias dos seus produtos</p>
        </div>
      </div>

      {/* Nova Categoria */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="font-semibold mb-4">Nova Categoria / Subcategoria</h3>
        <div className="flex gap-2 flex-wrap items-center">
          <input 
            type="text" 
            value={newCategoryName} 
            onChange={e => setNewCategoryName(e.target.value)} 
            placeholder="Ex: Sedas" 
            className="px-3 py-2 border border-gray-300 rounded-lg flex-1 min-w-[200px]" 
          />
          <select 
            value={selectedParentId || ''} 
            onChange={e => setSelectedParentId(e.target.value || null)} 
            className="border rounded-lg px-2 py-2"
          >
            <option value="">Categoria Raiz</option>
            {rootCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <button 
            onClick={handleSave} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="h-5 w-5" /> Salvar
          </button>
        </div>
      </div>

      {/* Categorias Existentes */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="font-semibold mb-4">Categorias Existentes</h3>
        <ul className="space-y-3">
          {loading ? (
            <p>Carregando...</p>
          ) : (
            rootCategories.map(cat => (
              <li key={cat.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-500" /> {cat.name}
                  </span>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setEditingCategory(cat)} 
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(cat.id)} 
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                {/* Subcategorias */}
                {cat.children.length > 0 && (
                  <ul className="ml-6 mt-2 space-y-1">
                    {cat.children.map(sub => (
                      <li key={sub.id} className="flex justify-between items-center">
                        <span>{sub.name}</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setEditingCategory(sub)} 
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(sub.id)} 
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}