// backend/src/db.js
const { PrismaClient } = require('@prisma/client');

// Cria uma única instância do PrismaClient
const prisma = new PrismaClient();

// Expõe a instância para ser usada em outras partes da aplicação
module.exports = prisma;