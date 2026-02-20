    import mongoose from "mongoose";

    const collectionName = "containerruns";
const containerRunSchema = new mongoose.Schema({
 

run_number: {
  type: Number,
 trim: true,

},


  mode: {
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

  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    
    immutable: true
  }
}, {
  timestamps: true
});

containerRunSchema.index({ run_number: 1 });

const ContainerRun = mongoose.model("ContainerRun", containerRunSchema);
export default ContainerRun;