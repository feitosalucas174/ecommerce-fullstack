# ShopFull — E-commerce Full-Stack

> Plataforma de e-commerce completa com painel administrativo, gestão de estoque, pedidos e relatórios.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Django](https://img.shields.io/badge/Django-4.2-green?logo=django)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)

---

## Visão Geral

O **ShopFull** é um projeto de portfólio que implementa um e-commerce completo em monorepo, cobrindo:

- **Loja pública** — listagem de produtos, carrinho, checkout com simulação de pagamento
- **Painel Admin** — dashboard, CRUD de produtos, gestão de estoque, pedidos, usuários e relatórios com gráficos

---

## Stack

| Camada      | Tecnologia                                    |
|-------------|-----------------------------------------------|
| Frontend    | Next.js 14 · TypeScript · Tailwind CSS        |
| Backend     | Django 4.2 · Django REST Framework            |
| Banco       | PostgreSQL 16                                 |
| Auth        | JWT (djangorestframework-simplejwt)           |
| Gráficos    | Recharts                                      |
| HTTP        | Axios (com refresh automático de token)       |
| Containers  | Docker + Docker Compose                       |

---

## Estrutura do Projeto

```
ecommerce-fullstack/
├── backend/
│   ├── core/           # settings, urls, wsgi
│   ├── products/       # CRUD de produtos e estoque
│   ├── orders/         # pedidos e mock de pagamento
│   ├── users/          # autenticação e gestão de usuários
│   └── reports/        # relatórios de vendas e estoque
├── frontend/
│   └── src/
│       ├── app/        # páginas (App Router Next.js 14)
│       ├── components/ # componentes reutilizáveis
│       ├── contexts/   # AuthContext + CarrinhoContext
│       ├── services/   # axios com interceptors JWT
│       └── types/      # tipagem TypeScript global
└── docker-compose.yml
```

---

## Pré-requisitos

- **Docker + Docker Compose** (recomendado) — ou —
- Python 3.12+ e Node.js 20+ para rodar manualmente

---

## Rodando com Docker (recomendado)

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/ecommerce-fullstack.git
cd ecommerce-fullstack

# Suba todos os serviços (PostgreSQL + Backend + Frontend)
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Django Admin: http://localhost:8000/django-admin

O banco é criado, as migrações rodadas e os dados de demo inseridos automaticamente.

---

## Rodando Manualmente (sem Docker)

### Backend

```bash
cd backend

# Crie e ative o ambiente virtual
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows

# Instale as dependências
pip install -r requirements.txt

# Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais PostgreSQL

# Rode as migrações e popule o banco
python manage.py migrate
python manage.py seed

# Inicie o servidor
python manage.py runserver
```

### Frontend

```bash
cd frontend

# Instale as dependências
npm install

# Configure a URL da API
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Inicie o servidor de desenvolvimento
npm run dev
```

---

## Credenciais de Demo

| Perfil    | Usuário  | Senha       |
|-----------|----------|-------------|
| **Admin** | admin    | admin123    |
| Cliente   | cliente1 | cliente123  |

---

## Endpoints da API

### Autenticação
| Método | Endpoint              | Descrição              |
|--------|-----------------------|------------------------|
| POST   | `/api/auth/login/`    | Login → access + refresh JWT |
| POST   | `/api/auth/register/` | Cadastro de cliente    |
| POST   | `/api/auth/refresh/`  | Renovar access token   |

### Produtos
| Método | Endpoint                      | Acesso  |
|--------|-------------------------------|---------|
| GET    | `/api/products/`              | Público |
| GET    | `/api/products/{id}/`         | Público |
| POST   | `/api/products/`              | Admin   |
| PUT    | `/api/products/{id}/`         | Admin   |
| DELETE | `/api/products/{id}/`         | Admin   |
| PATCH  | `/api/products/{id}/stock/`   | Admin   |

### Pedidos
| Método | Endpoint                      | Acesso        |
|--------|-------------------------------|---------------|
| GET    | `/api/orders/`                | Autenticado   |
| POST   | `/api/orders/`                | Autenticado   |
| GET    | `/api/orders/{id}/`           | Autenticado   |
| PATCH  | `/api/orders/{id}/status/`    | Admin         |
| POST   | `/api/orders/{id}/pay/`       | Autenticado   |

### Relatórios (Admin)
| Endpoint                       | Descrição                              |
|--------------------------------|----------------------------------------|
| `/api/reports/sales/`          | Vendas por dia/semana/mês              |
| `/api/reports/top-products/`   | Top produtos mais vendidos             |
| `/api/reports/stock-alerts/`   | Produtos com estoque crítico           |
| `/api/reports/revenue/`        | Faturamento total e por período        |

---

## Funcionalidades

### Loja
- [x] Home com banner hero, categorias e produtos em destaque
- [x] Listagem com busca full-text e filtro por categoria
- [x] Página de detalhe do produto com seletor de quantidade
- [x] Carrinho com Context API + persistência em localStorage
- [x] Checkout com formulário de endereço + mock de pagamento
- [x] Tela de confirmação com número do pedido
- [x] Histórico de pedidos do usuário logado

### Painel Admin
- [x] Dashboard com cards de receita, pedidos e alertas
- [x] CRUD completo de produtos com modal de criação/edição
- [x] Gestão de estoque com alertas visuais de estoque crítico
- [x] Tabela de pedidos com filtro por status e troca de status inline
- [x] Gestão de usuários com ativar/desativar conta
- [x] Gráfico de vendas por período (Recharts AreaChart)
- [x] Gráfico de top 5 produtos (Recharts BarChart)
- [x] Tabela de alertas de estoque

### Técnico
- [x] JWT com refresh automático (interceptor Axios)
- [x] Proteção de rotas com middleware Next.js
- [x] Loading skeletons em todas as listagens
- [x] Toasts de feedback (react-hot-toast)
- [x] TypeScript estrito no frontend
- [x] CORS configurado para o frontend
- [x] Seed script com 10 produtos, 5 clientes e 20 pedidos
- [x] Docker Compose com volumes persistentes

---

## Screenshots

> _Em breve — rode o projeto e explore!_

| Home | Admin Dashboard | Relatórios |
|------|----------------|------------|
| ![home](docs/home.png) | ![admin](docs/admin.png) | ![reports](docs/reports.png) |

---

## Licença

MIT
