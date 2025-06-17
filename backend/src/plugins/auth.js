// backend/src/plugins/auth.js
const fp = require('fastify-plugin');
const jwt = require('jsonwebtoken');

// A função do plugin encapsula a lógica de configuração
async function jwtAuthPlugin(app, options) {
  // Define o segredo do JWT a partir das variáveis de ambiente
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET não está definido nas variáveis de ambiente.');
  }

  // Adiciona um decorador 'authenticate' ao Fastify.request
  // Este decorador será uma função que verifica o token JWT.
  app.decorateRequest('authenticate', async function () {
    try {
      // Pega o cabeçalho de autorização
      const authHeader = this.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // Se o cabeçalho não existe ou não tem o formato correto, joga um erro 401
        throw app.httpErrors.unauthorized('Token de autenticação não fornecido ou inválido.');
      }

      // Extrai o token da string 'Bearer <token>'
      const token = authHeader.split(' ')[1];

      // Verifica e decodifica o token usando o segredo
      const decoded = jwt.verify(token, jwtSecret);

      // Busca o usuário no banco de dados para garantir que ele ainda existe
      // e armazena os dados do usuário no objeto de requisição (this.request.user)
      this.user = await app.prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, email: true } // Seleciona apenas dados essenciais
      });

      if (!this.user) {
        // Se o usuário não for encontrado (pode ter sido excluído), joga um erro 401
        throw app.httpErrors.unauthorized('Usuário não encontrado.');
      }
    } catch (error) {
      // Trata erros específicos de JWT
      if (error.name === 'TokenExpiredError') {
        throw app.httpErrors.unauthorized('Token de autenticação expirado.');
      }
      if (error.name === 'JsonWebTokenError') {
        throw app.httpErrors.unauthorized('Token de autenticação inválido.');
      }
      // Re-lança outros erros
      throw error;
    }
  });

  // Torna a instância do PrismaClient acessível via `app.prisma`
  // Isso é útil para que os controllers possam acessar o Prisma diretamente do app
  app.decorate('prisma', app.db); // app.db é importado no server.js e passado para o app
}

// Exporta o plugin usando fastify-plugin para que ele possa ser usado em outras rotas e plugins
module.exports = fp(jwtAuthPlugin);