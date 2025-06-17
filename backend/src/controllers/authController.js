// backend/src/controllers/authController.js
const prisma = require('../db');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');

/**
 * Registra um novo usuário.
 * @param {FastifyRequest} request - Objeto de requisição do Fastify.
 * @param {FastifyReply} reply - Objeto de resposta do Fastify.
 */
async function register(request, reply) {
  const { name, email, password } = request.body;

  // Validação básica de entrada
  if (!name || !email || !password) {
    return reply.status(400).send({ message: 'Nome, e-mail e senha são obrigatórios.' });
  }

  try {
    // Verifica se já existe um usuário com o mesmo e-mail
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return reply.status(409).send({ message: 'E-mail já cadastrado.' });
    }

    // Hasheia a senha antes de salvar no banco de dados
    const hashedPassword = await hashPassword(password);

    // Cria o novo usuário no banco de dados
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: { // Retorna apenas dados seguros do usuário
        id: true,
        name: true,
        email: true,
        createdAt: true,
      }
    });

    // Gera um token JWT para o usuário recém-cadastrado
    const token = generateToken(user.id);

    // Retorna o usuário criado e o token
    return reply.status(201).send({ user, token, message: 'Usuário cadastrado com sucesso!' });
  } catch (error) {
    request.log.error(error); // Loga o erro para depuração
    return reply.status(500).send({ message: 'Erro ao registrar usuário.' });
  }
}

/**
 * Autentica um usuário existente.
 * @param {FastifyRequest} request - Objeto de requisição do Fastify.
 * @param {FastifyReply} reply - Objeto de resposta do Fastify.
 */
async function login(request, reply) {
  const { email, password } = request.body;

  // Validação básica de entrada
  if (!email || !password) {
    return reply.status(400).send({ message: 'E-mail e senha são obrigatórios.' });
  }

  try {
    // Busca o usuário pelo e-mail
    const user = await prisma.user.findUnique({ where: { email } });

    // Verifica se o usuário existe e se a senha está correta
    if (!user || !(await comparePassword(password, user.password))) {
      return reply.status(401).send({ message: 'Credenciais inválidas.' });
    }

    // Gera um token JWT para o usuário autenticado
    const token = generateToken(user.id);

    // Retorna o token e dados básicos do usuário
    return reply.status(200).send({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
      message: 'Login realizado com sucesso!',
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ message: 'Erro ao realizar login.' });
  }
}

/**
 * Obtém o perfil do usuário autenticado.
 * @param {FastifyRequest} request - Objeto de requisição do Fastify (contém request.user após autenticação).
 * @param {FastifyReply} reply - Objeto de resposta do Fastify.
 */
async function getProfile(request, reply) {
  // O objeto 'request.user' é populado pelo hook de autenticação (authenticate)
  // Se a autenticação falhar, este controlador não será chamado, ou request.user será undefined.
  if (!request.user || !request.user.id) {
    return reply.status(401).send({ message: 'Não autorizado.' });
  }

  try {
    // Busca o perfil completo do usuário (sem a senha)
    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return reply.status(404).send({ message: 'Usuário não encontrado.' });
    }

    return reply.status(200).send({ user });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ message: 'Erro ao buscar perfil do usuário.' });
  }
}

/**
 * Atualiza o perfil do usuário autenticado.
 * Permite mudar nome ou senha. E-mail não pode ser alterado por esta rota.
 * @param {FastifyRequest} request - Objeto de requisição do Fastify.
 * @param {FastifyReply} reply - Objeto de resposta do Fastify.
 */
async function updateProfile(request, reply) {
  // Verifica se o usuário está autenticado
  if (!request.user || !request.user.id) {
    return reply.status(401).send({ message: 'Não autorizado.' });
  }

  const { name, oldPassword, newPassword } = request.body;
  const userId = request.user.id; // ID do usuário autenticado

  if (!name && !newPassword) {
    return reply.status(400).send({ message: 'Nenhum dado para atualizar fornecido.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return reply.status(404).send({ message: 'Usuário não encontrado.' });
    }

    let hashedPassword;
    // Se uma nova senha for fornecida, verifica a senha antiga e hasheia a nova
    if (newPassword) {
      if (!oldPassword || !(await comparePassword(oldPassword, user.password))) {
        return reply.status(401).send({ message: 'Senha antiga incorreta.' });
      }
      hashedPassword = await hashPassword(newPassword);
    }

    // Atualiza o usuário no banco de dados
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || user.name, // Se 'name' for fornecido, atualiza, senão mantém o antigo
        password: hashedPassword || user.password, // Se 'newPassword' foi fornecido, usa o hash, senão mantém o antigo
      },
      select: { // Retorna dados atualizados e seguros
        id: true,
        name: true,
        email: true,
        createdAt: true,
      }
    });

    return reply.status(200).send({ user: updatedUser, message: 'Perfil atualizado com sucesso!' });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ message: 'Erro ao atualizar perfil.' });
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
};