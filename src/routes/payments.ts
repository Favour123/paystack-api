import express from 'express';
import Book from '../models/Book';
import Purchase from '../models/Purchase';
import { initializePayment, verifyPayment } from '../config/paystack';
import { generateDownloadToken } from '../utils/encryption';
import { paymentLimiter } from '../middleware/security';
import { validatePaymentInitialize, validatePaymentVerify } from '../utils/validation';

const router = express.Router();

// Apply rate limiting to payment routes
router.use(paymentLimiter);

// POST /api/payments/initialize - Initialize payment
router.post('/initialize', validatePaymentInitialize, async (req, res) => {
  try {
    const { email, amount, bookId, customerName } = req.body;

    // Verify book exists and is active
    const book = await Book.findOne({ _id: bookId, isActive: true });
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found or not available'
      });
    }

    // Verify amount matches book price
    if (amount !== book.price) {
      return res.status(400).json({
        success: false,
        message: 'Amount does not match book price'
      });
    }

    // Generate unique reference
    const reference = `HLP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Initialize payment with Paystack
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

    const paystackResponse = await initializePayment(paymentData);
    
    if (!paystackResponse.status) {
      return res.status(400).json({
        success: false,
        message: 'Failed to initialize payment'
      });
    }

    // Create purchase record
    const downloadToken = generateDownloadToken();
    const downloadExpiresAt = new Date();
    downloadExpiresAt.setDate(downloadExpiresAt.getDate() + 2); // 2 days from now

    const purchase = new Purchase({
      bookId,
      customerEmail: email,
      customerName,
      amount,
      currency: 'USD',
      paystackReference: reference,
      paystackTransactionId: '', // Will be updated when payment is verified
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

  } catch (error) {
    console.error('Error initializing payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to initialize payment'
    });
  }
});

// POST /api/payments/verify - Verify payment
router.post('/verify', validatePaymentVerify, async (req, res) => {
  try {
    const { reference } = req.body;

    // Find purchase record
    const purchase = await Purchase.findOne({ paystackReference: reference });
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase record not found'
      });
    }

    // Verify payment with Paystack
    const verificationResponse = await verifyPayment(reference);
    
    if (!verificationResponse.status || verificationResponse.data.status !== 'success') {
      // Update purchase status to failed
      purchase.status = 'failed';
      await purchase.save();

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Update purchase record with successful payment
    purchase.status = 'successful';
    purchase.paystackTransactionId = verificationResponse.data.id.toString();
    await purchase.save();

    // Get book details
    const book = await Book.findById(purchase.bookId);

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

  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
});

// GET /api/payments/status/:reference - Check payment status
router.get('/status/:reference', async (req, res) => {
  try {
    const { reference } = req.params;

    const purchase = await Purchase.findOne({ paystackReference: reference })
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

  } catch (error) {
    console.error('Error checking payment status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check payment status'
    });
  }
});

export default router;
