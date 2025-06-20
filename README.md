📝 Listado: Sua Lista de Compras Compartilhada e Inteligente
Bem-vindo(a) ao Listado! Esta é uma aplicação web intuitiva e colaborativa projetada para simplificar a sua experiência de compras. Com o Listado, você pode criar e gerenciar listas de compras de forma eficiente, compartilhá-las com amigos, familiares ou colegas de quarto, e acompanhar os gastos em tempo real. Diga adeus às listas de papel perdidas e às compras duplicadas!

O objetivo principal do Listado é centralizar e otimizar o processo de compras compartilhadas, fornecendo ferramentas para controle de orçamento e visibilidade sobre as atividades na lista.

✨ Funcionalidades Principais
O Listado oferece um conjunto robusto de funcionalidades para tornar suas compras mais organizadas e colaborativas:

Autenticação Segura: Gerencie seu acesso com cadastro e login via e-mail e senha. Seu perfil de usuário também é totalmente gerenciável, permitindo atualizações de informações.
Gerenciamento de Listas de Compras:
Crie quantas listas de compras precisar, atribuindo nomes e descrições detalhadas.
Convide outros usuários para colaborar nas suas listas, seja por e-mail ou link de compartilhamento.
Defina permissões claras para os colaboradores:
Administrador: Pode editar os detalhes da lista, adicionar/remover itens e convidar/remover outros colaboradores.
Colaborador: Pode marcar e desmarcar itens como comprados, mas não tem permissão para alterar a estrutura da lista ou os detalhes dos itens (exceto o status de compra).
Itens da Lista Detalhados:
Adicione itens às suas listas com informações essenciais como nome e quantidade.
Inclua um preço sugerido/máximo para cada item (opcional), ajudando no controle do orçamento.
Marque itens como comprados ou desmarque-os.
Visualize facilmente quem comprou o quê e quando, com registro de data e hora para cada compra.
Organize seus itens com opções de ordenação por nome, status (comprado/não comprado) e preço.
Registro de Gastos e Histórico Abrangente:
Gere relatórios detalhados para cada lista, mostrando o total gasto em itens comprados.
Acompanhe a diferença entre o preço sugerido e o preço real pago, permitindo identificar economias.
Acesse um histórico completo de atividades da lista, incluindo quando e por quem os itens foram comprados, e quais itens foram removidos ou alterados.
Atualizações em Tempo Real (Polling): Mantenha todos os colaboradores sincronizados! Quando um item é marcado como comprado (ou qualquer outra alteração relevante ocorre), a atualização é refletida quase instantaneamente para todos os membros da lista, garantindo que ninguém compre o mesmo item duas vezes.
🏛️ Arquitetura do Projeto
O Listado foi concebido com uma arquitetura monorepo modular, dividindo claramente o frontend e o backend em diretórios separados. Essa abordagem facilita a manutenção, o desenvolvimento independente e o deploy de cada parte da aplicação.

Backend: Responsável pela lógica de negócios, gerenciamento de dados e exposição da API REST.
Frontend: Responsável pela interface do usuário e pela interação com o backend.
.
├── backend/                  # Código do servidor e API
│   ├── src/                  # Código-fonte do backend
│   │   ├── controllers/      # Lógica de negócio (autenticação, listas, itens, etc.)
│   │   ├── routes/           # Definição das rotas da API
│   │   ├── plugins/          # Plugins Fastify (ex: autenticação JWT)
│   │   ├── utils/            # Funções utilitárias (ex: hashing de senha, JWT)
│   │   ├── db.js             # Configuração e instância do Prisma Client
│   │   └── server.js         # Ponto de entrada do servidor Fastify
│   ├── prisma/               # Definição do esquema do banco de dados (Prisma)
│   ├── .env.example          # Exemplo de variáveis de ambiente para o backend
│   ├── package.json          # Metadados e dependências do backend
│   └── package-lock.json     # Gerenciamento de dependências do Node.js
├── frontend/                 # Código da interface do usuário
│   ├── src/                  # Código-fonte do frontend
│   │   ├── app/              # Páginas Next.js (login, dashboard, lista, configurações)
│   │   ├── components/       # Componentes React reutilizáveis
│   │   ├── context/          # Contextos React (ex: autenticação)
│   │   ├── hooks/            # Hooks React customizados
│   │   ├── lib/              # Funções utilitárias e configuração da API
│   │   └── globals.css       # Estilos globais (TailwindCSS)
│   ├── public/               # Arquivos estáticos
│   ├── .env.local.example    # Exemplo de variáveis de ambiente para o frontend
│   ├── next.config.js        # Configuração do Next.js
│   ├── postcss.config.js     # Configuração do PostCSS
│   ├── tailwind.config.js    # Configuração do TailwindCSS
│   ├── package.json          # Metadados e dependências do frontend
│   └── package-lock.json     # Gerenciamento de dependências do Node.js
└── README.md                 # Este arquivo
🚀 Tecnologias Utilizadas
O Listado é construído com tecnologias modernas e eficientes, garantindo desempenho e escalabilidade:

