import mongoose from "mongoose";
const eventLogSchema = new mongoose.Schema({
    event_name: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EventMaster",
    
      },
      customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
      },
    tracking_number: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      }],
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
},{
    timestamps:true
});

const EventLog = mongoose.model("EventLog", eventLogSchema);
export default EventLog;