import mongoose from "mongoose";

const collectionName = "events";
const eventSchema = new mongoose.Schema({

  event_name: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EventMaster",

  },
  run_number: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ContainerRun",
  },


  tracking_number: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  event:{
    type:String
  },
  quantity: {
    type: Number,
    trim: true
  },
  weight: {
    type: String,
    trim: true
  },
  event_date: {
    type: Date,
    trim: true
  },
  event_time: {
    type: String,

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
}, {
  timestamps: true
});

eventSchema.index({ event_name: 1 });
eventSchema.index({ tracking_number: 1 });

const Event = mongoose.model("Event", eventSchema, collectionName);
export default Event;