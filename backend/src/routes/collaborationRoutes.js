// backend/src/routes/collaborationRoutes.js
const collaborationController = require('../controllers/collaborationController');

async function collaborationRoutes(app) {
  // Aplica o middleware de autenticação a todas as rotas de colaboração
  app.addHook('preHandler', app.request.authenticate);

  // Rota para convidar um usuário para uma lista
  app.post('/:listId/invite', collaborationController.inviteUserToList);

  // Rota para remover um colaborador de uma lista
  app.delete('/:listId/collaborators/:collaborationId', collaborationController.removeCollaboration);

  // Rota para atualizar o papel de um colaborador (admin/collaborator)
  app.put('/:listId/collaborators/:collaborationId/role', collaborationController.updateCollaborationRole);
}

module.exports = collaborationRoutes;