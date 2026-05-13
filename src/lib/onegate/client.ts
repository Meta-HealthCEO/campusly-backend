import axios, { type AxiosInstance, AxiosError } from 'axios';
import { buildAuthHeaders } from './auth.js';
import { OneGateError } from './errors.js';
import type {
  CreatePaymentKeyInput, PaymentKeyResponse,
  ChargeTokenInput, ChargeTokenResponse,
  GatewayTransactionResponse, RefundResponse,
} from './types.js';

export interface OneGateClientConfig {
  baseUrl: string;
  orgId: string;
  salt: string;
  timeoutMs?: number;
}

function toForm(input: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined || v === null) continue;
    params.append(k, String(v));
  }
  return params.toString();
}

export class OneGateClient {
  private http: AxiosInstance;

  constructor(private config: OneGateClientConfig) {
    this.http = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeoutMs ?? 15000,
    });
  }

  private headers(extra?: Record<string, string>): Record<string, string> {
    return { ...buildAuthHeaders({ salt: this.config.salt, orgId: this.config.orgId }), ...(extra ?? {}) };
  }

  private formHeaders(): Record<string, string> {
    return this.headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
  }

  private async wrap<T>(promise: Promise<{ data: T }>): Promise<T> {
    try {
      const res = await promise;
      return res.data;
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const status = err.response?.status ?? 0;
        const body = err.response?.data as Record<string, unknown> | undefined;
        const message = (body?.message as string) || err.message;
        const code = (body?.code as string | number) ?? null;
        throw new OneGateError(status, code, message, body);
      }
      throw err;
    }
  }

  async createPaymentKey(input: CreatePaymentKeyInput): Promise<PaymentKeyResponse> {
    return this.wrap(this.http.post<PaymentKeyResponse>('/api/v2/payment-key', toForm(input as never), { headers: this.formHeaders() }));
  }

  async chargeToken(guid: string, input: ChargeTokenInput): Promise<ChargeTokenResponse> {
    return this.wrap(this.http.post<ChargeTokenResponse>(`/api/v2/customer-token/${guid}/pay`, toForm(input as never), { headers: this.formHeaders() }));
  }

  async getTransaction(id: number): Promise<GatewayTransactionResponse> {
    return this.wrap(this.http.get<GatewayTransactionResponse>(`/api/v2/gateway-transaction/${id}`, { headers: this.headers() }));
  }

  async refundTransaction(id: number, amount?: number): Promise<RefundResponse> {
    const body = amount != null ? toForm({ amount }) : '';
    return this.wrap(this.http.put<RefundResponse>(`/api/v2/gateway-transaction/${id}/refund`, body, { headers: this.formHeaders() }));
  }
}
