import mongoose from "mongoose";

const collectionName = "contactus";
const contactUsSchema = new mongoose.Schema({
  name: {
    type: String,
  
    trim: true,
  
  },

  
email: {
  type: String,
 trim: true,
 unique: true
},

message: {
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

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
   
    immutable: true
  }
}, {
  timestamps: true
});


contactUsSchema.index({ name: 1 }); // Regular index for name
contactUsSchema.index({ email: 1 }); // Unique index for email
contactUsSchema.index({ status: 1 });
contactUsSchema.index({ createdAt: -1 }); // For sorting by date

const ContactUs = mongoose.model("ContactUs", contactUsSchema, collectionName);
export default ContactUs;