Backend
Node.js: Plataforma de execução JavaScript assíncrona.
Fastify: Framework web rápido e de baixo overhead para Node.js, otimizado para a construção de APIs.
Prisma: ORM (Object-Relational Mapper) de próxima geração, que oferece um Type-Safe para acesso ao banco de dados e migrações.
PostgreSQL: Banco de dados relacional robusto e de código aberto, utilizado para armazenar todos os dados da aplicação.
JWT (JSON Web Tokens): Utilizado para autorização de usuários e autenticação baseada em sessão.


Frontend
Next.js: Framework React para construção de aplicações web modernas, com funcionalidades como Server-Side Rendering (SSR) e Static Site Generation (SSG).
React: Biblioteca JavaScript para a construção de interfaces de usuário reativas e componentizadas.
TailwindCSS: Framework CSS utilitário que permite construir designs personalizados rapidamente, diretamente no HTML/JSX.
Axios: Cliente HTTP baseado em Promises para fazer requisições à API do backend (mencionado no lib/api.js).
🛠️ Pré-requisitos
Antes de iniciar o projeto localmente, certifique-se de ter as seguintes ferramentas instaladas em sua máquina:

Node.js: Versão 18.18 ou superior. Você pode verificar sua versão com node -v. Recomendamos o uso de um gerenciador de versões como nvm (Node Version Manager) para facilitar a troca entre versões do Node.js.
npm (Node Package Manager) ou Yarn: Gerenciador de pacotes para JavaScript. Geralmente vem junto com a instalação do Node.js.
PostgreSQL: Uma instância do banco de dados PostgreSQL.
🚀 Guia de Início Rápido (Desenvolvimento Local)
Siga estas etapas para configurar e executar o Listado em seu ambiente de desenvolvimento local:

1. Clonar o Repositório
Primeiro, clone o repositório do projeto para o seu ambiente local usando Git:

bash
Copiar

git clone <URL_DO_SEU_REPOSITORIO>
cd Listado # Ou o nome da pasta principal do seu projeto
2. Configurar Variáveis de Ambiente
O projeto utiliza arquivos .env para gerenciar variáveis de ambiente, garantindo que informações sensíveis (como credenciais de banco de dados e chaves secretas) não sejam versionadas.

Backend (backend/.env)
Navegue até o diretório backend e crie um arquivo .env baseado no .env.example:

bash
Copiar

cd backend
cp .env.example .env
Edite o arquivo .env e preencha as seguintes variáveis:

