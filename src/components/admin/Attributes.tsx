// Em: src/components/admin/Attributes.tsx - VERSÃO COMPLETA

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';
import { Plus, Trash2,} from 'lucide-react';

// Definindo os tipos para clareza
interface Attribute {
  id: string;
  name: string;
}

interface AttributeOption {
  id: string;
  value: string;
  attribute_id: string;
}

export default function Attributes() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [options, setOptions] = useState<AttributeOption[]>([]);
  const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(null);
  
  const [newAttributeName, setNewAttributeName] = useState('');
  const [newOptionValue, setNewOptionValue] = useState('');
  
  const [loading, setLoading] = useState(true);

  // Função para buscar todos os atributos
  const fetchAttributes = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('attributes').select('*').order('name');
    if (error) {
      toast.error('Erro ao buscar atributos: ' + error.message);
    } else {
      setAttributes(data);
    }
    setLoading(false);
  };

  // Função para buscar as opções de um atributo selecionado
  const fetchOptions = async (attributeId: string) => {
    const { data, error } = await supabase
      .from('attribute_options')
      .select('*')
      .eq('attribute_id', attributeId)
      .order('value');
    if (error) {
      toast.error('Erro ao buscar opções: ' + error.message);
    } else {
      setOptions(data);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  useEffect(() => {
    if (selectedAttribute) {
      fetchOptions(selectedAttribute.id);
    } else {
      setOptions([]); // Limpa as opções se nenhum atributo estiver selecionado
    }
  }, [selectedAttribute]);

  // Funções para manipular Atributos
  const handleAddAttribute = async () => {
    if (!newAttributeName.trim()) return;
    const { error } = await supabase.from('attributes').insert({ name: newAttributeName });
    if (error) {
      toast.error('Erro ao adicionar atributo: ' + error.message);
    } else {
      toast.success('Atributo adicionado!');
      setNewAttributeName('');
      fetchAttributes();
    }
  };

  const handleDeleteAttribute = async (id: string) => {
    if (!window.confirm('Tem certeza? Deletar um atributo também deletará todas as suas opções.')) return;
    const { error } = await supabase.from('attributes').delete().eq('id', id);
    if (error) {
      toast.error('Erro ao deletar atributo: ' + error.message);
    } else {
      toast.success('Atributo deletado!');
      setSelectedAttribute(null);
      fetchAttributes();
    }
  };

  // Funções para manipular Opções
  const handleAddOption = async () => {
    if (!newOptionValue.trim() || !selectedAttribute) return;
    const { error } = await supabase.from('attribute_options').insert({
      value: newOptionValue,
      attribute_id: selectedAttribute.id,
    });
    if (error) {
      toast.error('Erro ao adicionar opção: ' + error.message);
    } else {
      toast.success('Opção adicionada!');
      setNewOptionValue('');
      fetchOptions(selectedAttribute.id);
    }
  };

  const handleDeleteOption = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar esta opção?')) return;
    const { error } = await supabase.from('attribute_options').delete().eq('id', id);
    if (error) {
      toast.error('Erro ao deletar opção: ' + error.message);
    } else {
      toast.success('Opção deletada!');
      if (selectedAttribute) fetchOptions(selectedAttribute.id);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gerenciar Filtros e Atributos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Coluna da Esquerda: Atributos */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Tipos de Filtro (Atributos)</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newAttributeName}
              onChange={(e) => setNewAttributeName(e.target.value)}
              placeholder="Ex: Marca, Tamanho..."
              className="flex-grow px-3 py-2 border rounded-lg"
            />
            <button onClick={handleAddAttribute} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"><Plus /></button>
          </div>
          <ul className="space-y-2">
            {loading ? <p>Carregando...</p> : attributes.map(attr => (
              <li key={attr.id} 
                  onClick={() => setSelectedAttribute(attr)}
                  className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-colors ${selectedAttribute?.id === attr.id ? 'bg-blue-100 border-blue-400 border' : 'hover:bg-gray-50'}`}>
                <span className="font-medium">{attr.name}</span>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteAttribute(attr.id); }} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={18} /></button>
              </li>
            ))}
          </ul>
        </div>

        {/* Coluna da Direita: Opções */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            Opções para: <span className="text-blue-600">{selectedAttribute?.name || 'Selecione um atributo'}</span>
          </h2>
          {selectedAttribute && (
            <>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newOptionValue}
                  onChange={(e) => setNewOptionValue(e.target.value)}
                  placeholder="Ex: Seda, Raw, King Size..."
                  className="flex-grow px-3 py-2 border rounded-lg"
                />
                <button onClick={handleAddOption} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"><Plus /></button>
              </div>
              <ul className="space-y-2">
                {options.map(opt => (
                  <li key={opt.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                    <span>{opt.value}</span>
                    <button onClick={() => handleDeleteOption(opt.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={18} /></button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
