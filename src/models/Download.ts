import mongoose, { Document, Schema } from 'mongoose';

export interface IDownload extends Document {
  purchaseId: mongoose.Types.ObjectId;
  downloadToken: string;
  ipAddress: string;
  userAgent: string;
  downloadedAt: Date;
  isExpired: boolean;
}

const DownloadSchema = new Schema<IDownload>({
  purchaseId: {
    type: Schema.Types.ObjectId,
    ref: 'Purchase',
    required: true
  },
  downloadToken: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  downloadedAt: {
    type: Date,
    default: Date.now
  },
  isExpired: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
DownloadSchema.index({ downloadToken: 1 });
DownloadSchema.index({ purchaseId: 1 });
DownloadSchema.index({ downloadedAt: -1 });

export default mongoose.model<IDownload>('Download', DownloadSchema);
