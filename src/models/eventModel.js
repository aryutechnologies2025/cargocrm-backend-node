import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
    required: true
  },
  eventName: {
    type: String,
    required: [true, "Please provide an event name"],
    trim: true,
    minlength: [3, "Event name must be at least 3 characters long"],
    validate: {
      validator: function(value) {
        return value.trim().length >= 3;
      },
      message: "Event name must be at least 3 characters long"
    }
  },
  runNumber: {
    type: Number,
    required: [true, "Please provide a run number"],
    validate: {
      validator: function(value) {
        return value > 0;
      },
      message: "Run number must be greater than 0"
    }
  },
//   trackingNumber: {
//     type: Number,
//     required: [true, "Please provide a tracking number"],
//     unique: true,
//     validate: {
//       validator: function(value) {
//         return value > 0;
//       },
//       message: "Tracking number must be greater than 0"
//     }
//   },

trackingNumber: {
  type: Number,
  required: true
},
  quantity: {
    type: Number,
    required: [true, "Please provide quantity"],
    validate: {
      validator: function(value) {
        return value > 0;
      },
      message: "Quantity must be greater than 0"
    }
  },
  weight: {
    type: Number,
    required: [true, "Please provide weight"],
    validate: {
      validator: function(value) {
        return value > 0;
      },
      message: "Weight must be greater than 0 kg"
    }
  },
  eventDate: {
    type: Date,
    required: [true, "Please provide event date"]
  },
  eventTime: {
    type: String,
    required: [true, "Please provide event time"],
    validate: {
      validator: function(value) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
      },
      message: "Please provide valid time in HH:MM format"
    }
  },
  status: {
    type: String,
    required: [true, "Please select a status"],
    enum: {
      values: ["active", "inactive"],
      message: "Status must be either active or inactive"
    }
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

eventSchema.index({ eventName: 1 });
eventSchema.index({ trackingNumber: 1 }, { unique: true });

const Event = mongoose.model("Event", eventSchema);
export default Event;