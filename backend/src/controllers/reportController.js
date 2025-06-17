// backend/src/controllers/reportController.js
const prisma = require('../db');

/**
 * Gera um relatório de gastos para uma lista específica.
 * @param {FastifyRequest} request - Objeto de requisição do Fastify.
 * @param {FastifyReply} reply - Objeto de resposta do Fastify.
 */
async function getListExpenseReport(request, reply) {
  const { listId } = request.params;
  const userId = request.user.id;

  try {
    // Verifica se o usuário tem acesso à lista
    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: {
        collaborations: true,
      },
    });

    if (!list) {
      return reply.status(404).send({ message: 'Lista não encontrada.' });
    }

    const hasAccess = list.ownerId === userId || list.collaborations.some(c => c.userId === userId);
    if (!hasAccess) {
      return reply.status(403).send({ message: 'Você não tem permissão para acessar este relatório.' });
    }

    // Busca todos os itens da lista que foram comprados e não estão deletados
    const purchasedItems = await prisma.item.findMany({
      where: {
        listId: listId,
        purchased: true,
        deletedAt: null, // Considera apenas itens não "soft-deletados"
      },
      select: {
        name: true,
        quantity: true,
        priceLimit: true,
        actualPrice: true,
        purchasedAt: true,
        purchasedBy: {
          select: { id: true, name: true }
        }
      },
      orderBy: {
        purchasedAt: 'desc',
      },
    });

    let totalSpent = 0;
    let totalEstimated = 0;
    let savings = 0; // Diferença entre preço sugerido e real

    purchasedItems.forEach(item => {
      // Se tiver preço real, usa, senão tenta usar o sugerido
      const actual = item.actualPrice || (item.priceLimit && item.quantity ? item.priceLimit * item.quantity : 0);
      const estimated = item.priceLimit && item.quantity ? item.priceLimit * item.quantity : 0;

      totalSpent += actual;
      totalEstimated += estimated;

      if (item.actualPrice && item.priceLimit) {
        savings += (item.priceLimit - item.actualPrice) * item.quantity;
      }
    });

    return reply.status(200).send({
      listId: list.id,
      listName: list.name,
      totalSpent: parseFloat(totalSpent.toFixed(2)),
      totalEstimated: parseFloat(totalEstimated.toFixed(2)),
      savings: parseFloat(savings.toFixed(2)),
      purchasedItems: purchasedItems.map(item => ({
        ...item,
        priceLimit: item.priceLimit ? parseFloat(item.priceLimit.toFixed(2)) : null,
        actualPrice: item.actualPrice ? parseFloat(item.actualPrice.toFixed(2)) : null,
      })),
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ message: 'Erro ao gerar relatório de gastos.' });
  }
}

/**
 * Obtém o histórico de ações de uma lista (quem comprou, itens alterados/removidos).
 * Para este MVP, vamos focar nos itens comprados e "soft-deletados".
 * Alterações e remoções (além do soft-delete) exigiriam um modelo de log mais robusto.
 * @param {FastifyRequest} request - Objeto de requisição do Fastify.
 * @param {FastifyReply} reply - Objeto de resposta do Fastify.
 */
async function getListHistory(request, reply) {
  const { listId } = request.params;
  const userId = request.user.id;

  try {
    // Verifica se o usuário tem acesso à lista
    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: {
        collaborations: true,
      },
    });

    if (!list) {
      return reply.status(404).send({ message: 'Lista não encontrada.' });
    }

    const hasAccess = list.ownerId === userId || list.collaborations.some(c => c.userId === userId);
    if (!hasAccess) {
      return reply.status(403).send({ message: 'Você não tem permissão para acessar este histórico.' });
    }

    // Busca itens comprados e itens que foram "soft-deletados"
    const historyItems = await prisma.item.findMany({
      where: {
        listId: listId,
        OR: [
          { purchased: true },
          { deletedAt: { not: null } }
        ]
      },
      include: {
        purchasedBy: { select: { id: true, name: true } }
      },
      orderBy: [
        { purchasedAt: 'desc' }, // Ordem primária por data de compra
        { deletedAt: 'desc' }, // Ordem secundária por data de exclusão (soft-delete)
        { createdAt: 'desc' } // Ordem terciária por data de criação
      ],
    });

    // Formata o histórico para ser mais legível
    const formattedHistory = historyItems.map(item => {
      if (item.purchased && item.purchasedAt) {
        return {
          type: 'ITEM_COMPRADO',
          itemId: item.id,
          itemName: item.name,
          quantity: item.quantity,
          actualPrice: item.actualPrice,
          purchasedBy: item.purchasedBy ? item.purchasedBy.name : 'Desconhecido',
          timestamp: item.purchasedAt,
        };
      } else if (item.deletedAt) {
        return {
          type: 'ITEM_REMOVIDO',
          itemId: item.id,
          itemName: item.name,
          timestamp: item.deletedAt,
          // Quem removeu não está diretamente no modelo, precisaria de log de auditoria separado
        };
      }
      return null; // Caso um item não se encaixe nos critérios acima
    }).filter(Boolean); // Remove entradas nulas

    return reply.status(200).send(formattedHistory);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ message: 'Erro ao gerar histórico da lista.' });
  }
}

module.exports = {
  getListExpenseReport,
  getListHistory,
};