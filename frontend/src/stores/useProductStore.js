import { create } from 'zustand';
import toast from 'react-hot-toast';
import axios from '../lib/axios';

export const useProductStore = create((set) => ({
   products: [],
   loading: false,

   setProducts: (products)  => set({ products }),

   createProduct: async (productData) => {
      set({ loading: true });

      try {
         const res = await axios.post('/products', productData);
         set((prevState) => ({
            products: [...prevState.products, res.data],
            loading: false,
         }));

         toast.success('Product created successfully');

      } catch (error) {
         toast.error(error.response?.data?.message || 'Failed to create product');
         set({ loading: false });
      }
   },

   fetchAllProducts: async () => {
      set({ loading: true });

      try {
         const res = await axios.get('/products');
         set({ products: res.data.products, loading: false });

      } catch (error) {
         toast.error(error.response?.data?.message || 'Failed to fetch products');
         set({ loading: false });
      }
   },

   fetchProductsByCategory: async (category) => {
      
      set({ loading: true });
      try {
         const res = await axios.get(`/products/category/${category}`);
         set({ products: res.data.products, loading: false });

      } catch (error) {
         toast.error(error.response?.data?.message || 'Failed to fetch products by category');
         set({ loading: false });
      }
   },

   deleteProduct: async (productId) => {
      set({ loading: true });

      try {
         await axios.delete(`/products/${productId}`);
         set((prevProducts) => ({
            products: prevProducts.products.filter((product) => product._id!== productId),
            loading: false,
         }));

         toast.success('Product deleted successfully');
      } catch (error) {
         toast.error(error.response?.data?.message || 'Failed to delete product');
         set({ loading: false });
      }``
   },

   toggleFeaturedProduct: async (productId) => {
      set({ loading: true });

      try {
         const res = await axios.patch(`/products/${productId}`);
         
         //this will update the isFeatured prop in product object
         set((prevProducts) => ({
            products: prevProducts.products.map((product) =>
               product._id === productId ? {...product, isFeatured: res.data.isFeatured } : product
            ),
            loading: false,
         }));

      } catch (error) {
         toast.error(error.response?.data?.message || 'Failed to toggle featured product');
         set({ loading: false });
      }

   },



}));