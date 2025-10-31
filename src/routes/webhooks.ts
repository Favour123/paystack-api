import express from 'express';
import crypto from 'crypto';
import Purchase from '../models/Purchase';
import Book from '../models/Book';

const router = express.Router();

// Middleware to verify Paystack webhook signature
const verifyPaystackSignature = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET!)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(400).json({
      success: false,
      message: 'Invalid webhook signature',
    });
  }

  return next(); // ✅ Added return
};

// POST /api/webhooks/paystack - Handle Paystack webhooks
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
        // Handle subscription events if needed in the future
        console.log('Subscription created:', event.data);
        break;
      
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    res.json({ success: true, message: 'Webhook processed successfully' });

  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process webhook'
    });
  }
});

// Handle successful payment
const handleSuccessfulPayment = async (data: any) => {
  try {
    const { reference, amount, customer, metadata } = data;
    
    // Find the purchase record
    const purchase = await Purchase.findOne({ paystackReference: reference });
    
    if (!purchase) {
      console.error('Purchase not found for reference:', reference);
      return;
    }

    // Update purchase status
    purchase.status = 'successful';
    purchase.paystackTransactionId = data.id.toString();
    await purchase.save();

    console.log('Payment successful for purchase:', purchase._id);
    
    // Here you could send email notifications, update analytics, etc.
    
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
};

// Handle failed payment
const handleFailedPayment = async (data: any) => {
  try {
    const { reference } = data;
    
    // Find the purchase record
    const purchase = await Purchase.findOne({ paystackReference: reference });
    
    if (!purchase) {
      console.error('Purchase not found for reference:', reference);
      return;
    }

    // Update purchase status
    purchase.status = 'failed';
    await purchase.save();

    console.log('Payment failed for purchase:', purchase._id);
    
    // Here you could send email notifications about failed payment
    
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
};

// GET /api/webhooks/paystack - Verify webhook endpoint (for Paystack verification)
router.get('/paystack', (req, res) => {
  res.json({
    success: true,
    message: 'Webhook endpoint is active'
  });
});

export default router;
