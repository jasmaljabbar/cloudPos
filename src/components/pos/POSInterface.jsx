import React, { useState, useEffect, useCallback } from 'react';
import { Search, ShoppingCart, WifiOff } from 'lucide-react';
import ProductList from './ProductList';
import Cart from './Cart';
import { fetchProducts } from '../../api/endpoints';


// IndexedDB setup
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('posDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create products store with index on name for search
      if (!db.objectStoreNames.contains('products')) {
        const productStore = db.createObjectStore('products', { keyPath: 'id' });
        productStore.createIndex('name', 'name', { unique: false });
      }
    };
  });
};

// DB operations
const dbOperations = {
  async saveProducts(products) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['products'], 'readwrite');
      const store = transaction.objectStore('products');
      
      // Clear existing products
      store.clear();
      
      // Add new products
      products.forEach(product => {
        store.add(product);
      });
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },
  
  async getProducts() {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['products'], 'readonly');
      const store = transaction.objectStore('products');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
};

const POSInterface = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('')
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isCartOpen, setIsCartOpen] = useState(false);

  
  const loadProducts = useCallback(async () => {
    try {
      // First try to fetch fresh data when online
      if (navigator.onLine) {
        const data = await fetchProducts();
        if (data && data.length > 0) {
          setProducts(data);
          // Save to IndexedDB for offline use
          await dbOperations.saveProducts(data);
          return;
        }
      }
      
      // If offline or online fetch fails, try IndexedDB
      const storedProducts = await dbOperations.getProducts();
      if (storedProducts && storedProducts.length > 0) {
        setProducts(storedProducts);
        return;
      }
      
      // If both fail, set empty array and show error
      setProducts([]);
      setError('Unable to load products. Please check your connection.');
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Error loading products. Please try again.');
    }
  }, []);
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      loadProducts();
    };
    const handleOffline = () => setIsOnline(false);
  
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  
    // Initial load
    loadProducts();
  
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadProducts]);
  

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };
  

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
    {!isOnline && (
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-center gap-2 text-amber-800">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">
              You're offline. Limited functionality available.
            </span>
          </div>
        </div>
      </div>
    )}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-2xl font-bold">Point of Sale</h1>
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="hidden sm:inline">Cart</span>
                <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-sm">
                  {cartItems.length}
                </span>
              </button>
            </div>

            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto p-4">
          <ProductList
            products={products}
            searchTerm={searchTerm}
            addToCart={addToCart}
          />
        </main>
      </div>

      <Cart
        cartItems={cartItems}
        removeFromCart={removeFromCart}
        updateQuantity={updateQuantity}
        calculateTotal={calculateTotal}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
      />
    </div>
  );
};

export default POSInterface;
