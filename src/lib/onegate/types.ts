export interface CreatePaymentKeyInput {
  payment_type: 'credit_card' | 'eft' | 'all' | 'absa_pay';
  amount: string;
  merchant_reference: string;
  customer_reference?: string;
  success_url?: string;
  error_url?: string;
  cancel_url?: string;
  pending_url?: string;
  notify_url?: string;
  card_token?: string;
}

export interface PaymentKeyResponse {
  key: string;
  url: string;
  origin: string;
}

export interface ChargeTokenInput {
  amount: number;
  reference: string;
  return_url: string;
}

export interface ChargeTokenResult {
  type: 'result';
  success: 0 | 1;
  amount: string;
  reason: string;
  callpay_transaction_id: number;
  organisation_id: number;
  merchant_reference: string;
  gateway_reference: string;
  gateway_response: Record<string, unknown>;
}

export interface ChargeToken3dsRedirect {
  type: '3ds_redirect';
  redirect_url: string;
  gateway_transaction_id: string;
}

export type ChargeTokenResponse = ChargeTokenResult | ChargeToken3dsRedirect;

export interface GatewayTransactionResponse {
  id: number;
  successful: 0 | 1;
  status: string;
  amount: string;
  reason?: string;
  displayAmount: string;
  currency: string;
  merchant_reference: string;
  gateway_reference: string;
  payment_key: string;
  created: string;
  refunded_amount: string;
  refunded: 0 | 1;
  service: string;
  gateway: string;
  gateway_response_parameters: Record<string, unknown>;
  token?: string;
}

export interface RefundResponse {
  success: 0 | 1;
  refunded_amount: string;
  callpay_transaction_id: number;
  reason: string;
}
