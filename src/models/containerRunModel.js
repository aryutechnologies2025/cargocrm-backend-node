    import mongoose from "mongoose";

    const collectionName = "containerruns";
const containerRunSchema = new mongoose.Schema({
 

runNumber: {
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

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    
    immutable: true
  }
}, {
  timestamps: true
});

containerRunSchema.index({ runNumber: 1 }, { unique: true });

const ContainerRun = mongoose.model("ContainerRun", containerRunSchema);
export default ContainerRun;