import Beneficiary from "../models/beneficiaryModel.js";
import Customer from "../models/customerModel.js";
import { encryptData } from "../utils/encryption.js";
import { checkExistingRecord, handleValidationError } from "./baseController.js";

const generateBeneficiaryId = async () => {
  const lastCustomer = await Beneficiary.findOne()
    .sort({ createdAt: -1 })
    .select("beneficiary_id");

  if (!lastCustomer || !lastCustomer.beneficiary_id) {
    return "bene-0001";
  }

 // First customer
  if (
    !lastCustomer ||
    !lastCustomer.beneficiary_id ||
    isNaN(Number(lastCustomer.beneficiary_id))
  ) {
    return "00001";
  }

   const lastNumber = Number(lastCustomer.beneficiary_id);
  const nextNumber = lastNumber + 1;

   return String(nextNumber).padStart(5, "0");
};

const addBeneficiary = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.json({ success: false, message: "Data is required" });
    }

    const {customerId, name, email, phone, address,city,country, status,created_by } = req.body;

    // Check if email already exists
      const emailExists = await Beneficiary.findOne({ email });
    if (emailExists) {
      return res.json({
        success: false,
        message: "Email already exists"
      });
    }

       //  Generate beneficiaryId
    const beneficiary_id = await generateBeneficiaryId();

    const beneficiary = new Beneficiary({
      customerId,
      beneficiary_id,
      name,
      email,
      phone,
      address,
      city,
      country,
      status,
     created_by
    });

    await beneficiary.save();
    res.json({ 
      success: true, 
      message: "Beneficiary added successfully", 
    });

  }catch (error) {
    console.error("ADD CUSTOMER ERROR:", error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

const getBeneficiaries = async (req, res) => {
  try {
    const beneficiaries = await Beneficiary.find({ is_deleted: "0" })
      .populate("created_by", "name email")
      .populate("customerId", "name");

    const customerDetails = await Customer.find({ is_deleted: "0" });

    const formattedBeneficiaries = beneficiaries.map((beneficiary) => ({
      id: beneficiary._id,
      beneficiary_id: beneficiary.beneficiary_id,
      customerId: beneficiary.customerId?.name,
      name: beneficiary.name,
      email: beneficiary.email,
      phone: beneficiary.phone,
      address: beneficiary.address,
      city: beneficiary.city,
      country: beneficiary.country,
      status: beneficiary.status,
      created_by: beneficiary?.created_by?.name,
    }));

    const formattedCustomers = customerDetails.map((customer) => ({
      id: customer._id,
      name: customer?.name,
    }));

    const responseData = {
      success: true,
      data: formattedBeneficiaries,
      customer: formattedCustomers,
    };

    // const encodedData = Buffer.from(
    //   JSON.stringify(responseData)
    // ).toString("base64");
    const encryptedData = encryptData(responseData);

    return res.status(200).json({
      success: true,
      encrypted: true,
      data: encryptedData,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

 const getBeneficiaryById = async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findById(req.params.id)
      .populate("created_by", "name email");
    
    if (!beneficiary) {
      return res.json({ success: false, message: "Beneficiary not found" });
    }
    
    res.json({ success: true, data: beneficiary });
  } catch (error) {
    res.json({ success: false, message:error.message || "Internal Server Error" });
  }
};

 const editBeneficiary = async (req, res) => {
  try {
    const { id } = req.params;
    
    const beneficiary = await Beneficiary.findById(id);
    if (!beneficiary) {
      return res.json({ success: false, message: "Beneficiary not found" });
    }

    const { email } = req.body;
    if (email && email !== beneficiary.email) {
      const emailExists = await checkExistingRecord(
        Beneficiary, 
        { email, _id: { $ne: id } }, 
        "email", 
        res
      );
      if (emailExists) return;
    }

    const updated = await Beneficiary.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ 
      success: true, 
      message: "Beneficiary updated successfully", 

    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message || "Internal Server Error" });
  }
};

 const deleteBeneficiary = async (req, res) => {
  const { id } = req.params;
  try {
    const beneficiaryDetails = await Beneficiary.findByIdAndUpdate(
      id,
      { is_deleted: 1 },
      { new: true }
    );
    if (!beneficiaryDetails) {
      return res.json({ success: false, message: "Benerficiary Not Found" });
    }
    res.json({ success: true, message: "Beneficiary deleted successfully" });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
};

export { addBeneficiary, getBeneficiaries, getBeneficiaryById, editBeneficiary, deleteBeneficiary };    