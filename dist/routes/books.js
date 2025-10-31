"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Book_1 = __importDefault(require("../models/Book"));
const validation_1 = require("../utils/validation");
const security_1 = require("../middleware/security");
const router = express_1.default.Router();
router.use(security_1.generalLimiter);
router.get('/', async (req, res) => {
    try {
        const books = await Book_1.default.find({ isActive: true })
            .select('-pdfUrl')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            data: books,
            count: books.length
        });
    }
    catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch books'
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const book = await Book_1.default.findOne({
            _id: req.params.id,
            isActive: true
        }).select('-pdfUrl');
        if (!book) {
            res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }
        res.json({
            success: true,
            data: book
        });
    }
    catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch book'
        });
    }
});
router.post('/', validation_1.validateBook, async (req, res) => {
    try {
        const book = new Book_1.default(req.body);
        await book.save();
        res.status(201).json({
            success: true,
            data: book,
            message: 'Book created successfully'
        });
    }
    catch (error) {
        console.error('Error creating book:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create book'
        });
    }
});
router.put('/:id', validation_1.validateBook, async (req, res) => {
    try {
        const book = await Book_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!book) {
            res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }
        res.json({
            success: true,
            data: book,
            message: 'Book updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update book'
        });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const book = await Book_1.default.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!book) {
            res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }
        res.json({
            success: true,
            message: 'Book deactivated successfully'
        });
    }
    catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete book'
        });
    }
});
exports.default = router;
//# sourceMappingURL=books.js.map