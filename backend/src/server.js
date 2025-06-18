const fastify = require('fastify');
const dotenv = require('dotenv');
const cors = require('@fastify/cors'); 

const prisma = require('./db');

// Importa as rotas
const authRoutes = require('./routes/authRoutes');
const listRoutes = require('./routes/listRoutes');
const itemRoutes = require('./routes/itemRoutes');
const collaborationRoutes = require('./routes/collaborationRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Importa o plugin de autenticação JWT personalizado
const jwtAuthPlugin = require('./plugins/auth');

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Cria a instância do servidor Fastify
const app = fastify({
  logger: true // Habilita logs para depuração
});

// Configura o plugin CORS para permitir requisições do frontend
app.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Use a variável de ambiente ou fallback
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Métodos HTTP permitidos
  credentials: true // Permite o envio de cookies (se aplicável)
});

app.decorate('prisma', prisma);

// Registra o plugin de autenticação JWT. Este plugin ACESSA 'app.prisma'.
app.register(jwtAuthPlugin);

// Registra suas rotas
// Aplica o preHandler de autenticação automaticamente às rotas que precisam (configurado nos arquivos de rotas)
app.register(authRoutes, { prefix: '/api/auth' });
app.register(listRoutes, { prefix: '/api/lists' });
app.register(itemRoutes, { prefix: '/api/items' });
app.register(collaborationRoutes, { prefix: '/api/collaborations' });
app.register(reportRoutes, { prefix: '/api/reports' });


// Hook para fechar a conexão do Prisma quando o servidor for encerrado
// <-- Use instance.prisma para garantir que está desconectando a instância decorada
app.addHook('onClose', async (instance) => {
  await instance.prisma.$disconnect();
});

// Inicia o servidor
const start = async () => {
  try {
    // Define a porta do servidor
    const port = process.env.PORT || 3001;
    // Listen em 0.0.0.0 para ser acessível externamente (como de um frontend diferente ou Docker)
    await app.listen({ port: port, host: '0.0.0.0' });
    console.log(`Servidor backend rodando em http://0.0.0.0:${port}`);
  } catch (err) {
    app.log.error(err);
    // Garante que a aplicação sai com um código de erro se o servidor não iniciar
    process.exit(1);
  }
};

// Chama a função para iniciar o servidor
start();