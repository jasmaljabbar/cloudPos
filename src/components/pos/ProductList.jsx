import React from 'react';

const ProductList = ({ products, searchTerm, addToCart }) => {
  const filteredProducts = products.filter(product => {
    if (!product) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      (product.name?.toLowerCase() || '').includes(searchLower) ||
      (product.code?.toLowerCase() || '').includes(searchLower) ||
      (product.description?.toLowerCase() || '').includes(searchLower)
    );
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {filteredProducts.map(product => (
        <div
          key={product.id}
          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => addToCart(product)}
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full aspect-square object-cover rounded-t-lg"
          />
          <div className="p-4">
            <h3 className="font-medium line-clamp-2">{product.name}</h3>
            <p className="text-sm text-gray-500 mt-1">Code: {product.code}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">{product.uom}</span>
              <span className="font-medium">د.إ {product.price.toFixed(2)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
