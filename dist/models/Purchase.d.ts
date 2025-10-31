import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IPurchase, {}, {}, {}, mongoose.Document<unknown, {}, IPurchase, {}, {}> & IPurchase & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Purchase.d.ts.map