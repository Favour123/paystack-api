# Happy Little Pages - Backend API

A Node.js backend API for the Happy Little Pages children's Bible storybook platform, built with TypeScript, Express, MongoDB, Paystack, and Cloudinary.

## Features

- 📚 Book management (CRUD operations)
- 💳 Paystack payment integration
- 📥 Secure download system with 2-day expiry
- 🔒 Rate limiting and security middleware
- 📊 Download tracking and analytics
- 🎯 Webhook handling for payment verification
- ☁️ Cloudinary integration for file storage

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Payment**: Paystack API
- **File Storage**: Cloudinary
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Paystack account
- Cloudinary account

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb://localhost:27017/happy-little-pages

   # Paystack Configuration
   PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
   PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
   PAYSTACK_WEBHOOK_SECRET=your_webhook_secret_here

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Security
   JWT_SECRET=your_jwt_secret_here
   ENCRYPTION_KEY=your_32_character_encryption_key

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:5173
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Seed the database** (optional)
   ```bash
   npm run seed
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Books
- `GET /api/books` - Get all active books
- `GET /api/books/:id` - Get single book details
- `POST /api/books` - Create new book (Admin)
- `PUT /api/books/:id` - Update book (Admin)
- `DELETE /api/books/:id` - Soft delete book (Admin)

### Payments
- `POST /api/payments/initialize` - Initialize payment
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/status/:reference` - Check payment status

### Downloads
- `POST /api/downloads/verify` - Verify download token
- `POST /api/downloads/complete` - Record successful download
- `GET /api/downloads/history/:token` - Get download history

### Webhooks
- `POST /api/webhooks/paystack` - Paystack webhook handler
- `GET /api/webhooks/paystack` - Webhook endpoint verification

### Health
- `GET /health` - Health check endpoint

## API Usage Examples

### Initialize Payment
```javascript
const response = await fetch('/api/payments/initialize', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'customer@example.com',
    amount: 15,
    bookId: 'book_id_here',
    customerName: 'John Doe'
  })
});
```

### Verify Payment
```javascript
const response = await fetch('/api/payments/verify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    reference: 'payment_reference_from_paystack'
  })
});
```

### Download Book
```javascript
const response = await fetch('/api/downloads/verify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    token: 'download_token_from_payment_verification'
  })
});
```

## Database Models

### Book
- `title`: Book title
- `description`: Book description
- `price`: Price in USD
- `imageUrl`: Book cover image URL
- `pdfUrl`: PDF download URL
- `rating`: Book rating (1-5)
- `ages`: Target age range
- `isActive`: Book availability status

### Purchase
- `bookId`: Reference to Book
- `customerEmail`: Customer email
- `customerName`: Customer name
- `amount`: Payment amount
- `paystackReference`: Paystack payment reference
- `status`: Payment status
- `downloadToken`: Unique download token
- `downloadExpiresAt`: Download expiry date
- `downloadCount`: Number of downloads
- `maxDownloads`: Maximum allowed downloads

### Download
- `purchaseId`: Reference to Purchase
- `downloadToken`: Download token used
- `ipAddress`: Downloader's IP address
- `userAgent`: Downloader's user agent
- `downloadedAt`: Download timestamp

## Security Features

- **Rate Limiting**: Prevents abuse with configurable limits
- **CORS**: Configured for specific origins
- **Helmet**: Security headers
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Secure error responses
- **Webhook Verification**: Paystack signature verification

## File Upload

The API supports file uploads through Cloudinary:

```javascript
// Upload book cover image
const formData = new FormData();
formData.append('image', file);
formData.append('folder', 'book-covers');

const response = await fetch('/api/upload/image', {
  method: 'POST',
  body: formData
});
```

## Error Handling

All API responses follow this format:

```json
{
  "success": boolean,
  "message": "string",
  "data": object | null,
  "errors": array | null
}
```

## Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data
- `npm test` - Run tests (when implemented)

## Deployment

1. **Environment Variables**: Set all required environment variables
2. **Database**: Ensure MongoDB is accessible
3. **Paystack**: Configure webhook URL
4. **Cloudinary**: Set up file storage
5. **Build**: Run `npm run build`
6. **Start**: Run `npm start`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
