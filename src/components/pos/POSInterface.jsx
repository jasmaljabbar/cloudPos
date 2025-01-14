import React, { useState, useEffect, useCallback } from 'react';
import { Search, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import ProductList from './ProductList';
import Cart from './Cart';

const POSInterface = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
      'Authorization': 'token c3f05220bc1d4c1:24ac343f7b5a43d',
      'Content-Type': 'application/json',
    },
  });



  const fetchProducts = useCallback(async () => {
    try {
      const response = await api.get('/api/method/frappe.desk.reportview.get', {
        params: {
          doctype: 'Item',
          fields:
            '["name","item_name","item_code","description","standard_rate","stock_uom","image"]',
          filters: '[["disabled","=",0],["is_sales_item","=",1]]',
        },
      });

      if (!response.data?.message) {
        throw new Error('Invalid response structure');
      }

      const { keys, values } = response.data.message;
      const transformedProducts = values.map((item) => {
        const keyValueMap = {};
        keys.forEach((key, index) => {
          keyValueMap[key] = item[index];
        });

        return {
          id: keyValueMap.name,
          name: keyValueMap.item_name,
          code: keyValueMap.item_code,
          description: keyValueMap.description,
          price: parseFloat(keyValueMap.standard_rate) || 0,
          uom: keyValueMap.stock_uom,
          image: keyValueMap.image || '/api/placeholder/200/200',
        };
      });

      setProducts(transformedProducts);
    } catch (err) {
        console.log(err.response?.data?.exception || err.message || 'Failed to fetch products');
    }
  }, [api]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  

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
    <div className="flex min-h-screen bg-gray-50">
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
