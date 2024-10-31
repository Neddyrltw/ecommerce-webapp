import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, "Please provide your name"],
   },
   email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      trim: true,
   },
   password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password must be at least 6 characters"],
   },
   cartItems: [
      {
         quantity: {
            type: Number,
            default: 1,
         },
         product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
         }
      }
   ],
   role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer"
   }

}, {
   timestamps: true
});

// Hash password before saving the user to the database
userSchema.pre("save", async function (next) {
   if(!this.isModified("password")) return next();

   try {
     const salt = await bcrypt.genSalt(10);
     this.password = await bcrypt.hash(this.password, salt);
     next();
   } catch (error) {
      next(error);
   }
});

userSchema.methods.comparePassword = async function (password) {
   return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;