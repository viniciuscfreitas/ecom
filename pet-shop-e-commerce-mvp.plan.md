<!-- 3a912d66-e820-4d14-aa3c-8bb6e6350710 68a260a5-bd8e-4501-b8fb-8fecd1267c43 -->
# Plano de Integração AbacatePay - Pet Shop E-commerce

## ✅ Avaliação Grug Brain do AbacatePay - APROVADO

**Grug aprova porque:**

- ✅ Taxa fixa R$ 0,80 = SIMPLICIDADE (não calcula %, não varia, previsível)
- ✅ SDK Node.js = mesma stack do backend TypeScript (menos contexto mental)
- ✅ API simples e direta = menos código boilerplate
- ✅ Startup BR = suporte local, entendem mercado brasileiro
- ✅ Foco em PIX = essencial no Brasil (80% dos pagamentos)
- ✅ Escala bem = importante para crescimento
- ✅ Confiança do usuário = essencial

**Grug diz:** "Taxa fixa é MUITO melhor que porcentagem. Simplicidade = previsibilidade! AbacatePay = escolha Grug!"

## Fluxo de Pagamento

1. Cliente preenche checkout → Cria pedido (status: PENDENTE)
2. Sistema gera cobrança PIX via AbacatePay
3. Cliente recebe QR Code / Link PIX
4. Cliente paga → Webhook confirma → Status muda para PREPARANDO
5. Admin vê pedido pago e pode processar

## Mudanças Necessárias

### Schema Prisma (Backend) - SIMPLIFICADO (Grug Brain)

**Adicionar ao model Order (APENAS 2 CAMPOS):**

- `paymentId` (String, nullable) - ID da cobrança no AbacatePay (billing.id)
- `paymentStatus` (String, nullable) - Status do pagamento (usar status do billing: "pending", "paid", "expired")

**Grug diz:** "Não precisa salvar QR Code! AbacatePay retorna na API quando necessário. Menos campos = menos complexidade!"

**Por que não salvar QR Code:**
- AbacatePay retorna QR Code no `billing.create()` e `billing.get()`
- QR Code pode ser grande (JSON)
- Pode expirar (PIX tem validade)
- Buscar da API quando necessário = mais simples

**Por que não usar enum:**
- Status vem direto da API como string
- Mais flexível se AbacatePay adicionar novos status
- Menos complexidade no schema

### Backend - Rotas de Pagamento (COM CUT POINT)

**Novo arquivo: `src/routes/payments.ts`**

- `POST /api/orders/:id/payment` - Criar cobrança PIX via AbacatePay
  - Valida se pedido existe e não tem paymentId ainda (idempotência)
  - Calcula total do pedido
  - Usa `createPayment()` do cut point
  - Salva `paymentId` e `paymentStatus` no pedido
  - Retorna billing completo (com QR Code e PIX key)
- `GET /api/orders/:id/payment` - Buscar cobrança atual (com QR Code se pendente)
  - Usa `getPayment()` do cut point
  - Retorna billing completo
  - Atualiza paymentStatus no pedido se mudou
- `POST /api/webhooks/abacatepay` - Webhook para confirmar pagamento
  - Usa `processWebhook()` do cut point
  - Valida webhook (verificar signature se configurado)
  - Busca pedido por paymentId
  - Se billing.status = "paid", atualiza pedido: paymentStatus = "paid", status = PREPARANDO

**Modificar: `src/routes/orders.ts`**

- Incluir `paymentId` e `paymentStatus` no retorno do GET /orders/:id
- Não precisa criar pagamento automaticamente (cliente faz isso depois)

### Frontend - Página de Pagamento (SEM POLLING - Grug Brain)

**Modificar: `app/checkout/page.tsx`**

- Após criar pedido, redirecionar para `/pagamento/[orderId]`
- NÃO limpar carrinho ainda (limpar só quando pagamento confirmado via webhook)

**Nova página: `app/pagamento/[orderId]/page.tsx`**

- Ao carregar, chamar `POST /api/orders/:id/payment` para criar cobrança
- Exibir QR Code PIX (da resposta da API)
- Exibir chave PIX copia-e-cola (da resposta da API)
- Exibir status do pagamento
- Botão "Verificar Pagamento" (opcional, para caso webhook falhe)
- Redirecionar para `/pedido/[id]` quando pagamento confirmado

**Grug diz:** "Webhook faz tudo! Polling só se webhook falhar. Menos complexidade!"

### Integração AbacatePay (BASEADO NA API REAL)

**Instalar SDK:**

