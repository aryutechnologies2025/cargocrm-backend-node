import mongoose from "mongoose";

const collectionName = "roles";

const role = new mongoose.Schema({
  
  name: {
    type: String,
    trim: true,
  },
 
  status: {
    type: String,
  },

  is_deleted: {
    type: String,
    default: "0"
  },

created_by: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  immutable: true

}

},{
    timestamps:true,
});



role.index({ name: 1 }, { unique: true }); // Unique role name

const Role = mongoose.model("Role", role, collectionName);

export default Role;
