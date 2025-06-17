// backend/src/controllers/collaborationController.js
const prisma = require('../db');

/**
 * Convida um usuário para uma lista.
 * O convidado é adicionado como 'collaborator' por padrão.
 * @param {FastifyRequest} request - Objeto de requisição do Fastify.
 * @param {FastifyReply} reply - Objeto de resposta do Fastify.
 */
async function inviteUserToList(request, reply) {
  const { listId } = request.params;
  const { invitedEmail, role = 'collaborator' } = request.body; // Papel padrão é 'collaborator'
  const userId = request.user.id; // Usuário que está convidando

  if (!invitedEmail) {
    return reply.status(400).send({ message: 'O e-mail do usuário convidado é obrigatório.' });
  }
  if (!['admin', 'collaborator'].includes(role)) {
    return reply.status(400).send({ message: 'Papel inválido. Deve ser "admin" ou "collaborator".' });
  }

  try {
    // 1. Verifica se o usuário que convida tem permissão de admin/proprietário na lista
    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: { collaborations: true },
    });

    if (!list) {
      return reply.status(404).send({ message: 'Lista não encontrada.' });
    }

    const isAdmin = list.ownerId === userId || list.collaborations.some(c => c.userId === userId && c.role === 'admin');
    if (!isAdmin) {
      return reply.status(403).send({ message: 'Você não tem permissão para convidar usuários para esta lista.' });
    }

    // 2. Encontra o usuário a ser convidado pelo e-mail
    const invitedUser = await prisma.user.findUnique({
      where: { email: invitedEmail },
      select: { id: true, name: true, email: true },
    });

    if (!invitedUser) {
      return reply.status(404).send({ message: 'Usuário a ser convidado não encontrado.' });
    }

    // 3. Verifica se o usuário já é proprietário ou já está colaborando na lista
    if (list.ownerId === invitedUser.id) {
      return reply.status(400).send({ message: 'Este usuário já é o proprietário desta lista.' });
    }
    const alreadyCollaborating = list.collaborations.some(c => c.userId === invitedUser.id);
    if (alreadyCollaborating) {
      return reply.status(400).send({ message: 'Este usuário já está colaborando nesta lista.' });
    }

    // 4. Cria a colaboração
    const collaboration = await prisma.collaboration.create({
      data: {
        listId,
        userId: invitedUser.id,
        role,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Opcional: Enviar uma notificação para o invitedUser
    await prisma.notification.create({
      data: {
        userId: invitedUser.id,
        type: 'LIST_SHARED',
        title: 'Nova Lista Compartilhada!',
        message: `${request.user.name} convidou você para a lista "${list.name}".`,
        metadata: {
          listId: list.id,
          listName: list.name,
          inviterName: request.user.name
        },
      },
    });

    return reply.status(201).send(collaboration);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ message: 'Erro ao convidar usuário.' });
  }
}

/**
 * Remove um colaborador de uma lista.
 * Apenas o proprietário ou um administrador pode remover. Não pode remover a si mesmo se for o único admin.
 * @param {FastifyRequest} request - Objeto de requisição do Fastify.
 * @param {FastifyReply} reply - Objeto de resposta do Fastify.
 */
