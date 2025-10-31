"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Book_1 = __importDefault(require("../models/Book"));
dotenv_1.default.config();
const sampleBooks = [
    {
        title: "Jesus and the Little Lamb",
        description: "Follow Jesus as the Good Shepherd who loves and cares for every little lamb. This heartwarming story teaches children about God's unconditional love and protection.",
        price: 15,
        imageUrl: "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/jesus-little-lamb-cover.jpg",
        pdfUrl: "https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/jesus-little-lamb.pdf",
        rating: 5,
        ages: "3-8",
        isActive: true
    },
    {
        title: "The Gentle Shepherd",
        description: "Learn about Jesus's gentle love through beautiful stories and coloring pages. Perfect for quiet time and family devotion.",
        price: 15,
        imageUrl: "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/gentle-shepherd.jpg",
        pdfUrl: "https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/gentle-shepherd.pdf",
        rating: 5,
        ages: "4-8",
        isActive: true
    },
    {
        title: "Lost Lamb Found",
        description: "Discover how Jesus finds us when we're lost, just like the little lamb. A touching story about God's love and forgiveness.",
        price: 15,
        imageUrl: "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/lost-lamb-found.jpg",
        pdfUrl: "https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/lost-lamb-found.pdf",
        rating: 5,
        ages: "3-6",
        isActive: true
    },
    {
        title: "Following the Shepherd",
        description: "Join the little lambs as they learn to follow Jesus with joy and trust. Interactive activities and coloring pages included.",
        price: 15,
        imageUrl: "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/following-shepherd.jpg",
        pdfUrl: "https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/following-shepherd.pdf",
        rating: 5,
        ages: "3-7",
        isActive: true
    },
    {
        title: "Lambs of Love",
        description: "Sweet stories of how Jesus teaches children to care for one another. Perfect for teaching kindness and compassion.",
        price: 15,
        imageUrl: "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/lambs-of-love.jpg",
        pdfUrl: "https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/lambs-of-love.pdf",
        rating: 5,
        ages: "4-8",
        isActive: true
    }
];
const seedBooks = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/happy-little-pages';
        await mongoose_1.default.connect(mongoURI);
        console.log('Connected to MongoDB');
        await Book_1.default.deleteMany({});
        console.log('Cleared existing books');
        const books = await Book_1.default.insertMany(sampleBooks);
        console.log(`Seeded ${books.length} books successfully`);
        books.forEach((book, index) => {
            console.log(`${index + 1}. ${book.title} - $${book.price}`);
        });
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding books:', error);
        process.exit(1);
    }
};
seedBooks();
//# sourceMappingURL=seedBooks.js.map