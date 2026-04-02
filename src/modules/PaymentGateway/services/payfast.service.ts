import crypto from 'crypto';
import type { IGatewayCredentials, IOnlinePayment } from '../model.js';

interface ParentDetails {
  firstName: string;
  lastName: string;
  email: string;
}

export interface PayFastFormData {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first: string;
  name_last: string;
  email_address: string;
  m_payment_id: string;
  amount: string;
  item_name: string;
  signature: string;
}

export interface PayFastPaymentResult {
  formData: PayFastFormData;
  paymentUrl: string;
}

export class PayFastService {
  /**
   * Generate the form data payload that PayFast expects for a redirect-based payment.
   */
  static generatePaymentData(
    credentials: IGatewayCredentials,
    payment: IOnlinePayment,
    parent: ParentDetails,
    itemName: string,
    returnUrl: string,
    cancelUrl: string,
    notifyUrl: string,
  ): PayFastPaymentResult {
    // Build ordered params (PayFast signature order matters)
    const params: Record<string, string> = {
      merchant_id: credentials.merchantId,
      merchant_key: credentials.merchantKey,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: notifyUrl,
      name_first: parent.firstName,
      name_last: parent.lastName,
      email_address: parent.email,
      m_payment_id: String(payment._id),
      amount: (payment.amount / 100).toFixed(2),
      item_name: itemName.slice(0, 100), // PayFast max 100 chars
    };

    // Generate signature: URL-encode all params in order, append passphrase, then MD5
    const signatureString = Object.entries(params)
      .map(([key, val]: [string, string]) => `${key}=${encodeURIComponent(val.trim()).replace(/%20/g, '+')}`)
      .join('&');

    const signatureWithPassphrase = credentials.passphrase
      ? `${signatureString}&passphrase=${encodeURIComponent(credentials.passphrase.trim()).replace(/%20/g, '+')}`
      : signatureString;

    const signature = crypto
      .createHash('md5')
      .update(signatureWithPassphrase)
      .digest('hex');

    const formData = {
      ...params,
      signature,
    } as PayFastFormData;

    const paymentUrl = PayFastService.getPaymentUrl(credentials.sandboxMode);

    return { formData, paymentUrl };
  }

  /**
   * Validate an Instant Transaction Notification (ITN) from PayFast.
   * Checks signature integrity, amount match, and merchant ID match.
   */
  static validateITN(
    data: Record<string, string>,
    credentials: IGatewayCredentials,
    expectedAmount: number,
  ): boolean {
    // 1. Verify merchant_id matches
    if (data.merchant_id !== credentials.merchantId) {
      return false;
    }

    // 2. Verify amount matches (PayFast sends in rands, we store cents)
    const receivedAmount = Math.round(parseFloat(data.amount_gross ?? '0') * 100);
    if (receivedAmount !== expectedAmount) {
      return false;
    }

    // 3. Verify signature
    const receivedSignature = data.signature;
    if (!receivedSignature) {
      return false;
    }

    // Build param string from all fields except signature, in order received
    const paramString = Object.entries(data)
      .filter(([key]: [string, string]) => key !== 'signature')
      .map(([key, val]: [string, string]) => `${key}=${encodeURIComponent(val.trim()).replace(/%20/g, '+')}`)
      .join('&');

    const stringWithPassphrase = credentials.passphrase
      ? `${paramString}&passphrase=${encodeURIComponent(credentials.passphrase.trim()).replace(/%20/g, '+')}`
      : paramString;

    const calculatedSignature = crypto
      .createHash('md5')
      .update(stringWithPassphrase)
      .digest('hex');

    return calculatedSignature === receivedSignature;
  }

  /**
   * Return the PayFast processing URL based on sandbox mode.
   */
  static getPaymentUrl(sandboxMode: boolean): string {
    return sandboxMode
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process';
  }
}
