import mongoose from "mongoose";
const settingSchema = new mongoose.Schema({
    teamAndCondition: {
        type: String,
       
    }
},{
    timestamps: true
});

const Setting = mongoose.model("Setting", settingSchema);
export default Setting;