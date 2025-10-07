// src/components/PixModal.tsx - MODO DE DIAGNÓSTICO SIMPLES

import { X } from 'lucide-react';

interface PixModalProps {
  onClose: () => void;
}

export default function PixModal({ onClose }: PixModalProps) {
  // Lê as variáveis de ambiente diretamente aqui.
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-8 relative font-mono text-sm">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="h-6 w-6" />
        </button>
        
        <h2 className="text-xl font-bold text-red-600 mb-4">-- DIAGNÓSTICO DE VARIÁVEIS --</h2>
        
        <div className="space-y-4">
          <div>
            <p className="font-bold">VITE_SUPABASE_URL:</p>
            <div className="bg-gray-100 p-2 rounded mt-1 break-all">
              {supabaseUrl || "NÃO ENCONTRADA"}
            </div>
          </div>
          
          <div>
            <p className="font-bold">VITE_SUPABASE_ANON_KEY:</p>
            <div className="bg-gray-100 p-2 rounded mt-1 break-all">
              {supabaseAnonKey || "NÃO ENCONTRADA"}
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <p className="text-xs text-gray-600">
            Se algum campo mostrar "NÃO ENCONTRADA", o problema está na configuração das variáveis de ambiente na Vercel.
          </p>
        </div>
      </div>
    </div>
  );
}
