import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key-here';
const ALGORITHM = 'aes-256-cbc';

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

export const decrypt = (encryptedText: string): string => {
  const textParts = encryptedText.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedData = textParts.join(':');
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

export const generateToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

export const generateDownloadToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const hashString = (text: string): string => {
  return crypto.createHash('sha256').update(text).digest('hex');
};
