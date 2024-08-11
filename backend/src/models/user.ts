import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { UserType } from "../shared/types";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
});

//middelware for mongodb, before any obj gets saved in mongo, checked if password changed, if yes its hashed 
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next(); //done by mongo auto: saving to db
});

const User = mongoose.model<UserType>("User", userSchema);

export default User;


/* jwt token proves user is authenticated */
/* http cookie cant be accessed by javascript/browser/server */