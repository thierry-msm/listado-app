// backend/src/routes/listRoutes.js
const listController = require('../controllers/listController');

async function listRoutes(app) {
  // Aplica o middleware de autenticação a todas as rotas de lista
  // Isso garante que apenas usuários autenticados possam acessar estas rotas
  app.addHook('preHandler', app.request.authenticate);

  // Rota para criar uma nova lista
  app.post('/', listController.createList);

  // Rota para obter todas as listas do usuário (próprias e colaboradas)
  app.get('/', listController.getMyLists);

  // Rota para obter uma lista específica pelo ID
  app.get('/:id', listController.getListById);

  // Rota para atualizar uma lista pelo ID
  app.put('/:id', listController.updateList);

  // Rota para deletar uma lista pelo ID
  app.delete('/:id', listController.deleteList);
}

module.exports = listRoutes;