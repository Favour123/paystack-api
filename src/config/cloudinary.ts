import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer configuration (memory storage)
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image files and PDFs are allowed!'));
    }
  }
});

// Helper to upload buffer to Cloudinary using upload_stream
export const uploadBufferToCloudinary = (buffer: Buffer, options: { folder?: string, public_id?: string } = {}): Promise<any> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: options.folder || 'happy-little-pages', resource_type: 'auto', public_id: options.public_id },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// Helper function to delete files from Cloudinary
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`Successfully deleted ${publicId} from Cloudinary`);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Helper function to get secure URL
export const getSecureUrl = (publicId: string): string => {
  return cloudinary.url(publicId, {
    secure: true,
    quality: 'auto',
    fetch_format: 'auto'
  });
};

export default cloudinary;
