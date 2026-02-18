import Beneficiary from "../models/beneficiaryModel.js";
import { checkExistingRecord, handleValidationError } from "./baseController.js";

const generateBeneficiaryId = async () => {
  const lastCustomer = await Beneficiary.findOne()
    .sort({ createdAt: -1 })
    .select("beneficiary_id");

  if (!lastCustomer || !lastCustomer.beneficiary_id) {
    return "bene-0001";
  }

  const lastNumber = parseInt(
    lastCustomer.beneficiary_id.split("-")[1],
    10
  );

  const nextNumber = lastNumber + 1;

  return `bene-${String(nextNumber).padStart(4, "0")}`;
};

 const addBeneficiary = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.json({ success: false, message: "Data is required" });
    }

    const { name, email, phone, address,city,country, status,created_by } = req.body;

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
      .populate("created_by", "name email");
    res.json({ success: true, data: beneficiaries });
  } catch (error) {
    res.json({ success: false, message: "Internal Server Error" });
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
    console.log("error", error);
    const validationError = handleValidationError(error, res);
    if (validationError) return;
    res.json({ success: false, message: "Internal Server Error" });
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