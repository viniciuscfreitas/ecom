# Pet Shop E-commerce MVP

E-commerce simples para pet shop com delivery, seguindo a filosofia Grug Brain (simplicidade acima de tudo).

## Stack

- **Backend**: Node.js + Express + TypeScript + PostgreSQL + Prisma
- **Frontend**: Next.js + TypeScript + TanStack Query
- **Docker**: Docker Compose para desenvolvimento e deploy

## Setup Local

1. Clone o repositório
2. Configure as variáveis de ambiente (veja `.env.example`)
3. Execute `docker-compose up` para subir tudo em modo desenvolvimento

### Desenvolvimento

```bash
docker-compose up
```

### Produção

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Credenciais Admin

- Email: `admin@petshop.com`
- Senha: `admin123`

## Desenvolvimento

### Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Deploy

O CI/CD está configurado via GitHub Actions. A cada push na branch `main`, o deploy é feito automaticamente na VM.

### Configurar Secrets no GitHub

Vá em Settings > Secrets and variables > Actions e adicione:

- `VM_HOST`: IP ou hostname da VM
- `VM_USER`: Usuário SSH (ex: `root` ou `ubuntu`)
- `VM_SSH_KEY`: Chave privada SSH para acesso à VM
- `JWT_SECRET`: Secret para JWT (opcional, mas recomendado para produção)

### Setup na VM

Na VM, instale Docker e Docker Compose:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo apt-get install docker-compose-plugin
```

O deploy automático irá:
1. Fazer pull do código na branch `main`
2. Buildar as imagens Docker
3. Subir os containers
4. Executar migrations do Prisma

