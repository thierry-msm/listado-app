// backend/src/routes/authRoutes.js
const authController = require('../controllers/authController');

async function authRoutes(app) {
  // Rota para registrar um novo usuário
  app.post('/register', authController.register);

  // Rota para login de usuário
  app.post('/login', authController.login);

  // Rota para obter o perfil do usuário autenticado
  // Antes de chamar o controlador, executa o hook 'authenticate'
  app.get('/profile', { preHandler: [app.request.authenticate] }, authController.getProfile);

  // Rota para atualizar o perfil do usuário autenticado
  app.put('/profile', { preHandler: [app.request.authenticate] }, authController.updateProfile);
}

module.exports = authRoutes;