import Beneficiary from "../models/beneficiaryModel.js";
import { checkExistingRecord, handleValidationError } from "./baseController.js";

 const addBeneficiary = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, message: "Data is required" });
    }

    const { name, email, phone, address, status } = req.body;

    // Check if email already exists
    const emailExists = await checkExistingRecord(Beneficiary, { email }, "email", res);
    if (emailExists) return;

    const beneficiary = new Beneficiary({
      name,
      email,
      phone,
      address,
      status,
      createdBy: req.user._id
    });

    await beneficiary.save();
    res.status(201).json({ 
      success: true, 
      message: "Beneficiary added successfully", 
      data: beneficiary 
    });

  } catch (error) {
    console.log("error", error);
    const validationError = handleValidationError(error, res);
    if (validationError) return;
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

 const getBeneficiaries = async (req, res) => {
  try {
    const beneficiaries = await Beneficiary.find({ status: "active" })
      .populate("createdBy", "name email");
    res.status(200).json({ success: true, data: beneficiaries });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

 const getBeneficiaryById = async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findById(req.params.id)
      .populate("createdBy", "name email");
    
    if (!beneficiary) {
      return res.status(404).json({ success: false, message: "Beneficiary not found" });
    }
    
    res.status(200).json({ success: true, data: beneficiary });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

 const editBeneficiary = async (req, res) => {
  try {
    const { id } = req.params;
    
    const beneficiary = await Beneficiary.findById(id);
    if (!beneficiary) {
      return res.status(404).json({ success: false, message: "Beneficiary not found" });
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

    res.status(200).json({ 
      success: true, 
      message: "Beneficiary updated successfully", 
      data: updated 
    });
  } catch (error) {
    console.log("error", error);
    const validationError = handleValidationError(error, res);
    if (validationError) return;
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

 const deleteBeneficiary = async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findById(req.params.id);
    
    if (!beneficiary) {
      return res.status(404).json({ success: false, message: "Beneficiary not found" });
    }

    beneficiary.status = "inactive";
    await beneficiary.save();

    res.status(200).json({ success: true, message: "Beneficiary deactivated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export { addBeneficiary, getBeneficiaries, getBeneficiaryById, editBeneficiary, deleteBeneficiary };    