#  FocusList Server (Backend API)

O **FocusList Server** é a API RESTful que alimenta a aplicação FocusList, gerenciando a persistência de dados, a lógica de negócios e a segurança dos usuários. Desenvolvido com uma arquitetura escalável em Node.js e MariaDB.

---

##  Índice
* [Tecnologias](#-tecnologias)
* [Estrutura do Projeto](#-estrutura-do-projeto)
* [Configuração do Ambiente](#-configuração-do-ambiente)
* [Autenticação](#-autenticação)
* [Endpoints da API](#-endpoints-da-api)
* [Banco de Dados](#-banco-de-dados)
* [Status do Projeto](#-status-do-projeto)

---

##  Tecnologias Utilizadas

A stack foi escolhida para garantir rapidez no desenvolvimento e robustez no tratamento de dados:

* **Runtime:** Node.js
* **Framework:** Express.js
* **Banco de Dados:** MariaDB (MySQL)
* **Segurança:** JWT (JSON Web Tokens) & bcrypt
* **Drivers:** mysql2 & dotenv

---

##  Estrutura do Projeto

A organização segue o padrão de separação de responsabilidades para facilitar a manutenção:

```
src/
├── config/        # Configuração da conexão com banco de dados (database.js)
├── controllers/   # Funções de manipulação de requisições (lógica)
├── middlewares/   # Verificação de tokens e proteção de rotas
├── routes/        # Definição dos caminhos e métodos HTTP
├── utils/         # Utilitários de respostas padronizadas
└── server.js      # Arquivo principal e inicialização do servidor
```

##  Configuração do Ambiente
1. Requisitos
Node.js instalado

Instância do MariaDB/MySQL rodando

2. Variáveis de Ambiente
Crie um arquivo .env na raiz do projeto com as seguintes chaves:

Snippet de código
DB_USER=root
DB_PASSWORD=123
DB_NAME=focuslist
DB_HOST=localhost
DB_PORT=3306

JWT_SECRET=focuslist_super_secret_123

FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173

3. Instalação

### Instalar dependências
npm install

### Iniciar o servidor em modo de desenvolvimento
npm run dev
O servidor estará acessível em: http://localhost:3000

## Endpoints da API

### Auth (Público/Privado)
Método,Rota,Descrição
POST,/api/auth/register,Cria um novo usuário
POST,/api/auth/login,Realiza login e retorna o token
POST,/api/auth/logout,Finaliza a sessão
GET,/api/auth/verificar-token,Valida se o token ainda é válido

### Tarefas (Privado)
Método	Rota	Descrição
GET	/api/tasks	Lista todas as tarefas do usuário logado
POST	/api/tasks	Cria uma nova tarefa
PUT	/api/tasks/:id	Edita uma tarefa existente
DELETE	/api/tasks/:id	Remove uma tarefa