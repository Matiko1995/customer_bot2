# bot.factory.website Multi-Service Deployment

Date: 2026-04-11

## Topology

Single domain with path prefixes:

- `https://bot.factory.website/` -> current frontend app
- `https://bot.factory.website/identity/` -> tenant-identity-service
- `https://bot.factory.website/indexing/` -> knowledge-indexing-service
- `https://bot.factory.website/runtime/` -> agent-runtime-service
- `https://bot.factory.website/embed/` -> embed-delivery-service

## Server Assumptions

- Linux server
- aaPanel for process and reverse-proxy management
- existing HTTPS certificate already bound to `bot.factory.website`
- MySQL available
- PostgreSQL available and `pgvector` enabled
- local file storage allowed

## Data Ownership

- Tenant Identity: `MySQL` or shared tenant store
- Knowledge Indexing: `PostgreSQL + pgvector`
- Agent Runtime: shared tenant store + indexing DB access
- Embed Delivery: shared tenant store
- Files:
  - `.data/source-assets/`
  - `.data/agent-docs/`
  - `.data/customer-bot-storage.json`

## Recommended Directory Layout

```text
/www/wwwroot/bot.factory.website/
  ├─ app/
  ├─ services/
  │   ├─ tenant-identity-service/
  │   ├─ knowledge-indexing-service/
  │   ├─ agent-runtime-service/
  │   └─ embed-delivery-service/
  └─ shared/
      ├─ .data/
      ├─ env/
      │   ├─ app.env
      │   ├─ tenant-identity.env
      │   ├─ knowledge-indexing.env
      │   ├─ agent-runtime.env
      │   └─ embed-delivery.env
      └─ logs/
```

## Ports

- frontend app: `3203`
- tenant identity: `3301`
- knowledge indexing: `3302`
- agent runtime: `3303`
- embed delivery: `3304`

## Root App Env

Use `.env.production.example` as the template. The important part is:

```bash
TENANT_IDENTITY_SERVICE_URL=https://bot.factory.website/identity
KNOWLEDGE_INDEXING_SERVICE_URL=https://bot.factory.website/indexing
AGENT_RUNTIME_SERVICE_URL=https://bot.factory.website/runtime
EMBED_DELIVERY_SERVICE_URL=https://bot.factory.website/embed
```

This makes the current frontend/BFF go through service gateways in remote mode.

## aaPanel Reverse Proxy Example

Use the main site `bot.factory.website` and add reverse proxy rules:

```nginx
location /identity/ {
    proxy_pass http://127.0.0.1:3301/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /indexing/ {
    proxy_pass http://127.0.0.1:3302/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /runtime/ {
    proxy_pass http://127.0.0.1:3303/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /embed/ {
    proxy_pass http://127.0.0.1:3304/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location / {
    proxy_pass http://127.0.0.1:3203/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Start Commands

Frontend:

```bash
npm run app:dev
```

Services:

```bash
npm run service:tenant-identity
npm run service:knowledge-indexing
npm run service:agent-runtime
npm run service:embed-delivery
```

## PM2 Startup

Recommended for aaPanel process management:

```bash
npm run deploy:pm2:start
pm2 save
pm2 status
```

After updating code or environment:

```bash
npm run deploy:pm2:reload
```

The ecosystem file is:

- `deploy/pm2/ecosystem.config.cjs`

It includes:

- `customer-bot-app`
- `tenant-identity-service`
- `knowledge-indexing-service`
- `agent-runtime-service`
- `embed-delivery-service`

Before using it online, replace placeholder values in the ecosystem file:

- PostgreSQL connection string
- LLM endpoint and API keys
- shared directory path if different from `/www/wwwroot/bot.factory.website/shared`

## Minimum Online Checklist

1. `tenant-identity-service` starts and `/health` is `200`
2. `knowledge-indexing-service` starts and `/health` is `200`
3. `agent-runtime-service` starts and `/health` is `200`
4. `embed-delivery-service` starts and `/health` is `200`
5. root app starts and `/admin/login` renders
6. root app env points to `/identity /indexing /runtime /embed`
7. HTTPS and reverse proxy are active in aaPanel

## Remaining Secrets You Must Fill

- MySQL connection info for tenant identity
- PostgreSQL connection info for indexing/runtime
- LLM endpoint and API keys
- platform fallback LLM endpoint and API keys
- mail provider config if you want reset mails delivered
