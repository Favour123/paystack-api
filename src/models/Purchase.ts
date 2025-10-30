import mongoose, { Document, Schema } from 'mongoose';

export interface IPurchase extends Document {
  bookId: mongoose.Types.ObjectId;
  customerEmail: string;
  customerName: string;
  amount: number;
  currency: string;
  paystackReference: string;
  paystackTransactionId: string;
  status: 'pending' | 'successful' | 'failed' | 'cancelled';
  downloadToken: string;
  downloadExpiresAt: Date;
  downloadCount: number;
  maxDownloads: number;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseSchema = new Schema<IPurchase>({
  bookId: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  customerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  paystackReference: {
    type: String,
    required: true,
    unique: true
  },
  paystackTransactionId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'successful', 'failed', 'cancelled'],
    default: 'pending'
  },
  downloadToken: {
    type: String,
    required: true,
    unique: true
  },
  downloadExpiresAt: {
    type: Date,
    required: true
  },
  downloadCount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxDownloads: {
    type: Number,
    default: 3
  }
}, {
  timestamps: true
});

// Indexes for better query performance
PurchaseSchema.index({ paystackReference: 1 });
PurchaseSchema.index({ downloadToken: 1 });
PurchaseSchema.index({ customerEmail: 1 });
PurchaseSchema.index({ status: 1, downloadExpiresAt: 1 });

export default mongoose.model<IPurchase>('Purchase', PurchaseSchema);
