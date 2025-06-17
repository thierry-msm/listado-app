// backend/src/controllers/itemController.js
const prisma = require('../db');

/**
 * Adiciona um novo item a uma lista.
 * @param {FastifyRequest} request - Objeto de requisição do Fastify.
 * @param {FastifyReply} reply - Objeto de resposta do Fastify.
 */
async function addItemToList(request, reply) {
  const { listId } = request.params;
  const { name, quantity, priceLimit, notes, category, priority } = request.body;
  const userId = request.user.id;

  if (!name || !quantity) {
    return reply.status(400).send({ message: 'Nome e quantidade do item são obrigatórios.' });
  }
  if (typeof quantity !== 'number' || quantity <= 0) {
    return reply.status(400).send({ message: 'Quantidade deve ser um número positivo.' });
  }
  if (priceLimit !== undefined && (typeof priceLimit !== 'number' || priceLimit < 0)) {
    return reply.status(400).send({ message: 'Preço limite deve ser um número positivo.' });
  }

  try {
    // Verifica se o usuário tem permissão de administrador ou proprietário na lista
    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: {
        collaborations: true,
      },
    });

    if (!list) {
      return reply.status(404).send({ message: 'Lista não encontrada.' });
    }

    const isAdmin = list.ownerId === userId || list.collaborations.some(c => c.userId === userId && c.role === 'admin');
    if (!isAdmin) {
      return reply.status(403).send({ message: 'Você não tem permissão para adicionar itens a esta lista.' });
    }

    const newItem = await prisma.item.create({
      data: {
        name,
        quantity,
        priceLimit,
        notes,
        category,
        priority: priority || 'MEDIUM', // Define a prioridade padrão se não for fornecida
        listId,
      },
    });
    return reply.status(201).send(newItem);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ message: 'Erro ao adicionar item.' });
  }
}

/**
 * Atualiza um item específico em uma lista.
 * @param {FastifyRequest} request - Objeto de requisição do Fastify.
 * @param {FastifyReply} reply - Objeto de resposta do Fastify.
 */
async function updateItem(request, reply) {
  const { listId, itemId } = request.params;
  const { name, quantity, priceLimit, actualPrice, purchased, notes, category, priority } = request.body;
  const userId = request.user.id;

  if (!name && quantity === undefined && priceLimit === undefined && actualPrice === undefined &&
      purchased === undefined && notes === undefined && category === undefined && priority === undefined) {
    return reply.status(400).send({ message: 'Nenhum dado para atualização fornecido.' });
  }

  if (quantity !== undefined && (typeof quantity !== 'number' || quantity <= 0)) {
    return reply.status(400).send({ message: 'Quantidade deve ser um número positivo.' });
  }
  if (priceLimit !== undefined && (typeof priceLimit !== 'number' || priceLimit < 0)) {
    return reply.status(400).send({ message: 'Preço limite deve ser um número positivo.' });
  }
  if (actualPrice !== undefined && (typeof actualPrice !== 'number' || actualPrice < 0)) {
    return reply.status(400).send({ message: 'Preço real deve ser um número positivo.' });
  }
  if (purchased !== undefined && typeof purchased !== 'boolean') {
    return reply.status(400).send({ message: 'O status de comprado deve ser verdadeiro ou falso.' });
  }
  if (priority !== undefined && !['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority)) {
    return reply.status(400).send({ message: 'Prioridade inválida.' });
  }


  try {
    // Verifica se o item pertence à lista e se o usuário tem permissão
    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: {
        collaborations: true,
        items: { where: { id: itemId } } // Inclui o item para verificar se ele existe na lista
      },
    });

    if (!list) {
      return reply.status(404).send({ message: 'Lista não encontrada.' });
    }
    if (list.items.length === 0) {
      return reply.status(404).send({ message: 'Item não encontrado nesta lista.' });
    }

    const isAdmin = list.ownerId === userId || list.collaborations.some(c => c.userId === userId && c.role === 'admin');
    const isCollaborator = list.collaborations.some(c => c.userId === userId && c.role === 'collaborator');

    // Se o usuário não é admin/owner e está tentando mudar algo além de 'purchased'
    if (!isAdmin && (name !== undefined || quantity !== undefined || priceLimit !== undefined ||
        actualPrice !== undefined || notes !== undefined || category !== undefined || priority !== undefined)) {
      return reply.status(403).send({ message: 'Você não tem permissão para editar os detalhes do item.' });
    }

    // Se o usuário é um colaborador e está tentando marcar como comprado/descomprado
    if (purchased !== undefined && !isAdmin && !isCollaborator) {
      return reply.status(403).send({ message: 'Você não tem permissão para marcar itens como comprados.' });
    }

    const currentItem = await prisma.item.findUnique({ where: { id: itemId } });
    if (!currentItem) {
      return reply.status(404).send({ message: 'Item não encontrado.' });
    }

    const dataToUpdate = {
      name: name !== undefined ? name : currentItem.name,
      quantity: quantity !== undefined ? quantity : currentItem.quantity,
      priceLimit: priceLimit !== undefined ? priceLimit : currentItem.priceLimit,
      actualPrice: actualPrice !== undefined ? actualPrice : currentItem.actualPrice,
      notes: notes !== undefined ? notes : currentItem.notes,
      category: category !== undefined ? category : currentItem.category,
      priority: priority !== undefined ? priority : currentItem.priority,
    };

    // Lógica específica para marcar/desmarcar como comprado
    if (purchased !== undefined) {
      dataToUpdate.purchased = purchased;
      dataToUpdate.purchasedAt = purchased ? new Date() : null;
      dataToUpdate.purchasedById = purchased ? userId : null;
    }

    const updatedItem = await prisma.item.update({
      where: { id: itemId, listId: listId }, // Garante que o item pertence à lista
      data: dataToUpdate,
      include: {
        purchasedBy: { select: { id: true, name: true } }
      }
    });

    return reply.status(200).send(updatedItem);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ message: 'Erro ao atualizar item.' });
  }
}

/**
 * Deleta um item de uma lista (soft delete).
 * @param {FastifyRequest} request - Objeto de requisição do Fastify.
 * @param {FastifyReply} reply - Objeto de resposta do Fastify.
 */
async function deleteItem(request, reply) {
  const { listId, itemId } = request.params;
  const userId = request.user.id;

  try {
    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: {
        collaborations: true,
      },
    });

    if (!list) {
      return reply.status(404).send({ message: 'Lista não encontrada.' });
    }

    const isAdmin = list.ownerId === userId || list.collaborations.some(c => c.userId === userId && c.role === 'admin');
    if (!isAdmin) {
      return reply.status(403).send({ message: 'Você não tem permissão para remover itens desta lista.' });
    }

    // Soft delete: apenas marca o item como deletado
    const deletedItem = await prisma.item.update({
      where: { id: itemId, listId: listId },
      data: {
        deletedAt: new Date(),
      },
    });

    if (!deletedItem) {
      return reply.status(404).send({ message: 'Item não encontrado ou já deletado.' });
    }

    return reply.status(204).send(); // No Content
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ message: 'Erro ao deletar item.' });
  }
}

module.exports = {
  addItemToList,
  updateItem,
  deleteItem,
};