```bash
npm install abacatepay-nodejs-sdk
```

**Nota:** Nome correto do pacote é `abacatepay-nodejs-sdk` (não `@abacatepay/sdk`)

**Configurar variáveis:**

- `ABACATEPAY_API_KEY` - Chave da API (produção/teste)
- `ABACATEPAY_WEBHOOK_SECRET` - Secret para validar webhook (opcional, mas recomendado para produção)

**Estrutura da API AbacatePay:**

```typescript
import AbacatePay from 'abacatepay-nodejs-sdk';

const abacate = new AbacatePay({
  apiKey: process.env.ABACATEPAY_API_KEY,
  devMode: process.env.NODE_ENV !== 'production'
});

// Criar billing (cobrança PIX)
const billing = await abacate.billing.create({
  value: 100.00,
  description: "Pedido #123",
  frequency: "ONE_TIME", // pagamento único
  paymentMethod: "PIX"
});

// Resposta: { data: { id, status, value, qrCode, pixKey, ... }, error: null }

// Buscar billing
const billing = await abacate.billing.get(billingId);

// Webhook recebe: { event: "billing.paid", data: { id, status, ... } }
```

**Implementar:**

1. Criar billing com `abacate.billing.create()` (retorna QR Code e PIX key)
2. Salvar `billing.id` como `paymentId` no pedido
3. Salvar `billing.status` como `paymentStatus` no pedido
4. Exibir QR Code e PIX key da resposta da API
5. Webhook recebe evento `billing.paid` → atualiza pedido

**Estrutura da resposta AbacatePay:**
```typescript
{
  data: {
    id: "billing-id",
    status: "pending" | "paid" | "expired",
    value: 100.00,
    qrCode: "...",
    pixKey: "...",
    ...
  },
  error: null
}
```

## Arquivos a Criar/Modificar (SIMPLIFICADO - Grug Brain)

**Backend:**

- `backend/prisma/schema.prisma` - Adicionar apenas `paymentId` e `paymentStatus` no Order
- `backend/src/lib/payment-gateway.ts` - **Cut point simples** (3 funções, fácil mockar/trocar)
- `backend/src/routes/payments.ts` - Rotas de pagamento (usa `payment-gateway.ts`)
- `backend/src/routes/orders.ts` - Incluir `paymentId` e `paymentStatus` no retorno
- `backend/package.json` - Adicionar `abacatepay-nodejs-sdk`
- `backend/.env.example` - Adicionar `ABACATEPAY_API_KEY`

**Grug diz:** "Cut point em `lib/` não é serviço complexo - são 3 funções simples que isolam complexidade do gateway!"

**Frontend:**

- `frontend/app/pagamento/[orderId]/page.tsx` - Página de pagamento PIX
- `frontend/app/checkout/page.tsx` - Redirecionar para pagamento após criar pedido
- `frontend/app/pedido/[id]/page.tsx` - Exibir status de pagamento

## Fluxo Simplificado (Grug Brain)

1. **Checkout** → Cria pedido (PENDENTE, paymentId: null, paymentStatus: null)
2. **Redireciona** → `/pagamento/[orderId]`
3. **Página carrega** → Chama `POST /api/orders/:id/payment`
4. **Backend cria billing** → AbacatePay retorna QR Code e PIX key
5. **Backend salva** → paymentId e paymentStatus no pedido
6. **Frontend exibe** → QR Code e PIX key (da resposta da API)
7. **Cliente paga** → Webhook recebe `billing.paid`
8. **Backend atualiza** → paymentStatus: "paid", status: PREPARANDO
9. **Frontend redireciona** → `/pedido/[id]` (pode verificar status via polling opcional ou refresh)

**Grug diz:** "Fluxo simples! Webhook faz trabalho pesado. Polling só se necessário!"

## Tratamento de Erros (Simples)

- Se falhar ao criar cobrança → Mostrar erro, permitir tentar novamente
- Se pagamento expirar → Permitir gerar nova cobrança (idempotência garante não duplicar)
- Se webhook falhar → Admin pode marcar como pago manualmente (simples)
- Se API retornar `error` → Tratar no cut point e lançar exceção

## Princípios Grug

1. **Simplicidade primeiro**: Cut point simples, não abstração complexa
2. **Cut point = isolamento**: Gateway isolado em 3 funções, fácil mockar/trocar
3. **Funcionar > Perfeito**: Webhook básico, sem polling inicial
4. **Taxa fixa = previsibilidade**: Não precisa calcular nada
5. **Fazer funcionar, depois melhorar**: Começar com PIX, adicionar outros métodos depois
6. **Testar along the way**: Cut point facilita testes sem mockar SDK inteiro

