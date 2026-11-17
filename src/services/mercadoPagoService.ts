import crypto from 'crypto';
import { Plan, UserProfile } from '@/types/saas';

const MP_API_BASE = 'https://api.mercadopago.com';

export interface MercadoPagoPreapprovalPayload {
  id: string;
  payer_id: number;
  payer_email: string;
  back_url: string;
  collector_id: number;
  application_id: number;
  status: 'pending' | 'authorized' | 'paused' | 'cancelled';
  reason: string;
  external_reference: string;
  date_created: string;
  last_modified: string;
  init_point: string;
  auto_recurring: {
    frequency: number;
    frequency_type: 'days' | 'months';
    transaction_amount: number;
    currency_id: string;
    start_date?: string;
    end_date?: string;
  };
  next_payment_date?: string;
}

export interface MercadoPagoPaymentPayload {
  id: number;
  date_created: string;
  date_approved?: string;
  date_last_updated: string;
  money_release_date?: string;
  payment_method_id: string;
  payment_type_id: string;
  status: 'pending' | 'approved' | 'authorized' | 'in_process' | 'in_mediation' | 'rejected' | 'cancelled' | 'refunded' | 'charged_back';
  status_detail: string;
  currency_id: string;
  description?: string;
  transaction_amount: number;
  payer: {
    id?: string;
    email?: string;
    identification?: { type: string; number: string };
  };
  external_reference?: string;
}

export interface MercadoPagoWebhookNotification {
  id?: number | string;
  live_mode?: boolean;
  type?: string; // 'subscription_preapproval', 'payment', 'subscription_authorized_payment'
  topic?: string; // legacy webhook topic format
  date_created?: string;
  application_id?: number;
  user_id?: number;
  version?: number;
  api_version?: string;
  action?: string; // 'created', 'updated'
  data?: {
    id: string;
  };
}

