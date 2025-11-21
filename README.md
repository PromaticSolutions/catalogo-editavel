# 🚀 Catálogo Editável - Solução E-commerce Headless

![Capa do Projeto](https://i.imgur.com/v8tXw4k.png )

Este projeto, desenvolvido pela **Promatic Solutions**, é uma solução de catálogo online moderna e de alta performance, construída com uma arquitetura *headless* que separa o frontend da gestão de dados, garantindo flexibilidade, segurança e uma experiência de usuário excepcional.

A plataforma permite que o administrador gerencie produtos, estoque, vendas e a identidade visual do catálogo (cores, logo, mensagens) através de um painel administrativo seguro, com todas as alterações refletidas em tempo real para os clientes.

**Visite a demonstração ao vivo:** [**https://www.itenshanun.shop**](https://www.itenshanun.shop )

---

## ✨ Funcionalidades Principais

-   **🎨 Painel de Administração Completo:** Interface intuitiva para gerenciamento de:
    -   **Produtos:** Cadastro, edição, ativação/desativação.
    -   **Estoque:** Controle de quantidade de itens.
    -   **Vendas:** Visualização de pedidos realizados.
    -   **Estilização:** Personalização em tempo real da identidade visual do site (cores, logo, nome da empresa).
-   **⚡ Atualizações em Tempo Real:** Graças ao **Supabase Realtime**, qualquer alteração feita no painel (como mudança de cor ou adição de produto) é refletida instantaneamente para todos os usuários, sem a necessidade de recarregar a página.
-   **🔐 Autenticação Segura:** Sistema de login para o painel administrativo baseado em provedores OAuth (como GitHub) ou e-mail/senha, gerenciado pelo sistema de autenticação do Supabase.
-   **🔞 Verificação de Idade:** Modal de verificação (+18) na entrada do site para controle de acesso a conteúdo restrito.
-   **📱 Design Responsivo:** Interface totalmente adaptável para uma experiência perfeita em desktops, tablets e smartphones.

---

## 🛠️ Stack Tecnológica

Este projeto utiliza um conjunto de tecnologias modernas para garantir performance e escalabilidade:

| Categoria          | Tecnologia                                                                                             | Descrição                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| **Frontend**       | ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white )                          | Biblioteca principal para a construção da interface de usuário reativa e componentizada.                |
| **Framework**      | ![Vite](https://img.shields.io/badge/-Vite-646CFF?logo=vite&logoColor=white )                              | Ferramenta de build extremamente rápida que oferece uma experiência de desenvolvimento otimizada.       |
| **Estilização**    | ![Tailwind CSS](https://img.shields.io/badge/-Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white )       | Framework CSS utility-first para a criação de designs customizados de forma rápida e eficiente.       |
| **Backend (BaaS)** | ![Supabase](https://img.shields.io/badge/-Supabase-3ECF8E?logo=supabase&logoColor=white )                  | Plataforma open-source que serve como nosso backend completo, provendo:                                 |
| &nbsp;             | &nbsp;&nbsp;&nbsp;**Banco de Dados PostgreSQL**                                                          | Banco de dados relacional robusto e escalável.                                                          |
| &nbsp;             | &nbsp;&nbsp;&nbsp;**Autenticação**                                                                       | Gerenciamento de usuários e segurança de acesso.                                                        |
| &nbsp;             | &nbsp;&nbsp;&nbsp;**APIs Instantâneas**                                                                  | Geração automática de APIs RESTful e GraphQL.                                                           |
| &nbsp;             | &nbsp;&nbsp;&nbsp;**Realtime Subscriptions**                                                             | Funcionalidade que permite ouvir mudanças no banco de dados em tempo real.                              |
| **Hospedagem**     | ![Vercel](https://img.shields.io/badge/-Vercel-000000?logo=vercel&logoColor=white )                        | Plataforma de deploy otimizada para frameworks de frontend, com integração contínua (CI/CD) e alta performance. |
| **Linguagem**      | ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white )            | Superset do JavaScript que adiciona tipagem estática, aumentando a robustez e a manutenibilidade do código. |

---

## 🚀 Como Executar o Projeto Localmente

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/PromaticSolutions/catalogo-editavel.git
    cd catalogo-editavel
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    -   Crie um arquivo `.env` na raiz do projeto.
    -   Adicione as chaves do seu próprio projeto Supabase (você pode criar um gratuitamente em [supabase.com](https://supabase.com/ )):
        ```
        VITE_SUPABASE_URL=https://SUA_URL_DO_PROJETO.supabase.co
        VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_PUBLIC
        ```

4.  **Execute o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

5.  Abra [http://localhost:5173](http://localhost:5173 ) no seu navegador para ver o resultado.

---

## 🏢 Sobre a Promatic Solutions

A **Promatic Solutions** é especializada no desenvolvimento de soluções digitais de alta qualidade, utilizando as tecnologias mais avançadas do mercado para criar produtos robustos, escaláveis e com foco na melhor experiência para o usuário.

Este projeto de catálogo é um exemplo do nosso compromisso com a excelência técnica e a entrega de valor para nossos clientes.

---

*Desenvolvido com ❤️ pela Promatic Solutions.*