## Estrutura do Cut Point (payment-gateway.ts)

```typescript
import AbacatePay from 'abacatepay-nodejs-sdk';

// Interface simples (não classe, apenas funções)
export interface PaymentResult {
  id: string;
  status: string;
  qrCode?: string;
  pixKey?: string;
}

export async function createPayment(
  value: number,
  description: string
): Promise<PaymentResult> {
  const abacate = new AbacatePay({
    apiKey: process.env.ABACATEPAY_API_KEY!,
    devMode: process.env.NODE_ENV !== 'production'
  });

  const response = await abacate.billing.create({
    value,
    description,
    frequency: "ONE_TIME",
    paymentMethod: "PIX"
  });

  // AbacatePay retorna { data: {...}, error: null }
  if (response.error) {
    throw new Error(response.error);
  }

  return {
    id: response.data.id,
    status: response.data.status,
    qrCode: response.data.qrCode,
    pixKey: response.data.pixKey
  };
}

export async function getPayment(
  paymentId: string
): Promise<PaymentResult> {
  const abacate = new AbacatePay({
    apiKey: process.env.ABACATEPAY_API_KEY!,
    devMode: process.env.NODE_ENV !== 'production'
  });

  const response = await abacate.billing.get(paymentId);

  if (response.error) {
    throw new Error(response.error);
  }

  return {
    id: response.data.id,
    status: response.data.status,
    qrCode: response.data.qrCode,
    pixKey: response.data.pixKey
  };
}

export async function processWebhook(
  event: string,
  data: any,
  signature?: string
): Promise<{ paymentId: string; status: string }> {
  // Validar signature do webhook se necessário (segurança)
  if (process.env.ABACATEPAY_WEBHOOK_SECRET && signature) {
    // Implementar validação de signature aqui (verificar documentação AbacatePay)
  }

  // Processar evento billing.paid
  if (event === "billing.paid") {
    return {
      paymentId: data.id,
      status: "paid"
    };
  }

  // Outros eventos podem ser ignorados no MVP
  throw new Error(`Unhandled webhook event: ${event}`);
}
```

**Para testes:**

```typescript
// Mock simples
jest.mock('../lib/payment-gateway', () => ({
  createPayment: jest.fn().mockResolvedValue({
    id: 'mock-id',
    status: 'pending',
    qrCode: 'mock-qr',
    pixKey: 'mock-key'
  }),
  getPayment: jest.fn().mockResolvedValue({
    id: 'mock-id',
    status: 'paid',
    qrCode: 'mock-qr',
    pixKey: 'mock-key'
  }),
  processWebhook: jest.fn().mockResolvedValue({
    paymentId: 'mock-id',
    status: 'paid'
  })
}));
```

**Para trocar gateway:**

- Criar novo arquivo `payment-gateway-mercadopago.ts`
- Manter mesma interface (mesmas 3 funções)
- Trocar import em `routes/payments.ts`
- Pronto! Gateway trocado sem tocar no resto do código

## Próximos Passos

1. ✅ Adicionar campos `paymentId` e `paymentStatus` no schema (migration)
2. ✅ Instalar SDK: `npm install abacatepay-nodejs-sdk`
3. ✅ Criar cut point: `src/lib/payment-gateway.ts` (3 funções simples)
4. ✅ Criar rotas: `src/routes/payments.ts` (usa cut point)
5. ✅ Criar página: `app/pagamento/[orderId]/page.tsx`
6. ✅ Implementar webhook com validação de signature
7. ✅ Testar fluxo completo: criar pedido → gerar PIX → pagar → webhook confirma

**Grug Brain diz:** "AbacatePay = taxa fixa + simples + PIX + cut point testável. Perfeito para MVP!"

## Resumo dos Ajustes Finais (Grug Brain)

✅ **Schema simplificado:** Apenas 2 campos (paymentId, paymentStatus)
✅ **Cut point criado:** `lib/payment-gateway.ts` isolado, fácil mockar/trocar
✅ **SDK correto:** `abacatepay-nodejs-sdk` (não `@abacatepay/sdk`)
✅ **Tratamento de erro:** API retorna `{ data, error }` - tratar no cut point
✅ **Webhook seguro:** Validar signature se configurado
✅ **Sem polling inicial:** Webhook faz trabalho, polling só se necessário

**Grug aprova:** "Plano final = simplicidade + testabilidade + flexibilidade. Perfeito!"

