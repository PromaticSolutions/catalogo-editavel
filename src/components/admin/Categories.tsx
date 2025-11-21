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

    cats.forEach(cat => {
      map[cat.id] = { ...cat, children: [] };
    });

    cats.forEach(cat => {
      if (cat.parent_id && map[cat.parent_id]) {
        map[cat.parent_id].children.push(map[cat.id]);
      } else {
        tree.push(map[cat.id]);
      }
    });

    return tree;
  };

  const flattenCategories = (cats: CategoryWithChildren[], level = 0): { id: string; name: string; parent_id: string | null; level: number }[] => {
    let result: { id: string; name: string; parent_id: string | null; level: number }[] = [];
    cats.forEach(cat => {
      result.push({ id: cat.id, name: cat.name, parent_id: cat.parent_id, level });
      if (cat.children.length > 0) {
        result = result.concat(flattenCategories(cat.children, level + 1));
      }
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
    if (confirm('Tem certeza? Excluir uma categoria removerá a associação de todos os produtos, mas não excluirá os produtos.')) {
      await supabase.from('categories').delete().eq('id', id);
      loadCategories();
    }
  };

  const categoryTree = buildCategoryTree(categories);
  const flatCategories = flattenCategories(categoryTree);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Package className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Categorias</h1>
          <p className="text-gray-600">Gerencie as categorias e subcategorias dos seus produtos</p>
        </div>
      </div>

      {/* Nova Categoria */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="font-semibold mb-4">Nova Categoria</h3>
        <div className="flex gap-2 flex-wrap items-center">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Ex: Sedas"
            className="px-3 py-2 border border-gray-300 rounded-lg flex-1 min-w-[200px]"
          />
          <select
            value={selectedParentId || ''}
            onChange={(e) => setSelectedParentId(e.target.value || null)}
            className="border rounded-lg px-2 py-2"
          >
            <option value="">Nenhuma (Categoria Raiz)</option>
            {flatCategories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {'→ '.repeat(cat.level) + cat.name}
              </option>
            ))}
          </select>
          <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
            <Plus className="h-5 w-5" /> Salvar
          </button>
        </div>
      </div>

      {/* Categorias Existentes */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="font-semibold mb-4">Categorias Existentes</h3>
        <ul className="space-y-3">
          {loading ? <p>Carregando...</p> : flatCategories.map(cat => (
            <li key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              {editingCategory?.id === cat.id ? (
                <div className="flex gap-2 items-center flex-1">
                  <input
                    type="text"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    className="px-2 py-1 border border-gray-300 rounded-md flex-1"
                  />
                  <select
                    value={editingCategory.parent_id || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, parent_id: e.target.value || null })}
                    className="border rounded-lg px-2 py-1"
                  >
                    <option value="">Nenhuma (Categoria Raiz)</option>
                    {flatCategories.filter(c => c.id !== cat.id).map(c => (
                      <option key={c.id} value={c.id}>
                        {'→ '.repeat(c.level) + c.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <span className="flex items-center gap-2 flex-1">
                  <Package className="h-4 w-4 text-gray-500" />
                  {'→ '.repeat(cat.level) + cat.name}
                </span>
              )}
              <div className="flex gap-3">
                {editingCategory?.id === cat.id ? (
                  <button onClick={handleSave} className="text-green-600 hover:text-green-800">Salvar</button>
                ) : (
                  <button onClick={() => setEditingCategory(cat)} className="text-blue-600 hover:text-blue-800">
                    <Edit className="h-5 w-5" />
                  </button>
                )}
                <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-800">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}