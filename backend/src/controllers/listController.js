// backend/src/controllers/listController.js
const prisma = require('../db');

/**
 * Cria uma nova lista de compras.
 * @param {FastifyRequest} request - Objeto de requisição do Fastify.
 * @param {FastifyReply} reply - Objeto de resposta do Fastify.
 */
async function createList(request, reply) {
  const { name, description } = request.body;
  const ownerId = request.user.id; // O ID do proprietário vem do token JWT

  if (!name) {
    return reply.status(400).send({ message: 'O nome da lista é obrigatório.' });
  }

  try {
    const newList = await prisma.list.create({
      data: {
        name,
        description,
        ownerId,
        // Ao criar a lista, o proprietário é automaticamente adicionado como um colaborador 'admin'
        collaborations: {
          create: {
            userId: ownerId,
            role: 'admin',
          },
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        collaborations: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        _count: { // <-- ADICIONE ESTE BLOCO para incluir as contagens
           select: { items: true, collaborations: true },
        },
        items: { // <-- ADICIONE ESTE INCLUDE para poder calcular pendingItemsCount
           where: { purchased: false }, // Apenas itens não comprados
           select: { id: true } // Não precisa de todos os dados, só o suficiente para contar
        }
      },
    });

    // Formata a resposta para ter pendingItemsCount e userRole, como em getMyLists
    const formattedList = {
        ...newList, // Copia as propriedades da lista criada (incluindo _count e items)
        pendingItemsCount: newList.items.length, // Calcula a contagem de itens pendentes
        userRole: 'admin', // O criador da lista sempre é o admin (e proprietário)
        items: undefined // Remove o array de items detalhado que só foi usado para contar
    };

    return reply.status(201).send(formattedList); // <-- Envie o objeto formatado
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ message: 'Erro ao criar lista.' });
  }
}

/**
 * Obtém todas as listas de um usuário (próprias ou colaboradas).
 * @param {FastifyRequest} request - Objeto de requisição do Fastify.
 * @param {FastifyReply} reply - Objeto de resposta do Fastify.
 */
async function getMyLists(request, reply) {
  const userId = request.user.id;

  try {
    // Busca listas onde o usuário é o proprietário OU é um colaborador
    const lists = await prisma.list.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            collaborations: {
              some: {
                userId: userId,
              },
            },
          },
        ],
      },
      include: {
        _count: {
          select: { items: true, collaborations: true },
        },
        owner: {
          select: { id: true, name: true, email: true },
        },
        collaborations: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        items: {
          where: { purchased: false }, // Conta apenas itens não comprados
          select: { id: true }
        }
      },
      orderBy: {
        createdAt: 'desc', // Ordena as listas pelas mais recentes
      }
    });

    // Mapeia para incluir o total de itens não comprados e o papel do usuário na lista
    const formattedLists = lists.map(list => {
      const userCollaboration = list.collaborations.find(col => col.userId === userId);
      return {
        ...list,
        pendingItemsCount: list.items.length, // Conta os itens não comprados
        userRole: userCollaboration ? userCollaboration.role : null, // Adiciona o papel do usuário
        items: undefined // Remove o array de items para não duplicar dados
      };
    });

    return reply.status(200).send(formattedLists);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ message: 'Erro ao buscar listas.' });
  }
}

/**
 * Obtém uma lista específica pelo ID.
 * @param {FastifyRequest} request - Objeto de requisição do Fastify.
 * @param {FastifyReply} reply - Objeto de resposta do Fastify.
 */
async function getListById(request, reply) {
  const { id } = request.params;
  const userId = request.user.id;

  try {
    const list = await prisma.list.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        collaborations: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        items: {
          orderBy: [ // Ordena os itens
            { purchased: 'asc' }, // Itens não comprados primeiro
            { name: 'asc' } // Depois por nome
          ],
          include: {
            purchasedBy: { select: { id: true, name: true } } // Inclui quem comprou o item
          }
        },
      },
    });

    if (!list) {
      return reply.status(404).send({ message: 'Lista não encontrada.' });
    }

    // Verifica se o usuário é o proprietário ou um colaborador
    const isOwner = list.ownerId === userId;
    const isCollaborator = list.collaborations.some(c => c.userId === userId);

    if (!isOwner && !isCollaborator) {
      return reply.status(403).send({ message: 'Você não tem permissão para acessar esta lista.' });
    }

    // Adiciona o papel do usuário na lista
    const userCollaboration = list.collaborations.find(col => col.userId === userId);
    list.userRole = userCollaboration ? userCollaboration.role : (isOwner ? 'admin' : null);


    return reply.status(200).send(list);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ message: 'Erro ao buscar lista.' });
  }
}

/**
 * Atualiza o nome ou a descrição de uma lista.
 * Apenas o proprietário ou um administrador pode fazer isso.
 * @param {FastifyRequest} request - Objeto de requisição do Fastify.
 * @param {FastifyReply} reply - Objeto de resposta do Fastify.
 */
async function updateList(request, reply) {
  const { id } = request.params;
  const { name, description } = request.body;
  const userId = request.user.id;

  if (!name && description === undefined) { // Permite que a descrição seja null/vazia
    return reply.status(400).send({ message: 'Pelo menos o nome ou a descrição devem ser fornecidos para atualização.' });
  }

  try {
    const list = await prisma.list.findUnique({
      where: { id },
      include: {
        collaborations: true, // Inclui colaborações para verificar permissões
      },
    });

    if (!list) {
      return reply.status(404).send({ message: 'Lista não encontrada.' });
    }

    // Verifica se o usuário é o proprietário ou um admin
    const isAdmin = list.ownerId === userId || list.collaborations.some(c => c.userId === userId && c.role === 'admin');

    if (!isAdmin) {
      return reply.status(403).send({ message: 'Você não tem permissão para editar esta lista.' });
    }

    const updatedList = await prisma.list.update({
      where: { id },
      data: {
        name: name !== undefined ? name : list.name,
        description: description !== undefined ? description : list.description,
      },
      select: {
        id: true,
        name: true,
        description: true,
        ownerId: true,
        createdAt: true,
      },
    });
    return reply.status(200).send(updatedList);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ message: 'Erro ao atualizar lista.' });
  }
}

/**
 * Deleta uma lista. Apenas o proprietário pode deletar.
 * @param {FastifyRequest} request - Objeto de requisição do Fastify.
 * @param {FastifyReply} reply - Objeto de resposta do Fastify.
 */
async function deleteList(request, reply) {
  const { id } = request.params;
  const userId = request.user.id;

  try {
    const list = await prisma.list.findUnique({ where: { id } });

    if (!list) {
      return reply.status(404).send({ message: 'Lista não encontrada.' });
    }

    // Verifica se o usuário é o proprietário da lista
    if (list.ownerId !== userId) {
      return reply.status(403).send({ message: 'Você não tem permissão para deletar esta lista.' });
    }

    // Transação para deletar itens, colaborações e depois a lista
    await prisma.$transaction([
      prisma.item.deleteMany({ where: { listId: id } }),
      prisma.collaboration.deleteMany({ where: { listId: id } }),
      prisma.list.delete({ where: { id } }),
    ]);

    return reply.status(204).send(); // No Content
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ message: 'Erro ao deletar lista.' });
  }
}

module.exports = {
  createList,
  getMyLists,
  getListById,
  updateList,
  deleteList,
};