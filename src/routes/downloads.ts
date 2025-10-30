import express from 'express';
import Purchase from '../models/Purchase';
import Download from '../models/Download';
import Book from '../models/Book';
import { downloadLimiter } from '../middleware/security';
import { validateDownload } from '../utils/validation';

const router = express.Router();

// Apply rate limiting to download routes
router.use(downloadLimiter);

// POST /api/downloads/verify - Verify download token and get download link
router.post('/verify', validateDownload, async (req, res) => {
  try {
    const { token } = req.body;

    // Find purchase with valid token
    const purchase = await Purchase.findOne({ 
      downloadToken: token,
      status: 'successful'
    }).populate('bookId');

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Invalid download token'
      });
    }

    // Check if download has expired
    if (new Date() > purchase.downloadExpiresAt) {
      return res.status(410).json({
        success: false,
        message: 'Download link has expired'
      });
    }

    // Check download count limit
    if (purchase.downloadCount >= purchase.maxDownloads) {
      return res.status(429).json({
        success: false,
        message: 'Maximum download limit reached'
      });
    }

    // Get book details
    const book = purchase.bookId as any;
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

  } catch (error) {
    console.error('Error verifying download token:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify download token'
    });
  }
});

// POST /api/downloads/complete - Record successful download
router.post('/complete', validateDownload, async (req, res) => {
  try {
    const { token } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    // Find purchase with valid token
    const purchase = await Purchase.findOne({ 
      downloadToken: token,
      status: 'successful'
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Invalid download token'
      });
    }

    // Check if download has expired
    if (new Date() > purchase.downloadExpiresAt) {
      return res.status(410).json({
        success: false,
        message: 'Download link has expired'
      });
    }

    // Check download count limit
    if (purchase.downloadCount >= purchase.maxDownloads) {
      return res.status(429).json({
        success: false,
        message: 'Maximum download limit reached'
      });
    }

    // Increment download count
    purchase.downloadCount += 1;
    await purchase.save();

    // Record download activity
    const download = new Download({
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

  } catch (error) {
    console.error('Error recording download:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record download'
    });
  }
});

// GET /api/downloads/history/:token - Get download history for a token
router.get('/history/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Find purchase with valid token
    const purchase = await Purchase.findOne({ 
      downloadToken: token,
      status: 'successful'
    }).populate('bookId');

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Invalid download token'
      });
    }

    // Get download history
    const downloads = await Download.find({ purchaseId: purchase._id })
      .sort({ downloadedAt: -1 })
      .select('downloadedAt ipAddress userAgent');

    return res.json({
      success: true,
      data: {
        purchase: {
          id: purchase._id,
          bookTitle: (purchase.bookId as any)?.title,
          customerEmail: purchase.customerEmail,
          downloadCount: purchase.downloadCount,
          maxDownloads: purchase.maxDownloads,
          expiresAt: purchase.downloadExpiresAt
        },
        downloads: downloads
      }
    });

  } catch (error) {
    console.error('Error fetching download history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch download history'
    });
  }
});

export default router;
