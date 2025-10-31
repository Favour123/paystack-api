import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IBook, {}, {}, {}, mongoose.Document<unknown, {}, IBook, {}, {}> & IBook & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Book.d.ts.map