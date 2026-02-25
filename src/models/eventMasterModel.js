import mongoose from "mongoose";
const eventMasterSchema = new mongoose.Schema({
    name:{
        type: String,
        trim: true
    },
    status:{
        type: String,
        default: "1"
    },
    is_deleted: {
        type: String,
        default: "0"
      },
},{
    timestamps:true
});

const EventMaster = mongoose.model("EventMaster", eventMasterSchema);
export default EventMaster