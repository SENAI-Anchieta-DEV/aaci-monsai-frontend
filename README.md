# 🌿 Monsai — Frontend Web

<p align="center">
  Aplicação web para monitoramento integrado da saúde do idoso, consumindo a API Monsai com autenticação segura e visualização em tempo real.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-02502c?style=for-the-badge&logo=react"/>
  <img src="https://img.shields.io/badge/Node.js-18+-227e35?style=for-the-badge&logo=node.js"/>
  <img src="https://img.shields.io/badge/npm-9+-096732?style=for-the-badge&logo=npm"/>
  <img src="https://img.shields.io/badge/Auth-JWT-5cb52d?style=for-the-badge"/>
</p>

---

## 📌 Sobre o Projeto

O **Monsai Frontend Web** é a interface responsável por exibir os dados do sistema de monitoramento, permitindo o acompanhamento da saúde de idosos em tempo real.

💡 Funcionalidades principais:

* 📊 Visualização de dados em tempo real
* 🔐 Autenticação segura com JWT
* 📡 Integração com backend IoT
* 🖥️ Interface moderna e responsiva

---

## 🧠 Arquitetura de Integração

```text
[ Frontend React ]
        │
        ▼
[ Monsai Backend API ]
        │
        ▼
[ PostgreSQL + MQTT ]
```

---

## ⚙️ Pré-requisitos

Antes de rodar o projeto:

* 🟢 Node.js 18+
* 📦 npm 9+
* 🌿 Backend Monsai rodando em `http://localhost:8080 || https://aaci-monsai-backend-mrxp.onrender.com/`

---

## 📁 Setup do Projeto

### 🔽 Clone

```bash
git clone https://github.com/seu-org/aaci-monsai-frontend.git
cd aaci-monsai-frontend
```

## 🚀 Execução

```bash
npm install
npm start
```

A aplicação estará disponível em:

👉 http://localhost:3000

---

## 📡 Integração com Backend

O frontend consome a API Monsai.

### 🔐 Autenticação JWT

Após login:

```text
Authorization: Bearer seu_token
```

---

## 📖 API Docs

* Swagger: http://localhost:8080/swagger-ui/index.html
* OpenAPI: http://localhost:8080/v3/api-docs

---

## ▶️ Scripts Disponíveis

| Comando       | Descrição       |
| ------------- | --------------- |
| npm start     | Desenvolvimento |
| npm run build | Build produção  |
| npm test      | Testes          |
| npm run eject | Ejetar config   |

---

## 📚 Tecnologias

| Tecnologia      | Função      |
| --------------- | ----------- |
| React 19        | UI          |
| React Scripts   | Build       |
| Testing Library | Testes      |
| Web Vitals      | Performance |

---

## 🏗️ Build para Produção

```bash
npm run build
```

### Configurar produção:

```env
REACT_APP_API_URL=https://aaci-monsai-frontend.firebaseapp.com/
```

---

## 🔗 Integração com Sistema Monsai

Este frontend faz parte do ecossistema:

* 📱 Mobile App
* 💻 Frontend Web (este projeto)
* 🤖 IoT
* ☁️ Backend API

---

## 📌 Status

🚧 Em desenvolvimento

---

## 👩‍💻 Autoria

<p align="center">
  <strong>Direitos totalmente reservados a:</strong>
</p>

<p align="center">
  Allan Leal da Luz<br>
  André Gondek Mendes<br>
  Christian Soares Maia<br>
  Izabella Carolina Hermano Alves
</p>

---

## 📄 Licença

Uso educacional.
