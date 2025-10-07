// src/components/LoginTest.tsx

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- ATENÇÃO: VAMOS COLOCAR AS CHAVES DIRETAMENTE AQUI PARA O TESTE ---
// Pegue estes valores do painel da Vercel (Environment Variables)
const TEST_URL = "https://rmwmydcevmxogklejcrj.supabase.co";
const TEST_KEY = "COLE_SUA_CHAVE_ANON_PUBLIC_AQUI"; // A chave longa que começa com "ey..."

// Criamos um cliente Supabase SÓ PARA ESTE TESTE
const testSupabase = createClient(TEST_URL, TEST_KEY );

export default function LoginTest() {
  const [email, setEmail] = useState('hanun@admin.com'); // Já preenchido
  const [password, setPassword] = useState('admin@2025'); // Já preenchido
  const [message, setMessage] = useState('Aguardando teste...');

  const handleTestLogin = async () => {
    setMessage('Tentando fazer login...');

    const { data, error } = await testSupabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setMessage(`FALHA NO LOGIN! Erro: ${error.message}`);
      console.error("Erro detalhado do Supabase:", error);
    } else {
      setMessage(`SUCESSO! Login funcionou. ID do usuário: ${data.user.id}`);
      console.log("Dados da sessão:", data.session);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', border: '2px solid #333', margin: '40px' }}>
      <h1>Página de Teste de Login</h1>
      <p>Esta página testa a conexão com o Supabase da forma mais simples possível.</p>
      
      <div>
        <label>Email: </label>
        <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} style={{ border: '1px solid #ccc', padding: '8px', width: '300px' }} />
      </div>
      <div style={{ marginTop: '10px' }}>
        <label>Senha: </label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ border: '1px solid #ccc', padding: '8px', width: '300px' }} />
      </div>

      <button onClick={handleTestLogin} style={{ padding: '10px 20px', fontSize: '16px', marginTop: '20px', cursor: 'pointer' }}>
        Testar Login
      </button>

      <hr style={{ margin: '20px 0' }} />

      <h2>Resultado:</h2>
      <pre style={{ backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '5px', color: message.includes('FALHA') ? 'red' : 'green' }}>
        {message}
      </pre>
    </div>
  );
}
