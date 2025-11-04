# Plano Grug Brain para Pet Shop E-commerce + Delivery

## Filosofia: Complexidade MUITO RUIM

## MVP - O que realmente precisa funcionar?

### Fase 1: E-commerce Básico (80% do valor)
- ✅ Catálogo de produtos (foto, nome, preço, estoque)
- ✅ Carrinho de compras (localStorage, depois migrar para backend)
- ✅ Checkout básico (dados cliente + endereço) - SEM autenticação inicial
- ✅ Listagem de pedidos (admin simples)
- ✅ Status de pedido (Pendente, Preparando, Saiu para entrega, Entregue)

### Fase 2: Delivery Básico (20% adicional)
- ✅ Frete fixo por região (ex: Zona 1 = R$ 10, Zona 2 = R$ 15)
- ✅ Seleção de horário de entrega (manhã/tarde fixos)
- ✅ Rastreamento básico (status do pedido)

**Grug Brain diz:**
- Autenticação para ADMIN (necessário proteger painel!)
- SEM autenticação para CLIENTES: pedidos anônimos funcionam perfeitamente
- Carrinho em localStorage primeiro, depois migrar para backend
- Frete fixo por região = mais simples que calcular distância
- Não precisa de Google Maps no MVP

## O que NÃO fazer (por enquanto)

❌ Sistema de cupons/descontos complexos
❌ Múltiplos métodos de pagamento (começar com 1-2)
❌ Sistema de avaliações/reviews
❌ Chat bot
❌ App mobile (por enquanto)
❌ Microserviços
❌ GraphQL
❌ Sistema de notificações push complexo
❌ Dashboard de analytics avançado

## Arquitetura: Monolito Modular Simples

```
Backend (Node.js + Express + TypeScript):
- API REST simples
- PostgreSQL (esquema normalizado)
- Lógica de negócio na aplicação (não views/triggers)
- Autenticação: Apenas para ADMIN (JWT simples ou sessões), clientes SEM autenticação (pedidos anônimos)
- TypeScript = mesma linguagem do frontend (menos complexidade!)

Frontend (Next.js + TypeScript):
- Páginas: Home, Produtos, Carrinho, Checkout, Pedidos
- Componentes reutilizáveis (DRY)
- Mobile-first
- Design minimalista (KISS)
```

## Estratégia de Entrega

**Começar SIMPLES:**
- **Frete fixo por região** (ex: Zona 1 = R$ 10, Zona 2 = R$ 15)
- Horários de entrega fixos (ex: 9h-12h, 14h-18h)
- NÃO calcular distância no MVP

**Adicionar depois (se necessário):**
- Google Maps API para cálculo de distância
- Sistema de roteamento ou otimização de entregas

Grug diz: "começar simples, adicionar complexidade só se realmente precisar"

## Stack Técnica

- Backend: Node.js + Express + TypeScript + PostgreSQL + Prisma
- Frontend: Next.js + TypeScript + Shadcn/ui + TanStack Query
- Autenticação: Apenas para ADMIN (JWT simples ou sessões), clientes SEM autenticação (pedidos anônimos)
- Pagamento: Integrar 1 gateway (ex: Mercado Pago ou Stripe)
- Maps: Começar com frete fixo por região, adicionar Google Maps depois se necessário
- Docker: Adicionar depois, quando for deployar

**Por que TypeScript no backend?**
- Mesma linguagem do frontend = menos contexto mental
- Type safety = menos bugs
- Compartilhar tipos entre frontend/backend = menos retrabalho
- Grug aprova: simplicidade = uma linguagem só!

**Análise Grug Brain da Stack (DX vs Simplicidade):**

**✅ Prisma:** 
- Type-safety automático = menos bugs
- Migrations simples = menos SQL manual
- Queries type-safe = menos erros de runtime
- **Grug diz:** "Se reduz complexidade E melhora DX, usar!"

**✅ TanStack Query:**
- Cache automático = menos código boilerplate
- Loading/error states = menos lógica manual
- Refetch automático = menos código repetitivo
- **Grug diz:** "Se evita reescrever código, usar!"

**✅ Shadcn/ui:**
- Componentes prontos = menos CSS manual
- TypeScript + Tailwind = menos bugs visuais
- Copiar código = sem dependências pesadas
- **Grug diz:** "Copiar código é melhor que escrever do zero!"

**❌ Zustand:**
- Removido do MVP - React state local suficiente no começo
- Adicionar depois se precisar de estado global complexo

**✅ Next.js:**
- Pode ser usado simples (SSR tradicional, não SPA complexo)
- Routing automático = menos configuração

**⚠️ Autenticação:**
- **ADMIN:** PRECISA (proteger painel!) - JWT simples ou sessões básicas
- **CLIENTES:** NÃO precisa - pedidos anônimos funcionam perfeitamente
- **Grug diz:** "Admin precisa de proteção, mas pode ser simples. Clientes não precisam!"

**⚠️ Google Maps:**
- Começar com frete fixo, adicionar depois se necessário

**⚠️ Docker:**
- Não precisa no desenvolvimento inicial
- Adicionar quando for deployar

**Grug Brain Revisado:**
> "DX é importante, MAS complexidade é pior. Porém, algumas ferramentas REDUZEM complexidade ao mesmo tempo que melhoram DX. Essas são OK!"
> 
> "A regra: se a ferramenta evita escrever código repetitivo/boilerplate, ela SIMPLIFICA o projeto. Usar!"

## Princípios Grug

1. **"No" é palavra mágica**: Não adicionar features que não são essenciais
2. **80/20**: 80% do valor com 20% do código
3. **Fatorar depois**: Não criar abstrações prematuras
4. **Testar depois**: Testes após protótipo funcionando
5. **Simplicidade > Perfeição**: Funcionar > Ser perfeito
6. **Protótipo primeiro**: Fazer funcionar, depois melhorar
7. **Adicionar complexidade só se necessário**: Não antecipar problemas

## Próximos Passos

### Fase 0: Protótipo (Fazer funcionar primeiro!)
1. Criar estrutura mínima (backend + frontend)
2. Catálogo de produtos simples (sem fotos inicialmente)
3. Carrinho em localStorage
4. Checkout básico (sem pagamento, só coletar dados)
5. Autenticação básica para admin (proteger painel)
6. **TESTAR**: Pedido completo funcionando end-to-end

### Fase 1: E-commerce Funcional
1. Adicionar fotos de produtos
2. Migrar carrinho para backend
3. Integrar pagamento (1 gateway)
4. Dashboard admin simples para ver pedidos

### Fase 2: Delivery
1. Adicionar cálculo de frete (fixo por região)
2. Seleção de horário de entrega
3. Atualização de status de pedido

### Fase 3: Melhorias (só se necessário!)
- Autenticação para clientes (se precisar de histórico de pedidos)
- Google Maps para cálculo de distância
- Sistema de notificações
- Analytics básico

**Grug Brain diz: "fazer protótipo funcionar primeiro, depois melhorar!"**

