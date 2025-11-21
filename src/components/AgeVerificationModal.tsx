// Local do arquivo: src/components/AgeVerificationModal.tsx

import { useState } from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';

// Definimos que este componente receberá duas funções de fora: onConfirm e onReject
interface AgeVerificationModalProps {
  onConfirm: () => void;
  onReject: () => void;
}

export default function AgeVerificationModal({ onConfirm, onReject }: AgeVerificationModalProps) {
  // Este estado 'agreed' só existe aqui dentro para habilitar/desabilitar o botão de confirmação
  const [agreed, setAgreed] = useState(false);

  return (
    // Estrutura do Modal com Tailwind CSS
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-xl max-w-md w-full p-8 relative shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="bg-red-100 p-4 rounded-full mb-4">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verificação de Idade
          </h2>

          <p className="text-gray-600 mb-6">
            Este site contém produtos destinados a maiores de 18 anos.
          </p>

          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6 w-full">
            <p className="text-sm text-yellow-900 font-medium">
              ⚠️ Você confirma que tem 18 anos ou mais?
            </p>
          </div>

          <label className="flex items-start gap-3 mb-6 cursor-pointer w-full text-left">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 rounded"
            />
            <span className="text-sm text-gray-700">
              Declaro que tenho 18 anos ou mais e concordo em acessar este conteúdo.
            </span>
          </label>

          <div className="flex gap-3 w-full">
            <button
              onClick={onReject} // Quando clicado, chama a função onReject que veio de fora
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              <X className="h-5 w-5" />
              Sou menor de 18
            </button>
            <button
              onClick={onConfirm} // Quando clicado, chama a função onConfirm que veio de fora
              disabled={!agreed} // O botão só funciona se o checkbox 'agreed' estiver marcado
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Check className="h-5 w-5" />
              Tenho +18 anos
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Ao confirmar, você declara ter a idade legal necessária para acessar este conteúdo.
          </p>
        </div>
      </div>
    </div>
  );
}
