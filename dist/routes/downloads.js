"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Purchase_1 = __importDefault(require("../models/Purchase"));
const Download_1 = __importDefault(require("../models/Download"));
const security_1 = require("../middleware/security");
const validation_1 = require("../utils/validation");
const router = express_1.default.Router();
router.use(security_1.downloadLimiter);
router.post('/verify', validation_1.validateDownload, async (req, res) => {
    try {
        const { token } = req.body;
        const purchase = await Purchase_1.default.findOne({
            downloadToken: token,
            status: 'successful'
        }).populate('bookId');
        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: 'Invalid download token'
            });
        }
        if (new Date() > purchase.downloadExpiresAt) {
            return res.status(410).json({
                success: false,
                message: 'Download link has expired'
            });
        }
        if (purchase.downloadCount >= purchase.maxDownloads) {
            return res.status(429).json({
                success: false,
                message: 'Maximum download limit reached'
            });
        }
        const book = purchase.bookId;
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }
        return res.json({
            success: true,
            data: {
                downloadUrl: book.pdfUrl,
                bookTitle: book.title,
                bookImage: book.imageUrl,
                downloadsRemaining: purchase.maxDownloads - purchase.downloadCount,
                expiresAt: purchase.downloadExpiresAt
            },
            message: 'Download token verified successfully'
        });
    }
    catch (error) {
        console.error('Error verifying download token:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to verify download token'
        });
    }
});
router.post('/complete', validation_1.validateDownload, async (req, res) => {
    try {
        const { token } = req.body;
        const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
        const userAgent = req.get('User-Agent') || 'unknown';
        const purchase = await Purchase_1.default.findOne({
            downloadToken: token,
            status: 'successful'
        });
        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: 'Invalid download token'
            });
        }
        if (new Date() > purchase.downloadExpiresAt) {
            return res.status(410).json({
                success: false,
                message: 'Download link has expired'
            });
        }
        if (purchase.downloadCount >= purchase.maxDownloads) {
            return res.status(429).json({
                success: false,
                message: 'Maximum download limit reached'
            });
        }
        purchase.downloadCount += 1;
        await purchase.save();
        const download = new Download_1.default({
            purchaseId: purchase._id,
            downloadToken: token,
            ipAddress,
            userAgent
        });
        await download.save();
        return res.json({
            success: true,
            data: {
                downloadsRemaining: purchase.maxDownloads - purchase.downloadCount,
                expiresAt: purchase.downloadExpiresAt
            },
            message: 'Download recorded successfully'
        });
    }
    catch (error) {
        console.error('Error recording download:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to record download'
        });
    }
});
router.get('/history/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const purchase = await Purchase_1.default.findOne({
            downloadToken: token,
            status: 'successful',
        }).populate('bookId');
        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: 'Invalid download token',
            });
        }
        const downloads = await Download_1.default.find({ purchaseId: purchase._id })
            .sort({ downloadedAt: -1 })
            .select('downloadedAt ipAddress userAgent');
        return res.json({
            success: true,
            data: {
                purchase: {
                    id: purchase._id,
                    bookTitle: purchase.bookId?.title,
                    customerEmail: purchase.customerEmail,
                    downloadCount: purchase.downloadCount,
                    maxDownloads: purchase.maxDownloads,
                    expiresAt: purchase.downloadExpiresAt,
                },
                downloads,
            },
        });
    }
    catch (error) {
        console.error('Error fetching download history:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch download history',
        });
    }
});
exports.default = router;
//# sourceMappingURL=downloads.js.map