import mongoose, { Document, Schema } from 'mongoose';

export interface IBook extends Document {
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  pdfUrl: string;
  rating: number;
  ages: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema<IBook>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  imageUrl: {
    type: String,
    required: true
  },
  pdfUrl: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    default: 5,
    min: 1,
    max: 5
  },
  ages: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
BookSchema.index({ isActive: 1, createdAt: -1 });

export default mongoose.model<IBook>('Book', BookSchema);
