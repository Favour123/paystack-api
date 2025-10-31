import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
export declare const upload: multer.Multer;
export declare const uploadBufferToCloudinary: (buffer: Buffer, options?: {
    folder?: string;
    public_id?: string;
}) => Promise<any>;
export declare const deleteFromCloudinary: (publicId: string) => Promise<void>;
export declare const getSecureUrl: (publicId: string) => string;
export default cloudinary;
//# sourceMappingURL=cloudinary.d.ts.map