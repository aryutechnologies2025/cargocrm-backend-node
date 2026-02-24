import mongoose from "mongoose";
const collectionSchema = new mongoose.Schema({
    orderId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
    },
    address:{
        type:String
    },
    date_time:{
        type:String
    },
    is_deleted:{
        type:String,
        default:"0"
    }
    
},{
    timestamps:true
});

const Collection = mongoose.model("Collection", collectionSchema);
export default Collection