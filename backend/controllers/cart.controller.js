import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
   try {
      const products = await Product.find({ _id: { $in: req.user.cartItems } });

      // add quantity property to each product
      const cartItems = products.map((product) => {
         const item = req.user.cartItems.find((cartItem) => cartItem.id === product._id);
         return { ...product.toJSON, quantity: item.quantity };
      });

      res.json(cartItems);
   } catch (error) {
      console.error("Error in getCartProducts controller: ", error.message);
      res.status(500).json({ message: "Internal server error", error: error.message });
   }
};

export const addToCart = async (req, res) => {

   try {
      const { productId } = req.body;
      const user = req.user;

      const existingItem = user.cartItems.find(item => item.id === productId);

      if (existingItem) {
         existingItem.quantity += 1;

      } else {
         user.cartItems.push(productId);
      }

      await user.save();
      res.json(user.cartItems);
   } catch (error) {
      console.error("Error in addToCart controller: ", error.message);
      res.status(500).json({ message: "Internal server error", error: error.message });
   }
};

export const updateQuantity = async (req, res) => {
   try {
      const { id:productID } = req.params;
      const { quantity } = req.body;
      const user = req.user;
      const existingItem = user.cartItems.find((item) => item.id === productID);

      if (existingItem) {
         if (quantity === 0) {
            user.cartItems = user.cartItems.filter((item) => item.id !== productID);
            await user.save();
            return res.json(user.cartItems);
         }

         existingItem.quantity = quantity;
         await user.save();
         res.json(user.cartItems);
      } else {
         res.status(404).json({ message: "Product not found in cart" });
      }
   } catch (error) {
      console.error("Error in updateQuantity controller: ", error.message);
      res.status(500).json({ message: "Internal server error", error: error.message });
   }
}

export const removeAllFromCart = async (req, res) => {

   try {
      const { productId } = req.body;
      const user = req.user;

      if (!productId) {
         user.carItems = [];
      } else {
         user.cartItems = user.cartItems.filter((item) => item.id !== productId);
      }
      await user.save();
      res.json(user.cartItems);

   } catch (error) {
      console.error("Error in removeAllFromCart controller: ", error.message);
      res.status(500).json({ message: "Internal server error", error: error.message });
      
   }
}


