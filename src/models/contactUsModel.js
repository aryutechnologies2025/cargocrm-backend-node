import mongoose from "mongoose";

const collectionName = "contactus";
const contactUsSchema = new mongoose.Schema({
  firstName: {
    type: String,

    trim: true,

  },
  lastName: {
    type: String,

    trim: true,

  },
  type: {
    type: String
  },
  gender: {
    type: String
  },
  appointmentDate: {
    type: String,
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
    default: "1"

  },
  is_deleted: {
    type: String,
    default: "0"
  },

  // created_by: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "User",

  //   immutable: true
  // }
}, {
  timestamps: true
});


contactUsSchema.index({ email: 1 }); // Unique index for email
contactUsSchema.index({ status: 1 });
contactUsSchema.index({ createdAt: -1 }); // For sorting by date

const ContactUs = mongoose.model("ContactUs", contactUsSchema, collectionName);
export default ContactUs;