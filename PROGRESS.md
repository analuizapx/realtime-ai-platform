# Progress — realtime-ai-platform

> Documento de acompanhamento. Onde paramos e como rodar o que já existe.
> Última atualização: 21/06/2026. **Backend completo (Partes 1 e 2). Falta frontend (Etapa 3) e entrega (Etapa 4).**

## Rotas do Módulo de IA (Parte 2 — completa)

| Método | Rota | O que faz |
|--------|------|-----------|
| POST | `/inference/frames` | Roda inferência (MockProvider), retorna emotions/ppe/risk |
| GET | `/events/recent?limit=20` | Eventos recentes (painel lateral) |
| GET | `/events/stats` | 3 agregações: EPI %, emoções, tempo entre riscos altos |
| GET | `/health/metrics` | Latência média, taxa de erro, eventos, circuit breaker |
| WS | `ws://localhost:3001` (Socket.IO) | Stream de frames a cada 500ms (auth por token, evento `frame`) |

Testes: `cd backend && npx jest src/inference` → 12 passando.

## Visão geral do projeto

Teste técnico Full Stack (eMiolo / produto Cerebelo.AI). Stack: **NestJS + MongoDB + Nuxt 3 + TypeScript**.
Deadline: **22/06/2026**. Meta: terminar **domingo 21/06**.

Estrutura de pastas:
```
realtime-ai-platform/
├── backend/      → NestJS (em construção)
└── frontend/     → Nuxt 3 (ainda não criado)
```

---

## Como rodar o backend (até agora)

1. Abrir o terminal e carregar o Node:
   ```bash
   source ~/.nvm/nvm.sh
   cd ~/Projetos/realtime-ai-platform/backend
   ```
2. Subir o servidor em modo dev (reinicia sozinho ao salvar):
   ```bash
   npm run start:dev
   ```
3. Esperar aparecer no terminal:
   ```
   Backend running on http://localhost:3001
   ```

> O backend roda na porta **3001** (precisa ser essa por causa do redirect do Google OAuth).
> O `.env` (com as chaves reais) já está configurado e é ignorado pelo Git.

---

## Rotas que JÁ funcionam (Parte 1 completa)

| Método | Rota | O que faz | Auth |
|--------|------|-----------|------|
| GET | `/health` | Confirma que o servidor está de pé | pública |
| GET | `/auth/google` | Inicia o login com Google | pública |
| GET | `/auth/google/callback` | Recebe o Google, cria user, seta cookie | pública |
| GET | `/auth/me` | Dados do usuário logado | JWT cookie |
| GET | `/auth/logout` | Limpa o cookie de login | pública |
| GET | `/users` | Lista todos os usuários cadastrados | JWT cookie |
| GET | `/swapi/people?page=1` | Personagens (paginado) | pública |
| GET | `/swapi/films` | Lista de filmes | pública |

> SWAPI usa o mirror `https://www.swapi.tech/api` (swapi.dev está fora do ar).
> Rotas com "JWT cookie" retornam 401 sem login. Testar login via navegador em /auth/google.

---

## O que já foi feito

### Etapa 0 — Ambiente ✅
Homebrew, Node v20 (via nvm), VS Code, NestJS CLI, Nuxi, Git configurado,
MongoDB Atlas (cluster0, IP liberado para `0.0.0.0/0`), credenciais Google OAuth criadas.

### Etapa 1 — Backend Parte 1 ✅ COMPLETA (21/06)
Login Google OAuth2 testado (usuário salvo no Mongo), /users protegido com JWT,
módulo SWAPI (people + films) funcionando. Auth completo: guards, service, controller, module.

### (histórico) Etapa 1 — detalhes

**Pronto:**
- Scaffold do NestJS + dependências instaladas
- `.env` configurado + `.gitignore` + `.env.example` (com placeholders)
- `main.ts`: CORS, cookie-parser, ValidationPipe, porta 3001
- `app.module.ts`: ConfigModule + conexão MongoDB + UsersModule
- `/health` endpoint
- **Módulo Users completo:**
  - `users/schemas/user.schema.ts` (googleId, email, name, picture)
  - `users/users.service.ts` (`findOrCreate`, `findAll`, `findById`)
  - `users/users.controller.ts` (`GET /users`)
  - `users/users.module.ts`
- **Módulo Auth (PARCIAL):**
  - `auth/strategies/google.strategy.ts` ✅
  - `auth/strategies/jwt.strategy.ts` ✅

---

## CONTINUAR DAQUI (amanhã) 👇

### 1. Terminar o módulo Auth
Ainda falta criar:
- `auth/guards/google-auth.guard.ts` → `AuthGuard('google')`
- `auth/guards/jwt-auth.guard.ts` → `AuthGuard('jwt')`
- `auth/auth.service.ts` → gera o token JWT (usa `JwtService` + `UsersService.findOrCreate`)
- `auth/auth.controller.ts` → rotas:
  - `GET /auth/google` (inicia login)
  - `GET /auth/google/callback` (recebe o Google, cria usuário, seta cookie, redireciona pro frontend)
  - `GET /auth/me` (retorna o usuário logado — protegida por JWT)
  - `GET /auth/logout` (limpa o cookie)
- `auth/auth.module.ts` → importa PassportModule, JwtModule (secret do .env), UsersModule; providers = as 2 strategies + AuthService
- Registrar `AuthModule` no `app.module.ts`

**Como testar o login:** abrir http://localhost:3001/auth/google no navegador → deve redirecionar pro Google → após autorizar, criar o usuário no banco. Depois `GET /users` deve mostrar você na lista.

### 2. Proteger a rota `/users` com JWT
Adicionar `@UseGuards(JwtAuthGuard)` no `users.controller.ts` (depois que o login funcionar).

### 3. Módulo SWAPI (consumir API pública Star Wars)
Criar:
- `swapi/swapi.service.ts` → usa `HttpService` (do @nestjs/axios) para chamar https://swapi.dev/api
  - `getPeople(page)` → `/people`
  - `getFilms()` → `/films`
- `swapi/swapi.controller.ts` → `GET /swapi/people`, `GET /swapi/films`
- `swapi/swapi.module.ts` → importa `HttpModule`
- Registrar no `app.module.ts`

> ⚠️ Verificar se `https://swapi.dev` está no ar. Se estiver fora, usar o mirror `https://swapi.tech/api` (estrutura de resposta é um pouco diferente).

**Como testar:** http://localhost:3001/swapi/people e http://localhost:3001/swapi/films

---

## Depois da Etapa 1 (próximas etapas)
- **Etapa 2:** Módulo de IA (InferenceModule, MockProvider, WebSocket, circuit breaker, agregações Mongo, /health/metrics, testes)
- **Etapa 3:** Frontend Nuxt 3 (login, /users, SWAPI, dashboard com overlay/eventos)
- **Etapa 4:** README final, ADR, 4 questões dissertativas, screenshots, push pro GitHub

---

## ⚠️ PENDÊNCIA DE SEGURANÇA (antes do primeiro push)
As chaves (senha do MongoDB + Google Client Secret) passaram brevemente por um arquivo
versionável. **Antes de subir pro GitHub**, rotacionar:
1. Senha do MongoDB → Atlas → Database Access → Edit → Edit Password
2. Google Client Secret → Google Cloud Console → Clientes → Add secret / remover antigo

E sempre conferir que o `.env` está no `.gitignore` (já está) e que o `.env.example` só tem placeholders (já está).
