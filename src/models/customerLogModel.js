import mongoose from "mongoose";
const customerLogSchema = new mongoose.Schema({
    customerName:{
        type: String,
    },
    customerEmail:{
        type:String,
    },
    customerPhone:{
        type:String,
    },
    customerAddress:{
        type:String,
    },
    customerCity:{
        type:String,
    },
    customerCountry:{
        type:String,
    },
    customerPostcode:{
        type:String,
    }
},{
    timestamps:true
});
const CustomerLog = mongoose.model("CustomerLog", customerLogSchema);
export default CustomerLog;