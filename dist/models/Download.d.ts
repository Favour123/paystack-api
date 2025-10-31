import mongoose, { Document } from 'mongoose';
export interface IDownload extends Document {
    purchaseId: mongoose.Types.ObjectId;
    downloadToken: string;
    ipAddress: string;
    userAgent: string;
    downloadedAt: Date;
    isExpired: boolean;
}
declare const _default: mongoose.Model<IDownload, {}, {}, {}, mongoose.Document<unknown, {}, IDownload, {}, {}> & IDownload & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Download.d.ts.map