"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const crypto_1 = __importDefault(require("crypto"));
const Purchase_1 = __importDefault(require("../models/Purchase"));
const router = express_1.default.Router();
const verifyPaystackSignature = (req, res, next) => {
    const hash = crypto_1.default
        .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET)
        .update(JSON.stringify(req.body))
        .digest('hex');
    if (hash !== req.headers['x-paystack-signature']) {
        return res.status(400).json({
            success: false,
            message: 'Invalid webhook signature',
        });
    }
    return next();
};
router.post('/paystack', verifyPaystackSignature, async (req, res) => {
    try {
        const event = req.body;
        console.log('Paystack webhook received:', event.event);
        switch (event.event) {
            case 'charge.success':
                await handleSuccessfulPayment(event.data);
                break;
            case 'charge.failed':
                await handleFailedPayment(event.data);
                break;
            case 'subscription.create':
                console.log('Subscription created:', event.data);
                break;
            default:
                console.log('Unhandled webhook event:', event.event);
        }
        res.json({ success: true, message: 'Webhook processed successfully' });
    }
    catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process webhook'
        });
    }
});
const handleSuccessfulPayment = async (data) => {
    try {
        const { reference, amount, customer, metadata } = data;
        const purchase = await Purchase_1.default.findOne({ paystackReference: reference });
        if (!purchase) {
            console.error('Purchase not found for reference:', reference);
            return;
        }
        purchase.status = 'successful';
        purchase.paystackTransactionId = data.id.toString();
        await purchase.save();
        console.log('Payment successful for purchase:', purchase._id);
    }
    catch (error) {
        console.error('Error handling successful payment:', error);
    }
};
const handleFailedPayment = async (data) => {
    try {
        const { reference } = data;
        const purchase = await Purchase_1.default.findOne({ paystackReference: reference });
        if (!purchase) {
            console.error('Purchase not found for reference:', reference);
            return;
        }
        purchase.status = 'failed';
        await purchase.save();
        console.log('Payment failed for purchase:', purchase._id);
    }
    catch (error) {
        console.error('Error handling failed payment:', error);
    }
};
router.get('/paystack', (req, res) => {
    res.json({
        success: true,
        message: 'Webhook endpoint is active'
    });
});
exports.default = router;
//# sourceMappingURL=webhooks.js.map