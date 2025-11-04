import AbacatePay from 'abacatepay-nodejs-sdk';
import { randomUUID } from 'crypto';
import crypto from 'crypto';

export interface PaymentResult {
  id: string;
  status: string;
  qrCode?: string;
  pixKey?: string;
}

export const isMockPayment = () => {
  const useMock = process.env.USE_MOCK_PAYMENT === 'true';
  const hasApiKey = !!process.env.ABACATEPAY_API_KEY;
  return useMock || !hasApiKey;
};

const getAbacateClient = () => {
  const apiKey = process.env.ABACATEPAY_API_KEY;
  if (!apiKey) {
    throw new Error('ABACATEPAY_API_KEY environment variable is required');
  }
  return AbacatePay(apiKey);
};

const mapStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'PENDING': 'pending',
    'PAID': 'paid',
    'EXPIRED': 'expired',
    'CANCELLED': 'expired',
    'REFUNDED': 'paid'
  };
  return statusMap[status] || 'pending';
};

export async function createPayment(
  value: number,
  description: string
): Promise<PaymentResult> {
  if (isMockPayment()) {
    const paymentId = randomUUID();
    const qrCodeBase64 = Buffer.from('MOCK_QR_CODE_BASE64').toString('base64');
    const pixKey = `00020126330014BR.GOV.BCB.PIX0114${paymentId.slice(0, 14)}5204000053039865802BR5913MOCK PAYMENT6009SAO PAULO62070503***6304`;
    
    return {
      id: paymentId,
      status: 'pending',
      qrCode: `data:image/png;base64,${qrCodeBase64}`,
      pixKey: pixKey
    };
  }

  const abacate = getAbacateClient();

  // Valor deve ser em centavos
  const amountInCents = Math.round(value * 100);
  
  // Expira em 1 hora (3600 segundos)
  const expiresIn = 3600;

  const response = await abacate.pixQrCode.create({
    amount: amountInCents,
    description,
    expiresIn
  });

  if (response.error) {
    throw new Error(response.error);
  }

  if ('error' in response && response.error === null && response.data) {
    return {
      id: response.data.id,
      status: mapStatus(response.data.status),
      qrCode: response.data.brCodeBase64,
      pixKey: response.data.brCode
    };
  }

  throw new Error('No data returned from AbacatePay');
}

export async function getPayment(
  paymentId: string
): Promise<PaymentResult> {
  if (isMockPayment()) {
    const qrCodeBase64 = Buffer.from('MOCK_QR_CODE_BASE64').toString('base64');
    const pixKey = `00020126330014BR.GOV.BCB.PIX0114${paymentId.slice(0, 14)}5204000053039865802BR5913MOCK PAYMENT6009SAO PAULO62070503***6304`;
    
    return {
      id: paymentId,
      status: 'pending',
      qrCode: `data:image/png;base64,${qrCodeBase64}`,
      pixKey: pixKey
    };
  }

  const abacate = getAbacateClient();

  const response = await abacate.pixQrCode.check({ id: paymentId });

  if (response.error) {
    throw new Error(response.error);
  }

  if ('error' in response && response.error === null && response.data) {
    return {
      id: response.data.id,
      status: mapStatus(response.data.status),
      qrCode: response.data.brCodeBase64,
      pixKey: response.data.brCode
    };
  }

  throw new Error('No data returned from AbacatePay');
}

export async function processWebhook(
  event: string,
  data: any,
  signature?: string,
  rawBody?: string
): Promise<{ paymentId: string; status: string }> {
  const secret = process.env.ABACATEPAY_WEBHOOK_SECRET;

  if (secret && signature && rawBody) {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new Error('Invalid webhook signature');
    }
  }

  if (event === "billing.paid") {
    return {
      paymentId: data.id,
      status: "paid"
    };
  }

  throw new Error(`Unhandled webhook event: ${event}`);
}

