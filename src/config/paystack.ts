// import Paystack = require('paystack');
import Paystack from 'paystack';
const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY!);

export interface PaymentData {
  email: string;
  amount: number;
  currency?: string;
  reference?: string;
  metadata?: Record<string, any>;
}

export interface VerifyPaymentResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: Record<string, any>;
    log: any;
    fees: number;
    fees_split: any;
    authorization: any;
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      customer_code: string;
      phone: string;
      metadata: any;
      risk_action: string;
      international_format_phone: string;
    };
    plan: any;
    split: any;
    order_id: any;
    paidAt: string;
    createdAt: string;
    requested_amount: number;
    pos_transaction_data: any;
    source: any;
    fees_breakdown: any;
  };
}

// Initialize payment
export const initializePayment = async (paymentData: PaymentData) => {
  try {
    const response = await paystack.transaction.initialize({
      email: paymentData.email,
      amount: paymentData.amount * 100, // Convert to kobo
      currency: paymentData.currency || 'USD',
      reference: paymentData.reference,
      metadata: paymentData.metadata
    });
    
    return response;
  } catch (error) {
    console.log('Paystack initialization error:', error);
    throw error;
  }
};

// Verify payment
export const verifyPayment = async (reference: string): Promise<VerifyPaymentResponse> => {
  try {
    const response = await paystack.transaction.verify(reference);
    return response;
  } catch (error) {
    console.log('Paystack verification error:', error);
    throw error;
  }
};

// Get transaction details
// ✅ Correct way
export const getTransaction = async (reference: string) => {
  try {
    const response = await paystack.transaction.verify(reference);
    return response;
  } catch (error) {
    console.error('Paystack verify transaction error:', error);
    throw error;
  }
};


export default paystack;
