import Products from '../models/product.model.js';

export const getAllProducts = async (req, res) => {

   try {
      const products = await Products.find({}); 

      res.json({ products });

   } catch (error) {
      console.log("Error in getAllProducts controller: ", error.message);
      res.status(500).json({ message: "Internal server error", error: error.message });
   }
}
