// backend/src/utils/auth.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Número de "rounds" (iterações) para o hashing da senha.
// Um valor maior aumenta a segurança, mas consome mais CPU. 10 é um bom balanço.
const SALT_ROUNDS = 10;

/**
 * Gera um hash seguro de uma senha.
 * @param {string} password - A senha em texto plano.
 * @returns {Promise<string>} O hash da senha.
 */
async function hashPassword(password) {
  // Gera um "salt" (valor aleatório) e então hasheia a senha com ele.
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compara uma senha em texto plano com um hash.
 * @param {string} password - A senha em texto plano.
 * @param {string} hashedPassword - O hash da senha a ser comparada.
 * @returns {Promise<boolean>} True se as senhas coincidem, False caso contrário.
 */
async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Gera um JSON Web Token (JWT) para um usuário.
 * @param {string} userId - O ID do usuário para incluir no token.
 * @returns {string} O token JWT.
 */
function generateToken(userId) {
  // Verifica se a chave secreta do JWT está definida nas variáveis de ambiente.
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET não está definido nas variáveis de ambiente.');
  }

  // Gera o token com o ID do usuário, a chave secreta e uma expiração de 1 hora.
  return jwt.sign({ userId }, jwtSecret, { expiresIn: '1h' });
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
};