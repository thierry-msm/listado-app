# API\_Documentation.md

## 1. ✨ **Visão Geral da API**

A API do **Listado** fornece os recursos de backend para gerenciar listas de compras compartilhadas, autenticação de usuários, colaboração em tempo real, itens comprados e controle de gastos.

- **URL Base da API:**

  ```
  http://localhost:3001/api
  ```

- **Autenticação:**

  - Tipo: Token JWT
  - Como obter: via login (endpoint `/auth/login`)
  - Como enviar: cabeçalho HTTP `Authorization`
  - Exemplo:
    ```http
    Authorization: Bearer seu_token_jwt
    ```

## 2. 🔟 **Códigos de Status HTTP Comuns**

| Código | Significado                     |
| ------ | ------------------------------- |
| 200    | OK - Requisição bem-sucedida    |
| 201    | Created - Recurso criado        |
| 400    | Bad Request - Erro na entrada   |
| 401    | Unauthorized - Não autorizado   |
| 403    | Forbidden - Proibido            |
| 404    | Not Found - Recurso inexistente |
| 409    | Conflict - Conflito de dados    |
| 500    | Internal Server Error           |

## 3. ❌ **Estrutura de Respostas de Erro**

```json
{
  "message": "Mensagem descritiva do erro."
}
```

## 4. 📍 **Endpoints Detalhados**

### 🔐 Autenticação

#### `POST /auth/register` - Registrar novo usuário

Registra um novo usuário no sistema.

##### Parâmetros de entrada

```json
{
  "name": "João",
  "email": "joao@email.com",
  "password": "senha123"
}
```

##### Exemplo de resposta (201):

```json
{
  "user": {
    "id": "uuid",
    "name": "João",
    "email": "joao@email.com",
    "createdAt": "2025-06-25T00:00:00.000Z"
  },
  "token": "jwt_token",
  "message": "Usuário cadastrado com sucesso!"
}
```

---

#### `POST /auth/login` - Login do usuário

Autentica o usuário e retorna um token JWT.

##### Parâmetros de entrada

```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

##### Exemplo de resposta (200):

```json
{
  "user": {
    "id": "uuid",
    "name": "João",
    "email": "joao@email.com"
  },
  "token": "jwt_token",
  "message": "Login realizado com sucesso!"
}
```

---

#### `GET /auth/profile` - Obter perfil do usuário autenticado

Retorna os dados do usuário autenticado.

##### Headers:

```http
Authorization: Bearer jwt_token
```

##### Exemplo de resposta (200):

```json
{
  "user": {
    "id": "uuid",
    "name": "João",
    "email": "joao@email.com",
    "createdAt": "2025-06-25T00:00:00.000Z"
  }
}
```

---

#### `PATCH /auth/profile` - Atualizar perfil do usuário

Permite atualizar nome e senha.

##### Parâmetros de entrada

```json
{
  "name": "João da Silva",
  "oldPassword": "senha123",
  "newPassword": "novaSenha456"
}
```

##### Exemplo de resposta (200):

```json
{
  "message": "Perfil atualizado com sucesso."
}
```

---

### 📋 Listas de Compras

#### `GET /lists` - Listar todas as listas

Retorna as listas criadas ou compartilhadas com o usuário.

##### Exemplo de resposta (200):

```json
[
  {
    "id": "uuid",
    "name": "Supermercado",
    "description": "Compras do mês",
    "createdAt": "2025-06-25T00:00:00.000Z"
  }
]
```

---

#### `POST /lists` - Criar nova lista

##### Parâmetros de entrada

```json
{
  "name": "Nova Lista",
  "description": "Lista semanal"
}
```

##### Exemplo de resposta (201):

```json
{
  "id": "uuid",
  "name": "Nova Lista",
  "description": "Lista semanal",
  "createdAt": "2025-06-25T00:00:00.000Z"
}
```

---

#### `GET /lists/:id` - Obter detalhes de uma lista

##### Exemplo de resposta (200):

```json
{
  "id": "uuid",
  "name": "Supermercado",
  "description": "Compras do mês",
  "items": [...],
  "collaborations": [...]
}
```

---

#### `PATCH /lists/:id` - Atualizar uma lista

##### Parâmetros de entrada

```json
{
  "name": "Lista Atualizada",
  "description": "Nova descrição"
}
```

---

#### `DELETE /lists/:id` - Remover uma lista

Retorna 204 em caso de sucesso.

---

### 🛒 Itens

#### `GET /items/:listId` - Listar itens da lista

##### Exemplo de resposta (200):

```json
[
  {
    "id": "itemId",
    "name": "Arroz",
    "quantity": 2,
    "purchased": false
  }
]
```

---

#### `POST /items` - Adicionar item à lista

##### Parâmetros de entrada

```json
{
  "name": "Feijão",
  "quantity": 1,
  "listId": "uuid"
}
```

---

#### `PATCH /items/:itemId` - Atualizar item

##### Parâmetros de entrada

```json
{
  "quantity": 3,
  "purchased": true
}
```

---

#### `DELETE /items/:itemId` - Remover item da lista

Retorna 204 em caso de sucesso.

---

### 👥 Colaborações

#### `POST /collaborations` - Convidar colaborador

##### Parâmetros de entrada

```json
{
  "email": "amigo@email.com",
  "listId": "uuid",
  "role": "collaborator"
}
```

---

#### `GET /collaborations/:listId` - Listar colaboradores

##### Exemplo de resposta (200):

```json
[
  {
    "user": {
      "id": "uuid",
      "name": "Maria"
    },
    "role": "collaborator"
  }
]
```

---

#### `DELETE /collaborations/:collabId` - Remover colaborador

Retorna 204 em caso de sucesso.

---

### 🔔 Notificações

#### `GET /notifications` - Listar notificações

##### Exemplo de resposta (200):

```json
[
  {
    "id": "uuid",
    "title": "Item comprado",
    "read": false,
    "createdAt": "2025-06-25T00:00:00.000Z"
  }
]
```

---

#### `PATCH /notifications/:id/read` - Marcar notificação como lida

##### Exemplo de resposta (200):

```json
{
  "message": "Notificação marcada como lida."
}
```

---

## 💡 Observações Finais

- Todas as rotas autenticadas requerem o envio do token JWT no cabeçalho `Authorization`.
- A estrutura dos modelos segue o schema Prisma presente no backend.

