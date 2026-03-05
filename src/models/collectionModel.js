import mongoose from "mongoose";
const collectionSchema = new mongoose.Schema({
    orderId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
    },
    email:{
        type:String
    },
    phone_no:{
        type:String
    },
    alter_phone:{
        type:String
    },
    collection_for:{
        type:String
    },
    notes:{
        type:String
    },
    address:{
        type:String
    },
    city:{
        type:String
    },
    country:{
        type:String
    },
    postcode:{
        type:String
    },
    date_time:{
        type:String
    },
    status:{
        type:String,
        default:"pending"
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