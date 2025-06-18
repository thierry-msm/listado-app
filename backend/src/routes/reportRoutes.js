// backend/src/routes/reportRoutes.js
const reportController = require('../controllers/reportController');

async function reportRoutes(app) {
  // Aplica o middleware de autenticação a todas as rotas de relatório
  app.addHook('preHandler', (request, reply) => request.authenticate(request, reply));

  // Rota para obter o relatório de gastos de uma lista
  app.get('/expenses/:listId', reportController.getListExpenseReport);

  // Rota para obter o histórico de uma lista
  app.get('/history/:listId', reportController.getListHistory);
}

module.exports = reportRoutes;