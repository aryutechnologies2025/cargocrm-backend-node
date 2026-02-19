import mongoose from "mongoose";

const collectionName = "events";
const eventSchema = new mongoose.Schema({

  eventName: {
    type: String,
   
    trim: true,
   
  },
  runNumber: {
    type: Number,
    trim: true
    
  },


trackingNumber: {
  type: Number,
  trim: true,
  required: true
},
  quantity: {
    type: Number,
trim: true
  },
  weight: {
    type: Number,
  trim: true
  },
  eventDate: {
    type: Date,
   trim: true
  },
  eventTime: {
    type: String,
   
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

eventSchema.index({ eventName: 1 });
eventSchema.index({ trackingNumber: 1 }, { unique: true });

const Event = mongoose.model("Event", eventSchema,collectionName);
export default Event;