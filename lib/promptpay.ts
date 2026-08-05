import generatePayload from 'promptpay-qr';
import QRCode from 'qrcode';

/**
 * Builds a PromptPay QR code (as a base64 PNG data URL) for the given amount.
 * PROMPTPAY_ID should be set in the environment — a phone number (e.g. 0812345678)
 * or a 13-digit national/tax ID belonging to the receiving account.
 */
export async function generatePromptPayQr(amount: number): Promise<string> {
  const promptpayId = process.env.PROMPTPAY_ID;
  if (!promptpayId) {
    throw new Error('PROMPTPAY_ID is not set in the environment.');
  }
  const payload = generatePayload(promptpayId, { amount });
  return QRCode.toDataURL(payload, { margin: 1, width: 320 });
}
