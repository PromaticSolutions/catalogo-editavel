// src/components/admin/Styling.tsx - VERSÃO DE DEPURAÇÃO

import { useEffect, useState } from 'react';
import { Palette, Save } from 'lucide-react';
import { supabase, SiteSettings } from '../../lib/supabase'; // Verifique o caminho do import

export default function Styling() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [formData, setFormData] = useState({
    company_name: '',
    logo_url: '',
    welcome_message: '',
    pix_key: '',
    primary_color: '#2563eb',
    secondary_color: '#1e40af',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('Aguardando ação...');

  // --- CÓDIGO DE DEPURAÇÃO ---
  console.log("URL do Supabase que o código está usando:", supabase.rest.url);
  // -------------------------

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setSaveMessage('Carregando configurações...');
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .maybeSingle();

    if (error) {
      setSaveMessage(`Erro ao carregar: ${error.message}`);
      console.error("Erro no loadSettings:", error);
    } else if (data) {
      setSettings(data);
      setFormData({
        company_name: data.company_name,
        logo_url: data.logo_url,
        welcome_message: data.welcome_message,
        pix_key: data.pix_key,
        primary_color: data.primary_color,
        secondary_color: data.secondary_color,
      });
      setSaveMessage('Configurações carregadas. Pronto para editar.');
    } else {
      setSaveMessage('Nenhuma configuração encontrada no banco de dados. Clicar em salvar irá criar uma nova.');
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage('Tentando salvar...');

    // --- CÓDIGO DE DEPURAÇÃO ---
    console.log("Dados a serem salvos:", formData);
    console.log("O 'settings' atual tem um ID?", settings?.id);
    // -------------------------

    // Lógica de update ou insert
    if (settings && settings.id) {
      // --- TENTATIVA DE UPDATE ---
      console.log(`Tentando dar UPDATE na linha com ID: ${settings.id}`);
      const { data, error } = await supabase
        .from('site_settings')
        .update(formData)
        .eq('id', settings.id)
        .select(); // Adicionamos .select() para obter uma resposta

      if (error) {
        setSaveMessage(`ERRO NO UPDATE: ${error.message}`);
        console.error("Erro detalhado do UPDATE:", error);
      } else {
        setSaveMessage('SUCESSO! Configurações atualizadas.');
        console.log("Resposta do Supabase ao UPDATE:", data);
        loadSettings(); // Recarrega para confirmar
      }
    } else {
      // --- TENTATIVA DE INSERT ---
      console.log("Nenhum ID encontrado, tentando dar INSERT de uma nova linha.");
      const { data, error } = await supabase
        .from('site_settings')
        .insert(formData)
        .select(); // Adicionamos .select() para obter uma resposta

      if (error) {
        setSaveMessage(`ERRO NO INSERT: ${error.message}`);
        console.error("Erro detalhado do INSERT:", error);
      } else {
        setSaveMessage('SUCESSO! Configurações criadas.');
        console.log("Resposta do Supabase ao INSERT:", data);
        loadSettings(); // Recarrega para confirmar
      }
    }

    setSaving(false);
    setTimeout(() => setSaveMessage(''), 5000); // Aumentei o tempo para dar pra ler
  };

  // O resto do seu JSX (return) continua o mesmo...
  // A única mudança é que o 'saveMessage' agora é mais detalhado.
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Estilização</h2>
        <p className="text-gray-600">Personalize a aparência do seu catálogo online</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ... todo o seu formulário ... */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Informações da Empresa</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Empresa
              </label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL do Logo
              </label>
              <input
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://exemplo.com/logo.png"
              />
              {formData.logo_url && (
                <div className="mt-2">
                  <img
                    src={formData.logo_url}
                    alt="Preview do logo"
                    className="h-16 w-16 object-contain border border-gray-200 rounded"
                    onError={(e ) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensagem de Boas-vindas
              </label>
              <textarea
                value={formData.welcome_message}
                onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações de Pagamento</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chave PIX
            </label>
            <input
              type="text"
              value={formData.pix_key}
              onChange={(e) => setFormData({ ...formData, pix_key: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="seu-email@exemplo.com ou chave aleatória"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Informe sua chave PIX (email, telefone, CPF/CNPJ ou chave aleatória)
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cores do Site</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor Primária
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="h-12 w-20 rounded cursor-pointer border border-gray-300"
                />
                <input
                  type="text"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="#2563eb"
                />
              </div>
              <div
                className="mt-3 p-4 rounded-lg text-white font-medium text-center"
                style={{ backgroundColor: formData.primary_color }}
              >
                Preview Cor Primária
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor Secundária
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  className="h-12 w-20 rounded cursor-pointer border border-gray-300"
                />
                <input
                  type="text"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="#1e40af"
                />
              </div>
              <div
                className="mt-3 p-4 rounded-lg text-white font-medium text-center"
                style={{ backgroundColor: formData.secondary_color }}
              >
                Preview Cor Secundária
              </div>
            </div>
          </div>
        </div>

        {saveMessage && (
          <div
            className={`p-4 rounded-lg ${
              saveMessage.includes('SUCESSO')
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {saveMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Save className="h-5 w-5" />
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </form>
    </div>
  );
}
