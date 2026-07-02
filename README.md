# Programatical 🚀

> **Plataforma Educacional Interativa e Gamificada para Ensino de Programação**
>
> Este projeto foi desenvolvido como **Trabalho de Conclusão de Curso (TCC)** para obter o título de graduação no curso de tecnologia.

---

## 📋 Sobre o Projeto

O **Programatical** é uma plataforma web interativa projetada para revolucionar o ensino de conceitos de programação e engenharia de software. Utilizando metodologias de gamificação e aprendizado dinâmico, o sistema visa engajar os estudantes e consolidar conhecimentos teóricos de forma prática e gratuita.

Os tópicos abordados incluem conceitos essenciais do desenvolvimento moderno:
*   🌀 **Scrum e Metodologias Ágeis**
*   🏗️ **Arquitetura de Software**
*   🛡️ **Princípios SOLID**
*   🗺️ **Domain-Driven Design (DDD)**
*   🌿 **Git e Fluxos de Trabalho**

---

## ✨ Funcionalidades Principais

### 🎓 Área do Aluno
*   **Dashboard Personalizado:** Interface centralizada exibindo os cursos em andamento (com progresso) e cursos disponíveis para novas inscrições.
*   **Aulas em Etapas Interativas:** Cada lição é estruturada em etapas dinâmicas:
    *   **Etapas de Leitura:** Conteúdo teórico exposto de forma clara e adaptada.
    *   **Perguntas de Múltipla Escolha:** Desafios com feedback em tempo real para fixação teórica.
    *   **Desafios de Ordenação/Associação:** Exercícios interativos onde o estudante clica e ordena palavras para responder aos enunciados.
*   **Pontuação e Gamificação:** O progresso do aluno nas aulas rende pontos que contam para o placar de classificação.
*   **Ranking em Tempo Real:** Tabela de classificação competitiva exibindo os melhores desempenhos, com filtros para classificação geral ("Todos os tempos") e semanal ("7 dias").
*   **Perfil do Usuário:** Gerenciamento das informações do estudante logado.

### 🛠️ Painel Administrativo (Professor/Administrador)
*   **Gerenciador de Conteúdo:** Ferramenta dedicada para criação, edição e exclusão de Cursos, Módulos, Aulas e suas respectivas Etapas (Questões, Textos).
*   **Formulários de Cadastro Dinâmicos:** Validação inteligente utilizando Zod e React Hook Form para cadastro de novos materiais didáticos de forma segura.

---

## 🛠️ Tecnologias Utilizadas

A stack de tecnologia selecionada prioriza a interatividade, performance e agilidade no desenvolvimento:

*   **Core:** [Next.js 14](https://nextjs.org/) (App Router), [React 18](https://react.dev/) e [TypeScript](https://www.typescriptlang.org/)
*   **Estilização:** [TailwindCSS](https://tailwindcss.com/)
*   **Banco de Dados & Autenticação:** [Firebase SDK](https://firebase.google.com/) (Firestore para persistência NoSQL e Firebase Auth para autenticação de alunos e administradores)
*   **Animações:** [Framer Motion](https://www.framer.com/motion/) (para transições dinâmicas de interface e feedback de respostas)
*   **Componentes de UI:** [Ant Design](https://ant.design/) (Pro Components) e primitivos da [Radix UI](https://www.radix-ui.com/)
*   **Validação de Dados:** [Zod](https://zod.dev/) e [React Hook Form](https://react-hook-form.com/)

---

## 📂 Estrutura do Projeto

Abaixo está descrita a organização de diretórios do projeto:

```text
programatical/
├── app/                     # Páginas e rotas da aplicação (Next.js App Router)
│   ├── about-us/            # Informações sobre a plataforma e criadores
│   ├── administrationpage/  # Interface do painel administrativo
│   ├── coursepage/          # Tela interativa do curso, módulos e lições
│   ├── initialpage/         # Dashboard do aluno (cursos e ranking)
│   ├── login/               # Tela de acesso
│   ├── register/            # Cadastro de novos alunos
│   ├── userprofile/         # Perfil do aluno
│   ├── globals.css          # Estilos globais e tokens do TailwindCSS
│   └── layout.tsx           # Layout base com provedores de tema e sessão
├── components/              # Componentes de interface do usuário (UI)
│   ├── ui/                  # Componentes reutilizáveis menores (Botões, inputs, etc.)
│   ├── AvailableCourses.tsx # Carousel de novos cursos
│   ├── Etapas.tsx           # Renderizadores das etapas de aula (Texto, Quiz, Ordenação)
│   ├── OngoingCourses.tsx   # Cursos em andamento do usuário
│   └── Ranking.tsx          # Tabela de classificação com filtros de tempo
├── hooks/                   # Hooks React personalizados para lógica compartilhada
├── lib/
│   └── firebase/            # Funções de comunicação CRUD com o Firestore (courses, ranking, users)
├── types/                   # Interfaces TypeScript que descrevem o modelo de domínio do sistema
└── firebase.config.ts       # Inicialização e exportação dos serviços do Firebase
```

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
Certifique-se de possuir em seu ambiente:
*   [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
*   Gerenciador de pacotes `yarn` ou `npm`

### Passos para Instalação

1.  **Clonar o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/programatical.git
    cd programatical
    ```

2.  **Instalar dependências:**
    ```bash
    yarn install
    # ou
    npm install
    ```

3.  **Configuração do Firebase:**
    O projeto já vem configurado com uma instância padrão de teste no arquivo `firebase.config.ts`. Para conectar o projeto ao seu próprio banco de dados Firebase:
    *   Crie um projeto no console do Firebase.
    *   Ative o **Authentication** (e-mail/senha) e o **Cloud Firestore**.
    *   Substitua as credenciais no arquivo `firebase.config.ts` ou configure variáveis de ambiente.

4.  **Iniciar servidor de desenvolvimento:**
    ```bash
    yarn dev
    # ou
    npm run dev
    ```

5.  **Acessar a aplicação:**
    Abra o seu navegador e vá para [http://localhost:3000](http://localhost:3000).

---

## 🎓 Informações do TCC (Ajuste conforme necessário)

Substitua as informações abaixo com os dados oficiais de apresentação do projeto:

*   **Instituição:** [Nome da sua Universidade ou Faculdade]
*   **Curso:** [Nome do seu Curso, ex: Análise e Desenvolvimento de Sistemas / Ciência da Computação]
*   **Autores:**
    *   [Seu Nome Completo] - [Seu E-mail / LinkedIn]
    *   [Nome do Integrante 2] - [E-mail / LinkedIn]
*   **Orientador(a):** [Nome do Orientador]
*   **Ano:** 2026
