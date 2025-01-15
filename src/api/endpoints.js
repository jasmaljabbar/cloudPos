// endpoints.js
import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    headers: {
      'Authorization': 'token 2b0c656439a5002:3738b772c7bd106',
      'Content-Type': 'application/json',
    },
});

// fetching Products

export const fetchProducts = async () => {
    try {
      const response = await api.get('/api/method/frappe.desk.reportview.get', {
        params: {
          doctype: 'Item',
          fields: '["name","item_name","item_code","description","standard_rate","stock_uom","image"]',
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

      return transformedProducts;
    } catch (err) {
        console.error(err.response?.data?.exception || err.message || 'Failed to fetch products');
        throw err;
    }
};