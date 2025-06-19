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
  const updates = request.body; // O corpo da requisição contém os campos a serem atualizados
  const userId = request.user.id; // ID do usuário autenticado (vem do token JWT)

  request.log.info({ updates, listId, itemId, userId }, 'Received item update request'); // Log inicial detalhado

  // Validações básicas de entrada (checa apenas tipos/formatos, não permissões)
  if (updates.quantity !== undefined && (typeof updates.quantity !== 'number' || updates.quantity <= 0)) {
    return reply.status(400).send({ message: 'Quantidade deve ser um número positivo.' });
  }
  if (updates.priceLimit !== undefined && (typeof updates.priceLimit !== 'number' || updates.priceLimit < 0)) {
    return reply.status(400).send({ message: 'Preço limite deve ser um número positivo.' });
  }
  if (updates.actualPrice !== undefined && (typeof updates.actualPrice !== 'number' || updates.actualPrice < 0 && updates.actualPrice !== null)) { // Permite null para actualPrice
    return reply.status(400).send({ message: 'Preço real deve ser um número positivo ou nulo.' });
  }
  if (updates.purchased !== undefined && typeof updates.purchased !== 'boolean') {
    return reply.status(400).send({ message: 'O status de comprado deve ser verdadeiro ou falso.' });
  }
  if (updates.priority !== undefined && !['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(updates.priority)) {
    return reply.status(400).send({ message: 'Prioridade inválida.' });
  }

  try {
    // 1. Verifica se a lista existe e busca as colaborações e o item
    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: {
        collaborations: true,
        items: { where: { id: itemId, deletedAt: null } } // Filtra por item não deletado
      },
    });

    if (!list) {
      request.log.warn({ listId, itemId }, 'List not found for item update');
      return reply.status(404).send({ message: 'Lista não encontrada.' });
    }
    // Verifica se o item existe e pertence a esta lista (e não está soft-deletado)
    const currentItem = list.items[0]; // O item que queremos atualizar
    if (!currentItem) {
      request.log.warn({ listId, itemId }, 'Item not found or soft-deleted in list for update');
      return reply.status(404).send({ message: 'Item não encontrado nesta lista.' });
    }


    // 2. Determina o papel do usuário na lista
    const isOwner = list.ownerId === userId;
    const userCollaboration = list.collaborations.find(c => c.userId === userId);
    const isAdmin = isOwner || (userCollaboration && userCollaboration.role === 'admin');
    const isCollaborator = userCollaboration && userCollaboration.role === 'collaborator'; // Apenas colaborador, não admin/owner

    // 3. Valida as permissões com base no papel e nos campos a serem atualizados
    const allowedUpdates = {}; // Objeto para armazenar apenas os campos permitidos
    let permissionDenied = false; // Flag para indicar se a permissão foi negada para qualquer campo
    let denyMessage = ''; // Mensagem de erro específica

    // Itera sobre os campos que foram enviados na requisição
    for (const field in updates) {
        // Garante que estamos processando propriedades próprias do objeto `updates`
        if (Object.prototype.hasOwnProperty.call(updates, field)) {
            const value = updates[field];

            // Decide a permissão para cada campo conhecido
            switch (field) {
                case 'name':
                case 'quantity':
                case 'priceLimit':
                    // Apenas Administrador/Proprietário pode editar estes campos
                    if (isAdmin) {
                        allowedUpdates[field] = value;
                    } else {
                        permissionDenied = true;
                        denyMessage = `Você não tem permissão para editar o campo "${field}" do item.`;
                    }
                    break;

                case 'purchased':
                    // Administrador/Proprietário OU Colaborador pode alterar o status de comprado
                    if (isAdmin || isCollaborator) {
                         allowedUpdates[field] = value;
                    } else {
                        permissionDenied = true;
                        denyMessage = 'Você não tem permissão para marcar itens como comprados.';
                    }
                    break;

                case 'actualPrice':
                case 'notes':
                case 'category':
                case 'priority':
                     // Administrador/Proprietário OU Colaborador pode editar estes campos
                     // (Baseado na necessidade do usuário, estendendo a especificação original de "apenas marcar comprado")
                     if (isAdmin || isCollaborator) {
                         allowedUpdates[field] = value;
                     } else {
                         permissionDenied = true;
                         denyMessage = `Você não tem permissão para editar o campo "${field === 'actualPrice' ? 'preço real' : field}" do item.`;
                     }
                     break;

                // Ignora campos desconhecidos ou campos internos que não devem ser atualizados via API (ex: id, listId, createdAt, updatedAt, deletedAt, purchasedBy, purchasedAt)
                case 'id':
                case 'listId':
                case 'createdAt':
                case 'updatedAt':
                case 'deletedAt':
                case 'purchasedBy': // Quem comprou é definido pelo backend, não pelo input direto
                case 'purchasedAt': // Quando comprou é definido pelo backend
                    request.log.warn({ field, value, userId }, `Attempted to update restricted field ${field}`);
                    // Ignora silenciosamente ou pode retornar um erro 400/403 dependendo da política de segurança
                    // Por enquanto, ignoramos.
                    break;

                default:
                    // Se um campo enviado não é nenhum dos campos conhecidos, é um erro (ou um campo futuro não tratado)
                    permissionDenied = true;
                    denyMessage = `Campo desconhecido "${field}" não pode ser atualizado.`;
                    break;
            }

            // Se a permissão foi negada para QUALQUER campo, para o processamento e retorna erro
            if (permissionDenied) {
                request.log.warn({ userId, role: isAdmin ? 'admin' : (isCollaborator ? 'collaborator' : 'none'), field, denyMessage }, `Permission denied updating item ${itemId}`);
                return reply.status(403).send({ message: denyMessage });
            }
        }
    }

    // 4. Checa se algum campo permitido foi realmente enviado na requisição
    if (Object.keys(allowedUpdates).length === 0) {
        // Se a requisição tinha campos, mas nenhum deles foi permitido/conhecido, retorna 400
        if (Object.keys(updates).length > 0) {
             request.log.warn({ userId, updates }, 'No allowed or known fields provided in update request');
             return reply.status(400).send({ message: 'Nenhum campo válido fornecido para atualização ou você não tem permissão para atualizar os campos enviados.' });
        } else {
            // Se a requisição estava vazia, não há nada para fazer. Retorna 400.
            request.log.warn({ userId }, 'Empty update request received');
            return reply.status(400).send({ message: 'Nenhum dado fornecido para atualização.' });
        }
    }

    // 5. Constrói o objeto final de dados para o Prisma
    // Começa com os campos que passaram na validação de permissão
    const finalDataToUpdate = { ...allowedUpdates };

    // Lógica específica para o status 'purchased' e campos relacionados ('purchasedBy', 'purchasedAt')
    // Esta lógica só é aplicada se o campo 'purchased' estava entre os allowedUpdates (ou seja, o usuário tinha permissão para mudá-lo E ele foi enviado)
    if (allowedUpdates.hasOwnProperty('purchased') && allowedUpdates.purchased !== undefined) {
        const newPurchasedStatus = allowedUpdates.purchased;
        const oldPurchasedStatus = currentItem.purchased;

        if (newPurchasedStatus === true && oldPurchasedStatus === false) { // O item está sendo marcado como comprado AGORA
            finalDataToUpdate.purchasedAt = new Date(); // Define a data/hora atual
            finalDataToUpdate.purchasedById = userId; // Define o usuário logado como quem comprou

            // Se o 'actualPrice' NÃO foi enviado na requisição (com null ou valor > 0)
            // E o item NÃO tinha um preço real antes, usa o priceLimit como fallback.
            // Isso cobre o cenário de um clique rápido no toggle sem input de preço.
             if (!allowedUpdates.hasOwnProperty('actualPrice') || allowedUpdates.actualPrice === undefined) {
                  // Verifica se o actualPrice já existia no item antes. Se não, usa priceLimit. Se já existia, mantém o antigo.
                  // A linha `finalDataToUpdate = { ...allowedUpdates };` já copiou o `actualPrice` original se ele existia E não foi enviado no payload.
                  // Se `actualPrice` foi enviado explicitamente como `null` ou `valor > 0`, ele está em `finalDataToUpdate` e essa lógica de fallback não se aplica.
                  if (currentItem.actualPrice === null || currentItem.actualPrice === undefined) {
                       finalDataToUpdate.actualPrice = currentItem.priceLimit; // Usa priceLimit como fallback se não tinha actualPrice
                  }
             }
             // Se 'actualPrice' foi enviado em 'updates', o valor (pode ser null, 0, >0) já está em finalDataToUpdate. Isso está correto.

        } else if (newPurchasedStatus === false && oldPurchasedStatus === true) { // O item está sendo desmarcado como comprado AGORA
            // Zera os campos relacionados à compra
            finalDataToUpdate.purchasedAt = null;
            finalDataToUpdate.purchasedById = null;
            // Ao desmarcar, o preço real também DEVE ser zerado, a menos que uma lógica diferente seja explicitamente desejada.
            // Forçamos o actualPrice para null aqui, sobrescrevendo qualquer valor de actualPrice que possa ter vindo em `allowedUpdates` *neste cenário específico de desmarcar*.
            finalDataToUpdate.actualPrice = null;
        }
        // Se newPurchasedStatus === oldPurchasedStatus (usuário clicou no toggle mas o status já era aquele),
        // a lógica acima não muda purchasedBy/purchasedAt/actualPrice. OK.
    } else {
        // Se o campo 'purchased' NÃO foi enviado nos updates permitidos,
        // garantimos que purchasedBy e purchasedAt são limpos se o item não está comprado atualmente.
        // Isso lida com edições de outros campos (notas, categoria) em itens NÃO comprados.
        if (!currentItem.purchased) {
             finalDataToUpdate.purchasedBy = null;
             finalDataToUpdate.purchasedAt = null;
             // Não zera actualPrice aqui, mantém o valor se existir (pode ter sido preenchido manualmente).
        }
         // Se o item está comprado E 'purchased' não foi enviado, purchasedBy/purchasedAt/actualPrice permanecem como estão.
    }


    request.log.info({ finalDataToUpdate, itemId }, 'Final data for Prisma update'); // Log dos dados finais antes do update

    // 6. Executa a atualização no banco de dados
    const updatedItem = await prisma.item.update({
      where: { id: itemId, listId: listId }, // Garante que o item pertence à lista
      data: finalDataToUpdate, // Usa apenas os dados validados e finalizados
      include: {
        purchasedBy: { select: { id: true, name: true } } // Inclui quem comprou na resposta
      }
    });

    request.log.info({ updatedItem }, 'Item updated successfully'); // Log de sucesso
    return reply.status(200).send(updatedItem); // Retorna o item atualizado

  } catch (error) {
    request.log.error({ error, listId, itemId, userId }, 'UNEXPECTED Error during item update'); // Log de erro inesperado
    return reply.status(500).send({ message: 'Erro interno ao atualizar item.' });
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