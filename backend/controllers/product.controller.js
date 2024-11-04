import Product from '../models/product.model.js';
import { redis } from '../lib/redis.js';
import cloudinary from '../lib/cloudinary.js';


export const getAllProducts = async (req, res) => {

   try {
      const products = await Products.find({}); 

      res.json({ products });

   } catch (error) {
      console.error("Error in getAllProducts controller: ", error.message);
      res.status(500).json({ message: "Internal server error", error: error.message });
   }
};

export const getFeaturedProducts = async (req, res) => {
   
   try {

      // check if featured products are already in redis
      let featuredProducts = await redis.get('featuerd_products');
      if (featuredProducts) {
         return res.json(JSON.parse(featuredProducts));
      }

      // if not in redis, fetch from db
      // .lean() returns a plain object instead of a mongoose document, which is more efficient for JSON serialization
      featuredProducts = await Product.find({ featured: true }).lean();

      if (!featuredProducts) {
      return res.status(404).json({ message: "No featured products found" });
      }

      // store in redis for future use
      await redis.set('featured_products', JSON.stringify(featuredProducts));
      res.json(featuredProducts);
   } catch (error) {
      console.log("Error in getFeaturedProducts controller: ", error.message);
      res.status(500).json({ message: "Internal server error", error: error.message });
   }
};

export const createProduct = async (req, res) => {
   try {
      const { name, description, price, image, category} = req.body;

      let cloudinaryResponse = null;

      if (image) {
         cloudinaryResponse = await cloudinary.uploader.upload(image, {folder: 'products'});
      }

      const product = await Product.create({
         name,
         description,
         price,
         image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : '',
         category
      });

      res.status(201).json(product);
   } catch (error) {
      console.error("Error in createProduct controller: ", error.message);
      res.status(500).json({ message: "Internal server error", error: error.message });
   }
};

export const deleteProduct = async (req, res) => {
   try {

      const product = await Product.findByIdAndDelete(req.params.id);

      try {

         if (!product) {
            return res.status(404).json({ message: "Product not found" });
         }
         if (product.image) {
            const publicId = product.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`products/${publicId}`);
            console.log("Image deleted from cloudinary");
         }
      } catch (error) {
         console.error("Error deleting image from cloudinary: ", error.message);
      }

      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: "Product deleted successfully" });

   } catch (error) {
      console.error("Error in deleteProduct controller: ", error.message);
      res.status(500).json({ message: "Internal server error", error: error.message });
   }
};

export const getRecommendedProducts = async (req, res) => {

   // fetch and display 3 random products from the database
   try {
      const products = await Product.aggregate([
         {
            $sample: {size: 3}
         },
         {
            $project: {
               _id: 1,
               name: 1,
               description: 1,
               image: 1,
               price: 1
            }
         }
      ]);

      res.json(products);
   } catch (error) {
      console.error("Error in getRecommendedProducts controller: ", error.message);
      res.status(500).json({ message: "Internal server error", error: error.message });
   }
}

export const getProductsByCategory = async (req, res) => {
   const { category } = req.params;

   try {
      const products = await Product.find({ category });
      res.json(products);

   } catch (error) {
      console.error("Error in getProductsByCategory controller: ", error.message);
      res.status(500).json({ message: "Internal server error", error: error.message });
   }
}

export const toggleFeaturedProduct = async (req, res) => {

   try {
      const product = await Product.findById(req.params.id);

      if (product) {
         product.isFeatured = !product.isFeatured;
         const updatedProduct = await product.save();
         await updateFeaturedProductsCache();
         res.json(updatedProduct);

      } else {
         res.status(404).json({ message: "Product not found" });
      }
   } catch (error) {
      console.error("Error in toggleFeaturedProduct controller: ", error.message);
      res.status(500).json({ message: "Internal server error", error: error.message });
   }
}

async function updateFeaturedProductsCache() {
   try {
      // .lean() returns a plain object instead of a mongoose document, which is more efficient for JSON serialization
      const featuredProducts = await Product.find({ isFeatured: true }).lean();
      await redis.set('featured_products', JSON.stringify(featuredProducts));
   } catch (error) {
      console.error("Error in update cache function: ", error.message);
      res.status(500).json({ message: "Internal server error", error: error.message });
   }
}