DATABASE_URL: A string de conexão para o seu banco de dados PostgreSQL. Exemplo: postgresql://user:password@host:port/database?schema=public
JWT_SECRET: Uma string secreta e complexa para assinar e verificar os JSON Web Tokens. Você pode gerar uma com node -e "console.log(require('crypto').randomBytes(32).toString('hex'))".
FRONTEND_URL: A URL onde o frontend estará rodando (geralmente http://localhost:3000 em desenvolvimento).
Exemplo de backend/.env:

dotenv
Copiar

DATABASE_URL="postgresql://user:password@localhost:5432/listado_db?schema=public"
JWT_SECRET="sua_chave_secreta_super_segura_aqui"
FRONTEND_URL="http://localhost:3000"
PORT=3001 # Opcional: define a porta do backend. Padrão é 3001.
Frontend (frontend/.env.local)
Navegue até o diretório frontend e crie um arquivo .env.local baseado no .env.local.example:

bash
Copiar

cd ../frontend # Se você estiver no diretório 'backend'
cp .env.local.example .env.local
Edite o arquivo .env.local e preencha a seguinte variável:

NEXT_PUBLIC_API_URL: A URL base da sua API backend (geralmente http://localhost:3001/api em desenvolvimento, assumindo que o backend está na porta 3001).
Exemplo de frontend/.env.local:

dotenv
Copiar

NEXT_PUBLIC_API_URL="http://localhost:3001/api"
3. Configurar e Iniciar o Backend
O backend é construído com Node.js, Fastify e Prisma.

Instalar Dependências:
bash
Copiar

cd backend
npm install
Configurar o Banco de Dados (PostgreSQL):
Certifique-se de que sua instância PostgreSQL está rodando.
Crie um banco de dados com o nome especificado em sua DATABASE_URL (ex: listado_db).
Execute as migrações do Prisma para criar as tabelas necessárias no banco de dados:
bash
Copiar

npx prisma migrate dev --name init # 'init' pode ser o nome da sua primeira migração
Este comando criará o esquema do banco de dados definido em prisma/schema.prisma.
Iniciar o Servidor Backend: Em ambiente de desenvolvimento, você pode iniciar o servidor com recarregamento automático (watch mode):
bash
Copiar

npm run dev
Você deverá ver uma mensagem indicando que o servidor está rodando, algo como: Servidor backend rodando em http://0.0.0.0:3001.
4. Configurar e Iniciar o Frontend
O frontend é um projeto Next.js (React) estilizado com TailwindCSS.

Instalar Dependências:
bash
Copiar

cd frontend # Certifique-se de estar no diretório 'frontend'
npm install
Iniciar o Servidor de Desenvolvimento Frontend:
bash
Copiar

npm run dev
Isso iniciará o servidor de desenvolvimento do Next.js. Você deverá ver uma mensagem indicando que o servidor está pronto, geralmente em http://localhost:3000.
5. Acessar a Aplicação
Com ambos o backend e o frontend rodando, você pode acessar a aplicação no seu navegador:

localhost

Você será direcionado(a) para a página de Login/Cadastro para começar a usar o Listado!

🔗 Endpoints da API (Backend)
Para referência, a API do backend está organizada sob os seguintes prefixos:

Autenticação: /api/auth (para cadastro, login, perfil do usuário)
Listas: /api/lists (para criar, listar, obter, atualizar e deletar listas)
Itens: /api/items (para adicionar, atualizar e deletar itens dentro de uma lista)
Colaborações: /api/collaborations (para convidar, remover e gerenciar papéis de colaboradores em listas)
Relatórios: /api/reports (para gerar relatórios de gastos e históricos de listas)
📊 Estrutura do Banco de Dados (Modelos Prisma)
O banco de dados PostgreSQL utiliza os seguintes modelos principais, definidos via Prisma:

User: Armazena informações dos usuários (nome, e-mail, senha hashed).
List: Representa uma lista de compras, com um proprietário e a capacidade de ter itens e colaboradores.
Item: Detalhes de cada item dentro de uma lista (nome, quantidade, preços, status de compra, notas, categoria, prioridade, soft delete).
Collaboration: Gerencia os usuários que colaboram em uma lista e seus respectivos papéis (admin ou collaborator).
Notification: Para futuras implementações de notificações, permitindo informar usuários sobre atividades relevantes nas listas.
🤝 Contribuição
Sinta-se à vontade para explorar o código, reportar bugs ou sugerir melhorias. Este é um projeto em constante evolução e toda a contribuição é bem-vinda!

📜 Licença
Este projeto está licenciado sob a licença ISC.