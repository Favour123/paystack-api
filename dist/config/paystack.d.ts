import Paystack from 'paystack';
declare const paystack: Paystack;
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
export declare const initializePayment: (paymentData: PaymentData) => Promise<any>;
export declare const verifyPayment: (reference: string) => Promise<VerifyPaymentResponse>;
export declare const getTransaction: (reference: string) => Promise<any>;
export default paystack;
//# sourceMappingURL=paystack.d.ts.map