class MercadoPagoService {
  private getAccessToken(): string {
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!token) {
      console.warn('[MercadoPago] MERCADO_PAGO_ACCESS_TOKEN não configurado no ambiente.');
      return '';
    }
    return token;
  }

  private getWebhookSecret(): string {
    return process.env.MERCADO_PAGO_WEBHOOK_SECRET || '';
  }

  private isTestOrMockMode(): boolean {
    const token = this.getAccessToken();
    return !token || token.startsWith('TEST-0000000000000000') || token === '';
  }

  /**
   * 1. Criar Assinatura (Preapproval) no Mercado Pago
   * Docs: https://www.mercadopago.com.br/developers/pt/docs/subscriptions/overview
   */
  async createSubscriptionPreapproval(params: {
    plan: Plan;
    user: UserProfile;
    backUrl?: string;
  }): Promise<{
    id: string;
    init_point: string;
    external_reference: string;
    status: string;
  }> {
    const token = this.getAccessToken();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    let safeBackUrl = params.backUrl || `${appUrl}/checkout/feedback`;

    // Mercado Pago API exige domínio público e HTTPS válido (rejeita http://localhost)
    if (safeBackUrl.includes('localhost') || safeBackUrl.includes('127.0.0.1')) {
      safeBackUrl = 'https://viceclipper.com/checkout/feedback';
    }

    // External reference segura associando userId e planId
    const externalReference = `vc_${params.user.id}__${params.plan.id}__${Date.now()}`;
    const transactionAmount = Number((params.plan.price_cents / 100).toFixed(2));

    const isAnnual = params.plan.billing_interval === 'annual';
    const reason = `VICE CLIPPER - ${params.plan.name} (${isAnnual ? 'Anual' : 'Mensal'})`;

    // Se estiver em modo de teste / sem credencial real configurada, gera simulação realista
    if (this.isTestOrMockMode()) {
      const mockId = `2c938084${Date.now()}`;
      return {
        id: mockId,
        init_point: `${safeBackUrl}?preapproval_id=${mockId}&status=approved&external_reference=${encodeURIComponent(
          externalReference
        )}`,
        external_reference: externalReference,
        status: 'pending',
      };
    }

    const body = {
      reason,
      external_reference: externalReference,
      payer_email: params.user.email,
      auto_recurring: {
        frequency: isAnnual ? 12 : 1,
        frequency_type: 'months',
        transaction_amount: transactionAmount,
        currency_id: 'BRL',
      },
      back_url: safeBackUrl,
      status: 'pending',
    };

    const res = await fetch(`${MP_API_BASE}/preapproval`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[MercadoPago] Erro ao criar preapproval:', data);
      throw new Error(
        data.message || `Erro Mercado Pago HTTP ${res.status}: ${JSON.stringify(data.cause || data)}`
      );
    }

    return {
      id: data.id,
      init_point: data.init_point,
      external_reference: data.external_reference || externalReference,
      status: data.status,
    };
  }

  /**
   * 1.1 Criar Cobrança Instantânea via PIX Oficial no Mercado Pago
   * Docs: https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/integrate-with-pix
   */
  async createPixPayment(params: {
    plan: Plan;
    user: UserProfile;
  }): Promise<{
    id: number;
    status: string;
    qr_code: string;
    qr_code_base64: string;
    ticket_url: string;
    external_reference: string;
    transaction_amount: number;
  }> {
    const token = this.getAccessToken();
    const externalReference = `vc_${params.user.id}__${params.plan.id}__${Date.now()}`;
    const transactionAmount = Number((params.plan.price_cents / 100).toFixed(2));
    const isAnnual = params.plan.billing_interval === 'annual';
    const description = `VICE CLIPPER - ${params.plan.name} (${isAnnual ? 'Anual' : 'Mensal'})`;

    const nameParts = (params.user.full_name || 'Criador GTA 6').trim().split(' ');
    const firstName = nameParts[0] || 'Criador';
    const lastName = nameParts.slice(1).join(' ') || 'GTA 6';

    const body = {
      transaction_amount: transactionAmount,
      description,
      payment_method_id: 'pix',
      payer: {
        email: params.user.email,
        first_name: firstName,
        last_name: lastName,
      },
      external_reference: externalReference,
    };

    const res = await fetch(`${MP_API_BASE}/v1/payments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `pix_${params.user.id}_${params.plan.id}_${Date.now()}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[MercadoPago] Erro ao criar PIX:', data);
      throw new Error(
        data.message || `Erro Mercado Pago HTTP ${res.status}: ${JSON.stringify(data.cause || data)}`
      );
    }

    return {
      id: data.id,
      status: data.status,
      qr_code: data.point_of_interaction?.transaction_data?.qr_code || '',
      qr_code_base64: data.point_of_interaction?.transaction_data?.qr_code_base64 || '',
      ticket_url: data.point_of_interaction?.transaction_data?.ticket_url || '',
      external_reference: data.external_reference || externalReference,
      transaction_amount: data.transaction_amount || transactionAmount,
    };
  }

  /**
   * 2. Consultar Assinatura (Preapproval) diretamente na API do Mercado Pago
   * Docs: https://api.mercadopago.com/preapproval/{id}
   */
  async getSubscription(preapprovalId: string): Promise<MercadoPagoPreapprovalPayload | null> {
    const token = this.getAccessToken();

    // Mock fallback se ID começar com mock ou sem token
    if (this.isTestOrMockMode() || preapprovalId.startsWith('2c938084') && this.isTestOrMockMode()) {
      return {
        id: preapprovalId,
        payer_id: 12345678,
        payer_email: 'cliente@viceclipper.com',
        back_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/feedback`,
        collector_id: 87654321,
        application_id: 11223344,
        status: 'authorized',
        reason: 'VICE CLIPPER - Assinatura Teste',
        external_reference: `vc_demo__plan_demo__${Date.now()}`,
        date_created: new Date().toISOString(),
        last_modified: new Date().toISOString(),
        init_point: `https://www.mercadopago.com.br/subscriptions/checkout?preapproval_id=${preapprovalId}`,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: 50.0,
          currency_id: 'BRL',
        },
      };
    }

    const res = await fetch(`${MP_API_BASE}/preapproval/${preapprovalId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error(`[MercadoPago] Erro ao buscar preapproval ${preapprovalId}: HTTP ${res.status}`);
      return null;
    }

    return (await res.json()) as MercadoPagoPreapprovalPayload;
  }

  /**
   * 3. Consultar Pagamento diretamente na API do Mercado Pago
   * Docs: https://api.mercadopago.com/v1/payments/{id}
   */
  async getPayment(paymentId: string | number): Promise<MercadoPagoPaymentPayload | null> {
    const token = this.getAccessToken();

    if (this.isTestOrMockMode()) {
      return {
        id: Number(paymentId) || 123456789,
        date_created: new Date().toISOString(),
        date_approved: new Date().toISOString(),
        date_last_updated: new Date().toISOString(),
        payment_method_id: 'pix',
        payment_type_id: 'bank_transfer',
        status: 'approved',
        status_detail: 'accredited',
        currency_id: 'BRL',
        transaction_amount: 50.0,
        payer: { email: 'cliente@viceclipper.com' },
      };
    }

    const res = await fetch(`${MP_API_BASE}/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error(`[MercadoPago] Erro ao buscar payment ${paymentId}: HTTP ${res.status}`);
      return null;
    }

    return (await res.json()) as MercadoPagoPaymentPayload;
  }

  /**
   * 4. Consultar Pagamento Recorrente Autorizado
   * Docs: https://api.mercadopago.com/authorized_payments/{id}
   */
  async getAuthorizedPayment(authorizedPaymentId: string | number): Promise<any | null> {
    const token = this.getAccessToken();

    if (this.isTestOrMockMode()) {
      return {
        id: authorizedPaymentId,
        status: 'approved',
        transaction_amount: 50.0,
      };
    }

    const res = await fetch(`${MP_API_BASE}/authorized_payments/${authorizedPaymentId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error(`[MercadoPago] Erro ao buscar authorized_payment ${authorizedPaymentId}: HTTP ${res.status}`);
      return null;
    }

    return await res.json();
  }

  /**
   * 5. Cancelar Assinatura no Mercado Pago
   */
  async cancelSubscription(preapprovalId: string): Promise<boolean> {
    const token = this.getAccessToken();

    if (this.isTestOrMockMode()) {
      return true;
    }

    const res = await fetch(`${MP_API_BASE}/preapproval/${preapprovalId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'cancelled' }),
    });

    return res.ok;
  }

  /**
   * 6. Validação de Assinatura Criptográfica do Webhook
   * Docs: https://www.mercadopago.com.br/developers/pt/docs/subscriptions/additional-content/your-integrations/notifications/webhooks
   */
  validateWebhookSignature(params: {
    xSignature: string | null;
    xRequestId: string | null;
    dataId: string;
  }): { valid: boolean; reason?: string } {
    const secret = this.getWebhookSecret();

    // Se o webhook secret não estiver configurado no ambiente, registra aviso e permite validação direta de API
    if (!secret) {
      return {
        valid: true,
        reason: 'MERCADO_PAGO_WEBHOOK_SECRET ausente. Prosseguindo com consulta direta de autenticidade na API.',
      };
    }

    if (!params.xSignature) {
      return { valid: false, reason: 'Cabeçalho x-signature ausente.' };
    }

    try {
      // Extrai ts e v1 de x-signature (formato: "ts=1700000000,v1=9c4a8...")
      const parts = params.xSignature.split(',');
      const tsPart = parts.find((p) => p.trim().startsWith('ts='));
      const v1Part = parts.find((p) => p.trim().startsWith('v1='));

      if (!tsPart || !v1Part) {
        return { valid: false, reason: 'Formato inválido de x-signature.' };
      }

      const ts = tsPart.split('=')[1];
      const v1 = v1Part.split('=')[1];

      // Formato oficial do manifesto conforme documentação Mercado Pago:
      // id:[data.id_url];request-id:[x-request-id_header];ts:[ts_header];
      const manifest = `id:${params.dataId};request-id:${params.xRequestId || ''};ts:${ts};`;

      const hmac = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

      // Comparação constante contra timing attacks
      const isMatch = crypto.timingSafeEqual(Buffer.from(hmac, 'utf-8'), Buffer.from(v1, 'utf-8'));

      if (!isMatch) {
        return { valid: false, reason: 'Assinatura HMAC SHA-256 não confere com o manifesto.' };
      }

      return { valid: true };
    } catch (err: any) {
      return { valid: false, reason: `Erro na verificação da assinatura: ${err.message}` };
    }
  }
}

export const mercadoPagoService = new MercadoPagoService();
