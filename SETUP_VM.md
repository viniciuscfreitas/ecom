# Setup na Máquina Virtual - Guia Rápido

## 1. Instalar Docker e Docker Compose (se ainda não tiver)

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose Plugin
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Verificar instalação
docker --version
docker compose version
```

## 2. Navegar para o diretório do projeto

```bash
cd ~/www/ecom
```

## 3. Criar arquivo .env na raiz do projeto

```bash
nano .env
```

**Cole o seguinte conteúdo (ajuste conforme necessário):**

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=SUA_SENHA_SEGURA_AQUI
POSTGRES_DB=ecom

# Backend
JWT_SECRET=SUA_CHAVE_SECRETA_JWT_AQUI
ABACATEPAY_API_KEY=SUA_CHAVE_API_ABACATEPAY
ABACATEPAY_WEBHOOK_SECRET=SUA_SECRET_WEBHOOK_ABACATEPAY

# Frontend (ajuste com o IP ou domínio da sua VM)
NEXT_PUBLIC_API_URL=http://SEU_IP_OU_DOMINIO:3001/api
```

**Salve com `Ctrl+O`, `Enter`, `Ctrl+X`**

## 4. Rodar pela primeira vez

```bash
# Buildar e subir os containers
docker compose -f docker-compose.prod.yml up -d --build

# Aguardar alguns segundos para o banco inicializar
sleep 10

# Gerar Prisma Client
docker compose -f docker-compose.prod.yml exec backend npm run prisma:generate

# Rodar migrations
docker compose -f docker-compose.prod.yml exec backend npm run prisma:migrate deploy

# Popular banco com dados iniciais (admin e produtos)
docker compose -f docker-compose.prod.yml exec backend npm run prisma:seed
```

## 5. Verificar se está rodando

```bash
# Ver status dos containers
docker compose -f docker-compose.prod.yml ps

# Ver logs (opcional)
docker compose -f docker-compose.prod.yml logs -f
```

## 6. Acessar a aplicação

- **Frontend**: `http://SEU_IP:3000`
- **Backend API**: `http://SEU_IP:3001/api`
- **Admin Login**: `http://SEU_IP:3000/admin/login`
  - Email: `admin@petshop.com`
  - Senha: `admin123`

## 7. Configurar CI/CD (GitHub Actions) - OPCIONAL

O CI/CD já está configurado! Só precisa adicionar os secrets no GitHub:

1. Vá em: https://github.com/viniciuscfreitas/ecom/settings/secrets/actions
2. Adicione os seguintes secrets:
   - `VM_HOST`: IP da sua VM
   - `VM_USER`: usuário SSH (ex: `vinicius` ou `root`)
   - `VM_SSH_KEY`: chave privada SSH (gerar com `ssh-keygen` se não tiver)

**Depois disso, cada push na branch `main` vai fazer deploy automático!**

## Comandos úteis

```bash
# Parar tudo
docker compose -f docker-compose.prod.yml down

# Parar e remover volumes (CUIDADO: apaga dados do banco!)
docker compose -f docker-compose.prod.yml down -v

# Ver logs
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend

# Rebuildar e subir
docker compose -f docker-compose.prod.yml up -d --build

# Atualizar código (se não usar CI/CD)
cd ~/www/ecom
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
```

## Troubleshooting

**Erro de permissão Docker:**
```bash
sudo usermod -aG docker $USER
# Depois fazer logout e login novamente
```

**Porta já em uso:**
```bash
# Verificar o que está usando a porta
sudo lsof -i :3000
sudo lsof -i :3001
# Matar o processo ou mudar a porta no docker-compose.prod.yml
```

**Erro de conexão com banco:**
```bash
# Verificar se o banco está rodando
docker compose -f docker-compose.prod.yml ps postgres
# Ver logs do banco
docker compose -f docker-compose.prod.yml logs postgres
```

