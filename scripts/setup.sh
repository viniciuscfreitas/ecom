#!/bin/bash

set -e

echo "🚀 Setup do Pet Shop E-commerce"

if [ ! -f .env ]; then
  echo "📝 Criando arquivo .env..."
  cp .env.example .env 2>/dev/null || echo "JWT_SECRET=$(openssl rand -hex 32)" > .env
fi

echo "🐳 Iniciando containers Docker..."
docker-compose up -d postgres

echo "⏳ Aguardando PostgreSQL..."
sleep 5

echo "📦 Instalando dependências do backend..."
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
cd ..

echo "📦 Instalando dependências do frontend..."
cd frontend
npm install
cd ..

echo "✅ Setup completo!"
echo ""
echo "Para iniciar em desenvolvimento:"
echo "  docker-compose up"
echo ""
echo "Para iniciar em produção:"
echo "  docker-compose -f docker-compose.prod.yml up -d"

