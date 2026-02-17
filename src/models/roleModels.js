import mongoose from "mongoose";

const collectionName = "role_management";

const role = new mongoose.Schema({
  
  name: {
    type: String,
    required: [true, "Please provide a role name"],
    trim: true,
  },
 
  status: {
    type: String,
    enum: ["1", "0"], // 1 = active, 0 = inactive
    default: "1"
  },

  is_deleted: {
    type: String,
    default: "0"
  },

created_by: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Login",

}

},{
    timestamps:true,
});



role.index({ name: 1 }, { unique: true }); // Unique role name

const Role = mongoose.model("Role", role, collectionName);
// const Role = mongoose.model("Role", role);
export default Role;
