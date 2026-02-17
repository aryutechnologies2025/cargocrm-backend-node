
import Customer from "../models/customerModel.js";
import { checkExistingRecord, handleValidationError } from "./baseController.js";

const generateCustomerId = async () => {
  const lastCustomer = await Customer.findOne()
    .sort({ createdAt: -1 })
    .select("customerId");

  if (!lastCustomer || !lastCustomer.customerId) {
    return "custom-0001";
  }

  const lastNumber = parseInt(
    lastCustomer.customerId.split("-")[1],
    10
  );

  const nextNumber = lastNumber + 1;

  return `custom-${String(nextNumber).padStart(4, "0")}`;
};


 const addCustomer = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, message: "Data is required" });
    }

    const { name, email, phone, address, status } = req.body;

    // Check if email already exists
      const emailExists = await Customer.findOne({ email });
    if (emailExists) {
      return res.json({
        success: false,
        message: "Email already exists"
      });
    }

     //  Generate customerId
    const customerId = await generateCustomerId();

    const customer = new Customer({
      customerId,
      name,
      email,
      phone,
      address,
      status,
      createdBy
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
    const customers = await Customer.find({  isDeleted: "0" })
      .populate("createdBy", "name", " email");
    res.json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

 const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate("createdBy", "name", " email");
    
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
  const { id } = req.params;
  try {
    const customerDetails = await User.findByIdAndUpdate(
      id,
      { isDeleted: 1 },
      { new: true }
    );
    if (!customerDetails) {
      return res.json({ success: false, message: "Customer Not Found" });
    }
    res.json({ success: true, message: "Customer deleted successfully" });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
};


export { addCustomer, getCustomers, getCustomerById, editCustomer, deleteCustomer };