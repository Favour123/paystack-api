// Frontend Integration Examples for Happy Little Pages
// This file shows how to integrate the frontend with the backend API

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// 1. Fetch Books from Backend
async function fetchBooks() {
  try {
    const response = await fetch(`${API_BASE_URL}/books`);
    const data = await response.json();
    
    if (data.success) {
      console.log('Books fetched:', data.data);
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
}

// 2. Initialize Payment
async function initializePayment(bookId, customerEmail, customerName, amount) {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookId,
        email: customerEmail,
        amount,
        customerName
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Redirect to Paystack payment page
      window.location.href = data.data.authorizationUrl;
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error initializing payment:', error);
    throw error;
  }
}

// 3. Verify Payment (called after Paystack redirect)
async function verifyPayment(reference) {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reference
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Store download token for later use
      localStorage.setItem('downloadToken', data.data.downloadToken);
      localStorage.setItem('downloadExpiresAt', data.data.downloadExpiresAt);
      
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
}

// 4. Get Download Link
async function getDownloadLink(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/downloads/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error getting download link:', error);
    throw error;
  }
}

// 5. Record Download
async function recordDownload(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/downloads/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error recording download:', error);
    throw error;
  }
}

// 6. Complete Purchase Flow Example
async function completePurchaseFlow(bookId, customerEmail, customerName, amount) {
  try {
    // Step 1: Initialize payment
    const paymentData = await initializePayment(bookId, customerEmail, customerName, amount);
    
    // Step 2: After Paystack redirect, verify payment
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('reference');
    
    if (reference) {
      const verificationData = await verifyPayment(reference);
      
      // Step 3: Get download link
      const downloadData = await getDownloadLink(verificationData.downloadToken);
      
      // Step 4: Download the file
      const link = document.createElement('a');
      link.href = downloadData.downloadUrl;
      link.download = downloadData.bookTitle + '.pdf';
      link.click();
      
      // Step 5: Record the download
      await recordDownload(verificationData.downloadToken);
      
      console.log('Purchase completed successfully!');
      return downloadData;
    }
  } catch (error) {
    console.error('Purchase flow failed:', error);
    throw error;
  }
}

// 7. React Component Integration Example
const BookPurchaseComponent = ({ book }) => {
  const handlePurchase = async () => {
    try {
      const customerEmail = prompt('Enter your email:');
      const customerName = prompt('Enter your name:');
      
      if (customerEmail && customerName) {
        await completePurchaseFlow(
          book.id,
          customerEmail,
          customerName,
          book.price
        );
      }
    } catch (error) {
      alert('Purchase failed: ' + error.message);
    }
  };

  return (
    <div className="book-card">
      <img src={book.imageUrl} alt={book.title} />
      <h3>{book.title}</h3>
      <p>{book.description}</p>
      <p>Price: ${book.price}</p>
      <button onClick={handlePurchase}>
        Buy Now
      </button>
    </div>
  );
};

// 8. Check Download Status
async function checkDownloadStatus(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/downloads/history/${token}`);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error checking download status:', error);
    throw error;
  }
}

// Export functions for use in your React components
export {
  fetchBooks,
  initializePayment,
  verifyPayment,
  getDownloadLink,
  recordDownload,
  completePurchaseFlow,
  checkDownloadStatus
};
