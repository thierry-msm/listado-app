// backend/src/routes/itemRoutes.js
const itemController = require('../controllers/itemController');

async function itemRoutes(app) {
  // Aplica o middleware de autenticação a todas as rotas de item
  app.addHook('preHandler', app.request.authenticate);

  // Rota para adicionar um item a uma lista específica
  app.post('/:listId', itemController.addItemToList);

  // Rota para atualizar um item específico em uma lista
  app.put('/:listId/:itemId', itemController.updateItem);

  // Rota para deletar um item específico de uma lista (soft delete)
  app.delete('/:listId/:itemId', itemController.deleteItem);
}

module.exports = itemRoutes;