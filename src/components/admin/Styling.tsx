// src/components/admin/Styling.tsx - VERSÃO MODIFICADA POR MANUS

import { useEffect, useState } from 'react';
import { Palette, Save } from 'lucide-react';
import { supabase, SiteSettings } from '../../lib/supabase'; // Verifique o caminho

export default function Styling() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  
  // --- 1. MODIFICAÇÃO: Adicionar 'ativar_pix' ao estado do formulário ---
  const [formData, setFormData] = useState({
    company_name: '',
    logo_url: '',
    welcome_message: '',
    pix_key: '',
    primary_color: '#2563eb',
    secondary_color: '#1e40af',
    ativar_pix: true, // Adicionado o novo campo com valor padrão 'true'
  });

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .maybeSingle();

    if (error) {
      console.error("Erro ao carregar configurações:", error);
      setSaveMessage(`Erro ao carregar: ${error.message}`);
    } else if (data) {
      setSettings(data);
      // --- 2. MODIFICAÇÃO: Carregar o valor de 'ativar_pix' do Supabase ---
      setFormData({
        company_name: data.company_name,
        logo_url: data.logo_url,
        welcome_message: data.welcome_message,
        pix_key: data.pix_key,
        primary_color: data.primary_color,
        secondary_color: data.secondary_color,
        // Garantimos que o valor seja booleano (true/false)
        ativar_pix: data.ativar_pix === true, 
      });
    }
  };

  // --- 3. MODIFICAÇÃO: Criar uma função para lidar com a mudança do seletor ---
  // Isso evita bugs com o tipo do valor (string vs booleano)
  const handleAtivarPixChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, ativar_pix: e.target.value === '1' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage('');

    // O 'formData' já contém o 'ativar_pix' e será salvo automaticamente
    if (settings && settings.id) {
      const { error } = await supabase
        .from('site_settings')
        .update(formData)
        .eq('id', settings.id);

      if (!error) {
        setSaveMessage('Configurações salvas com sucesso!');
        loadSettings();
      } else {
        setSaveMessage(`Erro ao salvar: ${error.message}`);
        console.error("Erro no update:", error);
      }
    } else {
      const { error } = await supabase.from('site_settings').insert(formData);
      if (!error) {
        setSaveMessage('Configurações criadas com sucesso!');
        loadSettings();
      } else {
        setSaveMessage(`Erro ao criar: ${error.message}`);
        console.error("Erro no insert:", error);
      }
    }

    setSaving(false);
    setTimeout(() => setSaveMessage(''), 5000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Estilização</h2>
        <p className="text-gray-600">Personalize a aparência do seu catálogo online</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ... (outros campos do formulário - sem alterações) ... */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Informações da Empresa</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
              <input type="text" value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL do Logo</label>
              <input type="url" value={formData.logo_url} onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="https://exemplo.com/logo.png" />
              {formData.logo_url && <div className="mt-2"><img src={formData.logo_url} alt="Preview do logo" className="h-16 w-16 object-contain border border-gray-200 rounded" onError={(e  ) => { (e.target as HTMLImageElement).style.display = 'none'; }} /></div>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem de Boas-vindas</label>
              <textarea value={formData.welcome_message} onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows={3} required />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações de Pagamento</h3>
          <div className="space-y-4"> {/* Adicionado para espaçamento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chave PIX</label>
              <input type="text" value={formData.pix_key} onChange={(e) => setFormData({ ...formData, pix_key: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="seu-email@exemplo.com ou chave aleatória" required />
              <p className="mt-1 text-xs text-gray-500">Informe sua chave PIX (email, telefone, CPF/CNPJ ou chave aleatória)</p>
            </div>

            {/* --- 4. MODIFICAÇÃO: Adicionar o seletor para Ativar/Desativar o Pix --- */}
            <div>
              <label htmlFor="ativar_pix" className="block text-sm font-medium text-gray-700 mb-1">Pagamento via Pix</label>
              <select
                id="ativar_pix"
                name="ativar_pix"
                value={formData.ativar_pix ? '1' : '0'}
                onChange={handleAtivarPixChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1">Ativado</option>
                <option value="0">Desativado</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">Se desativado, o QR Code do Pix não aparecerá para o cliente.</p>
            </div>
            {/* --- FIM DA MODIFICAÇÃO --- */}

          </div>
        </div>

        {/* ... (resto do formulário - sem alterações) ... */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cores do Site</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cor Primária</label>
              <div className="flex gap-3 items-center">
                <input type="color" value={formData.primary_color} onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })} className="h-12 w-20 rounded cursor-pointer border border-gray-300" />
                <input type="text" value={formData.primary_color} onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="#2563eb" />
              </div>
              <div className="mt-3 p-4 rounded-lg text-white font-medium text-center" style={{ backgroundColor: formData.primary_color }}>Preview Cor Primária</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cor Secundária</label>
              <div className="flex gap-3 items-center">
                <input type="color" value={formData.secondary_color} onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })} className="h-12 w-20 rounded cursor-pointer border border-gray-300" />
                <input type="text" value={formData.secondary_color} onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="#1e40af" />
              </div>
              <div className="mt-3 p-4 rounded-lg text-white font-medium text-center" style={{ backgroundColor: formData.secondary_color }}>Preview Cor Secundária</div>
            </div>
          </div>
        </div>

        {saveMessage && (
          <div className={`p-4 rounded-lg ${saveMessage.includes('sucesso') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {saveMessage}
          </div>
        )}

        <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          <Save className="h-5 w-5" />
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </form>
    </div>
  );
}
