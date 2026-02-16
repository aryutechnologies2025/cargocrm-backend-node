import mongoose from "mongoose";

const contactUsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide your name"],
    trim: true,
    minlength: [3, "Name must be at least 3 characters long"],
    validate: {
      validator: function(value) {
        return value.trim().length >= 3;
      },
      message: "Name must be at least 3 characters long"
    }
  },
//   email: {
//     type: String,
//     required: [true, "Please provide an email"],
//     trim: true,
//     lowercase: true,
//     unique: true,
//     validate: [
//       {
//         validator: function(value) {
//           return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
//         },
//         message: "Please provide a valid email address"
//       }
//     ]
//   },
  
email: {
  type: String,
  required: true,
  lowercase: true
},

message: {
    type: String,
    required: [true, "Please provide a message"],
    trim: true,
    validate: {
      validator: function(value) {
        return value.trim().length > 0;
      },
      message: "Message cannot be empty"
    }
  },
  status: {
    type: String,
    required: [true, "Please select a status"],
    enum: {
      values: ["active", "inactive"],
      message: "Status must be either active or inactive"
    },
    default: "active"
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    immutable: true
  }
}, {
  timestamps: true
});


contactUsSchema.index({ name: 1 }); // Regular index for name
contactUsSchema.index({ email: 1 }); // Unique index for email
contactUsSchema.index({ status: 1 });
contactUsSchema.index({ createdAt: -1 }); // For sorting by date

const ContactUs = mongoose.model("ContactUs", contactUsSchema);
export default ContactUs;