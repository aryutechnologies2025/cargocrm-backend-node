
import Customer from "../models/customerModel.js";
import { checkExistingRecord, handleValidationError } from "./baseController.js";


 const addCustomer = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, message: "Data is required" });
    }

    const { name, email, phone, address, status } = req.body;

    // Check if email already exists
    const emailExists = await checkExistingRecord(Customer, { email }, "email", res);
    if (emailExists) return;

    const customer = new Customer({
      name,
      email,
      phone,
      address,
      status,
      createdBy: req.user._id
    });

    await customer.save();
    res.status(201).json({ success: true, message: "Customer added successfully", data: customer });

  } catch (error) {
    console.log("error", error);
    const validationError = handleValidationError(error, res);
    if (validationError) return;
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

 const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ status: "1" })
      .populate("createdBy", "name email");
    res.status(200).json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

 const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate("createdBy", "name email");
    
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

 const editCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    const { email } = req.body;
    if (email && email !== customer.email) {
      const emailExists = await checkExistingRecord(Customer, { email, _id: { $ne: id } }, "email", res);
      if (emailExists) return;
    }

    const updated = await Customer.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, message: "Customer updated successfully", data: updated });
  } catch (error) {
    console.log("error", error);
    const validationError = handleValidationError(error, res);
    if (validationError) return;
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

 const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    customer.status = "inactive";
    await customer.save();

    res.status(200).json({ success: true, message: "Customer deactivated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export { addCustomer, getCustomers, getCustomerById, editCustomer, deleteCustomer };