async function removeCollaboration(request, reply) {
  const { listId, collaborationId } = request.params; // collaborationId é o ID da entrada da tabela Collaboration
  const userId = request.user.id; // Usuário que está removendo

  try {
    // 1. Verifica se a colaboração existe e pertence à lista
    const collaborationToRemove = await prisma.collaboration.findUnique({
      where: { id: collaborationId },
      include: {
        list: {
          include: { collaborations: true, owner: true },
        },
        user: true // Para verificar se o usuário está tentando remover a si mesmo
      },
    });

    if (!collaborationToRemove || collaborationToRemove.listId !== listId) {
      return reply.status(404).send({ message: 'Colaboração não encontrada nesta lista.' });
    }

    const list = collaborationToRemove.list;

    // 2. Verifica permissão: Somente o proprietário ou um admin pode remover colaboradores.
    const isOwner = list.ownerId === userId;
    const isAdmin = list.collaborations.some(c => c.userId === userId && c.role === 'admin');

    if (!isOwner && !isAdmin) {
      return reply.status(403).send({ message: 'Você não tem permissão para remover colaboradores desta lista.' });
    }

    // 3. Impede que o proprietário se remova como admin se for o único.
    if (collaborationToRemove.userId === list.ownerId && isOwner) {
        // O proprietário está tentando remover a si mesmo como colaborador admin. Isso é permitido se ele continua sendo o proprietário.
        // A lógica do owner é que ele sempre tem permissão total, não precisa de uma entrada de colaboração para isso.
        // Se a colaboração a ser removida é a do próprio owner (proprietário), então vamos verificar se ele é o proprietário.
        // Se sim, ele não deveria ter uma entrada de colaboração, ou se tem, pode ser removida.
        // A validação principal aqui é para não deixar a lista sem administradores.
        const currentAdmins = list.collaborations.filter(c => c.role === 'admin' && c.userId !== collaborationToRemove.userId);
        if (currentAdmins.length === 0 && collaborationToRemove.role === 'admin') {
            return reply.status(400).send({ message: 'Não é possível remover o único administrador da lista.' });
        }
    } else if (collaborationToRemove.userId === userId) {
      // Um colaborador tentando se remover (sair da lista)
      // Ou um admin tentando remover a si mesmo (se não for o owner)
      const currentAdmins = list.collaborations.filter(c => c.role === 'admin' && c.userId !== collaborationToRemove.userId);
      if (collaborationToRemove.role === 'admin' && currentAdmins.length === 0 && list.ownerId !== userId) {
          return reply.status(400).send({ message: 'Não é possível remover o único administrador da lista (você não é o proprietário).' });
      }
    }


    // 4. Deleta a colaboração
    await prisma.collaboration.delete({
      where: { id: collaborationId },
    });

    // Opcional: Notificar o usuário removido
    await prisma.notification.create({
      data: {
        userId: collaborationToRemove.userId,
        type: 'LIST_SHARED',
        title: 'Colaboração Encerrada',
        message: `Você foi removido da lista "${list.name}".`,
        metadata: {
          listId: list.id,
          listName: list.name,
        },
      },
    });

    return reply.status(204).send(); // No Content
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ message: 'Erro ao remover colaboração.' });
  }
}


/**
 * Atualiza o papel (role) de um colaborador.
 * Apenas o proprietário pode mudar o papel de um admin/colaborador.
 * Um admin não pode mudar o papel de outro admin ou do proprietário.
 * @param {FastifyRequest} request - Objeto de requisição do Fastify.
 * @param {FastifyReply} reply - Objeto de resposta do Fastify.
 */
async function updateCollaborationRole(request, reply) {
  const { listId, collaborationId } = request.params;
  const { role } = request.body; // Novo papel: 'admin' ou 'collaborator'
  const userId = request.user.id; // Usuário que está modificando o papel

  if (!role || !['admin', 'collaborator'].includes(role)) {
    return reply.status(400).send({ message: 'Papel inválido. Deve ser "admin" ou "collaborator".' });
  }

  try {
    const collaborationToUpdate = await prisma.collaboration.findUnique({
      where: { id: collaborationId },
      include: {
        list: {
          include: { collaborations: true, owner: true },
        },
        user: true, // Inclui o usuário da colaboração
      },
    });

    if (!collaborationToUpdate || collaborationToUpdate.listId !== listId) {
      return reply.status(404).send({ message: 'Colaboração não encontrada nesta lista.' });
    }

    const list = collaborationToUpdate.list;

    // 1. Verificar se o usuário que faz a requisição é o proprietário da lista
    if (list.ownerId !== userId) {
      return reply.status(403).send({ message: 'Apenas o proprietário da lista pode alterar papéis de colaboração.' });
    }

    // 2. Impedir que o proprietário altere o próprio papel (ele é sempre o proprietário)
    if (collaborationToUpdate.userId === list.ownerId) {
      return reply.status(400).send({ message: 'Não é possível alterar o papel do proprietário da lista.' });
    }

    // 3. Impedir que um admin seja rebaixado se for o último admin além do owner
    if (collaborationToUpdate.role === 'admin' && role === 'collaborator') {
      const otherAdmins = list.collaborations.filter(
        c => c.role === 'admin' && c.userId !== collaborationToUpdate.userId && c.userId !== list.ownerId
      );
      if (otherAdmins.length === 0) {
        return reply.status(400).send({ message: 'Não é possível rebaixar o único administrador da lista (além do proprietário).' });
      }
    }


    const updatedCollaboration = await prisma.collaboration.update({
      where: { id: collaborationId },
      data: { role },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Opcional: Notificar o usuário cujo papel foi alterado
    await prisma.notification.create({
      data: {
        userId: updatedCollaboration.userId,
        type: 'COLLABORATOR_JOINED', // Ou um novo tipo como 'ROLE_UPDATED'
        title: 'Seu papel na lista foi alterado!',
        message: `Seu papel na lista "${list.name}" foi alterado para "${role}".`,
        metadata: {
          listId: list.id,
          listName: list.name,
          newRole: role,
        },
      },
    });

    return reply.status(200).send(updatedCollaboration);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ message: 'Erro ao atualizar papel da colaboração.' });
  }
}

module.exports = {
  inviteUserToList,
  removeCollaboration,
  updateCollaborationRole,
};