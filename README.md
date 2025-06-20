
# 📝 Listado: Sua Lista de Compras Compartilhada e Inteligente

Bem-vindo(a) ao **Listado**! Uma aplicação web intuitiva e colaborativa projetada para simplificar sua experiência de compras.

Com o Listado, você pode:

- Criar e gerenciar listas de compras
- Compartilhá-las com amigos, familiares ou colegas
- Acompanhar os gastos em tempo real

---

## 🎯 Objetivo

Centralizar e otimizar o processo de compras compartilhadas com ferramentas para controle de orçamento e visibilidade sobre atividades nas listas.

---

## ✨ Funcionalidades Principais

- **Autenticação Segura**
  - Cadastro e login via e-mail/senha
  - Perfil de usuário gerenciável

- **Gerenciamento de Listas**
  - Criação de múltiplas listas com nome/descrição
  - Convite de colaboradores via e-mail ou link
  - Permissões: `Administrador` (controle total), `Colaborador` (marcar itens)

- **Itens Detalhados**
  - Nome, quantidade e preço sugerido/máximo
  - Marcar/desmarcar como comprados
  - Histórico de quem comprou e quando
  - Ordenação por nome, status e preço

- **Registro de Gastos e Histórico**
  - Relatórios de total gasto
  - Diferença entre preço sugerido e pago
  - Histórico completo de alterações

- **Atualizações em Tempo Real (Polling)**
  - Sincronização imediata entre todos os colaboradores

---

## 🏛️ Arquitetura do Projeto

Estrutura modular em **monorepo**, com separação de frontend e backend.

```
.
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── plugins/
│   │   ├── utils/
│   │   ├── db.js
│   │   └── server.js
│   ├── prisma/
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── globals.css
│   ├── public/
│   ├── .env.local.example
│   ├── next.config.js
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── package-lock.json
└── README.md
```

---

## 🚀 Tecnologias Utilizadas

### Backend

- **Node.js**
- **Fastify**
- **Prisma**
- **PostgreSQL**
- **JWT (JSON Web Tokens)**

### Frontend

- **Next.js**
- **React**
- **TailwindCSS**
- **Axios**

---

## 🛠️ Pré-requisitos

- **Node.js** v18.18+
- **npm** ou **Yarn**
- **PostgreSQL**

---

## 🚀 Guia de Início Rápido

### 1. Clonar o repositório

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd Listado
```

### 2. Configurar variáveis de ambiente

#### Backend

```bash
cd backend
cp .env.example .env
```

Preencha:

```dotenv
DATABASE_URL="postgresql://user:password@localhost:5432/listado_db?schema=public"
JWT_SECRET="sua_chave_secreta"
FRONTEND_URL="http://localhost:3000"
PORT=3001
```

#### Frontend

```bash
cd ../frontend
cp .env.local.example .env.local
```

```dotenv
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

### 3. Instalar dependências

#### Backend

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run dev
```

#### Frontend

```bash
cd ../frontend
npm install
npm run dev
```

### 4. Acessar a aplicação

Abra no navegador:

```
http://localhost:3000
```

---

## 🔗 Endpoints da API

- **Autenticação**: `/api/auth`
- **Listas**: `/api/lists`
- **Itens**: `/api/items`
- **Colaborações**: `/api/collaborations`
- **Relatórios**: `/api/reports`

---

## 📊 Modelos de Banco de Dados (Prisma)

- **User**
- **List**
- **Item**
- **Collaboration**
- **Notification** 

---

## 🤝 Contribuição

Contribuições são bem-vindas! Reporte bugs ou envie melhorias.

---

## 📜 Licença

Este projeto está licenciado sob a **ISC License**.
