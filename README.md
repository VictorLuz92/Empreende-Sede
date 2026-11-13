# Empreende Sede

Vitrine digital de empresas locais construída conforme o wireframe enviado, utilizando:

- **Visual:** HTML5 e CSS3
- **Frontend:** JavaScript Vanilla
- **Backend:** Java 17 (LTS) + Spring Boot 3.3.5 (LTS-compatible)
- **Banco de Dados:** Supabase (PostgreSQL) — com perfil `dev` em memória (H2) para testes locais imediatos

## Estrutura do Projeto

```text
.
├── backend/                  # API REST Spring Boot (Java 17 LTS)
│   ├── pom.xml
│   ├── .env.example
│   └── src/
├── frontend/                 # Interface HTML, CSS e JavaScript Vanilla
│   ├── index.html
│   ├── css/styles.css
│   └── js/
│       ├── api.js
│       └── app.js
└── supabase/
    └── schema.sql            # Script SQL para criar tabelas e dados no Supabase
```

## 1. Configurando o Banco no Supabase

1. Acesse o **SQL Editor** no painel do seu projeto Supabase.
2. Execute o conteúdo de [`supabase/schema.sql`](supabase/schema.sql).
3. No painel do Supabase (**Project Settings → Database**), copie a string de conexão JDBC (ou host/porta/usuário do Transaction Pooler) e configure as variáveis de ambiente:

```powershell
$env:SPRING_PROFILES_ACTIVE="supabase"
$env:SUPABASE_DB_URL="jdbc:postgresql://SEU_HOST.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0"
$env:SUPABASE_DB_USER="postgres.SEU_PROJETO_REF"
$env:SUPABASE_DB_PASSWORD="SUA_SENHA"
```

## 2. Executando o Backend (Java 17 + Spring Boot)

No diretório `backend/`:

```powershell
# Modo desenvolvimento local (H2 em memória, sem precisar configurar o Supabase)
mvn spring-boot:run

# Ou rodando testes
mvn test
```

A API ficará disponível em `http://localhost:8080/api/companies`.

### Endpoints principais
- `GET /api/companies?q=...&category=...` — Lista e pesquisa empresas ativas
- `GET /api/companies/categories` — Lista categorias distintas
- `GET /api/companies/{id}` — Detalhes de uma empresa
- `POST /api/companies` — Cadastra uma nova empresa
- `PUT /api/companies/{id}` — Atualiza uma empresa
- `DELETE /api/companies/{id}` — Desativa (remove da vitrine) uma empresa

## 3. Executando o Frontend

Abra o arquivo [`frontend/index.html`](frontend/index.html) no navegador (ou via Live Server / servidor estático, por exemplo `npx serve frontend`).

> **Nota:** Caso a API Spring Boot ainda não esteja rodando na porta `8080`, o frontend entra automaticamente em **modo demonstração offline** usando `localStorage`, permitindo visualizar e testar toda a interface imediatamente.
# Empreende-Sede
