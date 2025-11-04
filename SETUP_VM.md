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

## 2. Verificar portas em uso (ANTES de configurar)

**IMPORTANTE:** Verifique quais portas estão livres antes de configurar o docker-compose!

```bash
# Ver portas dos containers Docker
docker ps --format "table {{.Names}}\t{{.Ports}}" | grep -E '3000|3001|3002|3003|3004'

# OU usar ss (vem instalado por padrão)
ss -tulpn | grep -E ':(3000|3001|3002|3003|3004)'

# OU verificar portas específicas
ss -tulpn | grep :3000 || echo "✅ Porta 3000 livre"
ss -tulpn | grep :3001 || echo "✅ Porta 3001 livre"
ss -tulpn | grep :3002 || echo "✅ Porta 3002 livre"
ss -tulpn | grep :3003 || echo "✅ Porta 3003 livre"
ss -tulpn | grep :3004 || echo "✅ Porta 3004 livre"
```

**Se as portas 3000 e 3001 estiverem ocupadas, você precisará mudar no `docker-compose.prod.yml`:**

```bash
nano docker-compose.prod.yml
```

**Mude as portas (exemplo: usar 3003 e 3004 se estiverem livres):**

```yaml
# Frontend
ports:
  - "3003:3000"  # Mude o primeiro número (esquerda) para uma porta livre

# Backend  
ports:
  - "3004:3001"  # Mude o primeiro número (esquerda) para uma porta livre
```

## 3. Navegar para o diretório do projeto

```bash
cd ~/www/ecom
```

## 4. Criar arquivo .env na raiz do projeto

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

## 5. Rodar pela primeira vez

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

## 6. Verificar se está rodando

```bash
# Ver status dos containers
docker compose -f docker-compose.prod.yml ps

# Ver logs (opcional)
docker compose -f docker-compose.prod.yml logs -f
```

## 7. Acessar a aplicação

- **Frontend**: `http://SEU_IP:3003` (ou porta que você configurou)
- **Backend API**: `http://SEU_IP:3004/api` (ou porta que você configurou)
- **Admin Login**: `http://SEU_IP:3003/admin/login`
  - Email: `admin@petshop.com`
  - Senha: `admin123`

## 8. Configurar CI/CD (GitHub Actions) - OPCIONAL

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

