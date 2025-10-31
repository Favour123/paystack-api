"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Book_1 = __importDefault(require("../models/Book"));
const Purchase_1 = __importDefault(require("../models/Purchase"));
const paystack_1 = require("../config/paystack");
const encryption_1 = require("../utils/encryption");
const security_1 = require("../middleware/security");
const validation_1 = require("../utils/validation");
const router = express_1.default.Router();
router.use(security_1.paymentLimiter);
router.post('/initialize', validation_1.validatePaymentInitialize, async (req, res) => {
    try {
        const { email, amount, bookId, customerName } = req.body;
        const book = await Book_1.default.findOne({ _id: bookId, isActive: true });
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found or not available'
            });
        }
        if (amount !== book.price) {
            return res.status(400).json({
                success: false,
                message: 'Amount does not match book price'
            });
        }
        const reference = `HLP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const paymentData = {
            email,
            amount,
            currency: 'USD',
            reference,
            metadata: {
                bookId: bookId,
                customerName: customerName,
                bookTitle: book.title
            }
        };
        const paystackResponse = await (0, paystack_1.initializePayment)(paymentData);
        if (!paystackResponse.status) {
            return res.status(400).json({
                success: false,
                message: 'Failed to initialize payment'
            });
        }
        const downloadToken = (0, encryption_1.generateDownloadToken)();
        const downloadExpiresAt = new Date();
        downloadExpiresAt.setDate(downloadExpiresAt.getDate() + 2);
        const purchase = new Purchase_1.default({
            bookId,
            customerEmail: email,
            customerName,
            amount,
            currency: 'USD',
            paystackReference: reference,
            paystackTransactionId: '',
            status: 'pending',
            downloadToken,
            downloadExpiresAt
        });
        await purchase.save();
        return res.json({
            success: true,
            data: {
                authorizationUrl: paystackResponse.data.authorization_url,
                accessCode: paystackResponse.data.access_code,
                reference: paystackResponse.data.reference,
                book: {
                    id: book._id,
                    title: book.title,
                    price: book.price,
                    imageUrl: book.imageUrl
                }
            },
            message: 'Payment initialized successfully'
        });
    }
    catch (error) {
        console.error('Error initializing payment:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to initialize payment'
        });
    }
});
router.post('/verify', validation_1.validatePaymentVerify, async (req, res) => {
    try {
        const { reference } = req.body;
        const purchase = await Purchase_1.default.findOne({ paystackReference: reference });
        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: 'Purchase record not found'
            });
        }
        const verificationResponse = await (0, paystack_1.verifyPayment)(reference);
        if (!verificationResponse.status || verificationResponse.data.status !== 'success') {
            purchase.status = 'failed';
            await purchase.save();
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            });
        }
        purchase.status = 'successful';
        purchase.paystackTransactionId = verificationResponse.data.id.toString();
        await purchase.save();
        const book = await Book_1.default.findById(purchase.bookId);
        return res.json({
            success: true,
            data: {
                purchaseId: purchase._id,
                downloadToken: purchase.downloadToken,
                downloadExpiresAt: purchase.downloadExpiresAt,
                book: {
                    id: book?._id,
                    title: book?.title,
                    imageUrl: book?.imageUrl
                }
            },
            message: 'Payment verified successfully'
        });
    }
    catch (error) {
        console.error('Error verifying payment:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to verify payment'
        });
    }
});
router.get('/status/:reference', async (req, res) => {
    try {
        const { reference } = req.params;
        const purchase = await Purchase_1.default.findOne({ paystackReference: reference })
            .populate('bookId', 'title imageUrl price');
        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: 'Purchase not found'
            });
        }
        return res.json({
            success: true,
            data: {
                status: purchase.status,
                downloadToken: purchase.status === 'successful' ? purchase.downloadToken : null,
                downloadExpiresAt: purchase.status === 'successful' ? purchase.downloadExpiresAt : null,
                book: purchase.bookId
            }
        });
    }
    catch (error) {
        console.error('Error checking payment status:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to check payment status'
        });
    }
});
exports.default = router;
//# sourceMappingURL=payments.js.map