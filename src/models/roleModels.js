import mongoose from "mongoose";

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

  isDeleted: {
    type: String,
    default: "0"
  },

createdBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "LoginLog",

}

},{
    timestamps:true,
});



role.index({ name: 1 }, { unique: true }); // Unique role name
// role.index({ departmentId: 1 }); // Index on department
const Role = mongoose.model("Role", role);
export default Role;
