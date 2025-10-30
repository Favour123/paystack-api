import express, { Request, Response } from 'express';
import Book from '../models/Book';
import { validateBook } from '../utils/validation';
import { generalLimiter } from '../middleware/security';

const router = express.Router();

// Apply rate limiting to all book routes
router.use(generalLimiter);

// ✅ All handlers explicitly return Promise<void>
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const books = await Book.find({ isActive: true })
      .select('-pdfUrl')
      .sort({ createdAt: -1 });
    
     res.json({
      success: true,
      data: books,
      count: books.length
    });
  } catch (error) {
    console.error('Error fetching books:', error);
     res.status(500).json({
      success: false,
      message: 'Failed to fetch books'
    });
  }
});

// ✅  res in all branches
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const book = await Book.findOne({ 
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
  } catch (error) {
    console.error('Error fetching book:', error);
     res.status(500).json({
      success: false,
      message: 'Failed to fetch book'
    });
  }
});

router.post('/', validateBook, async (req: Request, res: Response): Promise<void> => {
  try {
    const book = new Book(req.body);
    await book.save();
    
     res.status(201).json({
      success: true,
      data: book,
      message: 'Book created successfully'
    });
  } catch (error) {
    console.error('Error creating book:', error);
     res.status(500).json({
      success: false,
      message: 'Failed to create book'
    });
  }
});

router.put('/:id', validateBook, async (req: Request, res: Response): Promise<void> => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
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
  } catch (error) {
    console.error('Error updating book:', error);
     res.status(500).json({
      success: false,
      message: 'Failed to update book'
    });
  }
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
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
  } catch (error) {
    console.error('Error deleting book:', error);
     res.status(500).json({
      success: false,
      message: 'Failed to delete book'
    });
  }
});

export default router;
