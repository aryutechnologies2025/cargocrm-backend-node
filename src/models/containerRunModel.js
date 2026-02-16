    import mongoose from "mongoose";

const containerRunSchema = new mongoose.Schema({
  run_id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
    required: true
  },
//   runNumber: {
//     type: Number,
//     required: [true, "Please provide a run number"],
//     unique: true,
//     validate: {
//       validator: function(value) {
//         return value > 0;
//       },
//       message: "Run number must be greater than 0"
//     }
//   },

runNumber: {
  type: Number,
  required: true
},


  mode: {
    type: String,
    required: [true, "Please provide mode"],
    trim: true,
    validate: {
      validator: function(value) {
        return value.trim().length > 0;
      },
      message: "Mode cannot be empty"
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

containerRunSchema.index({ runNumber: 1 }, { unique: true });

const ContainerRun = mongoose.model("ContainerRun", containerRunSchema);
export default ContainerRun;