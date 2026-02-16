import mongoose from "mongoose";

const role = new mongoose.Schema({
  
  name: {
    type: String,
    required: [true, "Please provide a role name"],
    trim: true,
  },
 
  status: { type: String, required: [true, "Please select a status"] },

createdBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,
  immutable: true
}

},{
    timestamps:true,
});



role.index({ name: 1 }, { unique: true }); // Unique role name
// role.index({ departmentId: 1 }); // Index on department
const Role = mongoose.model("Role", role);
export default Role;
