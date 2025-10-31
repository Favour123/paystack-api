"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransaction = exports.verifyPayment = exports.initializePayment = void 0;
const paystack_1 = __importDefault(require("paystack"));
const paystack = new paystack_1.default(process.env.PAYSTACK_SECRET_KEY);
const initializePayment = async (paymentData) => {
    try {
        const response = await paystack.transaction.initialize({
            email: paymentData.email,
            amount: paymentData.amount * 100,
            currency: paymentData.currency || 'USD',
            reference: paymentData.reference,
            metadata: paymentData.metadata
        });
        return response;
    }
    catch (error) {
        console.log('Paystack initialization error:', error);
        throw error;
    }
};
exports.initializePayment = initializePayment;
const verifyPayment = async (reference) => {
    try {
        const response = await paystack.transaction.verify(reference);
        return response;
    }
    catch (error) {
        console.log('Paystack verification error:', error);
        throw error;
    }
};
exports.verifyPayment = verifyPayment;
const getTransaction = async (reference) => {
    try {
        const response = await paystack.transaction.verify(reference);
        return response;
    }
    catch (error) {
        console.error('Paystack verify transaction error:', error);
        throw error;
    }
};
exports.getTransaction = getTransaction;
exports.default = paystack;
//# sourceMappingURL=paystack.js.map