import mongoose from "mongoose";
const beneficiaryLogSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CustomerLog",
    },
    beneficiaryName: {
        type: String,
    },
    beneficiaryEmail: {
        type: String,
    },
    beneficiaryPhone: {
        type: String
    },
    beneficiaryAddress: {
        type: String,
    },
    beneficiaryCity: {
        type: String,
    },
    beneficiaryCountry: {
        type: String,
    },
    beneficiaryPostcode: {
        type: String
    },
}, {
    timestamps: true
});
const BeneficiaryLog = mongoose.model("BeneficiaryLog", beneficiaryLogSchema);
export default BeneficiaryLog;
