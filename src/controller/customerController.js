
import Customer from "../models/customerModel.js";
import { encryptData } from "../utils/encryption.js";
import { checkExistingRecord, handleValidationError } from "./baseController.js";

const generateCustomerId = async () => {
  const lastCustomer = await Customer.findOne()
    .sort({ createdAt: -1 })
    .select("customer_id");

  // First customer
  if (
    !lastCustomer ||
    !lastCustomer.customer_id ||
    isNaN(Number(lastCustomer.customer_id))
  ) {
    return "00001";
  }

  const lastNumber = Number(lastCustomer.customer_id);
  const nextNumber = lastNumber + 1;

  return String(nextNumber).padStart(5, "0");
};


 const addCustomer = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.json({ success: false, message: "Data is required" });
    }

    const { name, email, phone, address, status,create_by } = req.body;

    // Check if email already exists
      const emailExists = await Customer.findOne({ email });
    if (emailExists) {
      return res.json({
        success: false,
        message: "Email already exists"
      });
    }

     //  Generate customerId
    const customer_id = await generateCustomerId();

    const customer = new Customer({
      customer_id,
      name,
      email,
      phone,
      address,
      status,
      create_by
    });

    await customer.save();
    res.json({ success: true, message: "Customer added successfully"});

  }catch (error) {
    console.error("ADD CUSTOMER ERROR:", error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

 const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({  is_deleted: "0" })
      .populate("created_by", "name email");
    res.json({ success: true, data: customers });
  } catch (error) {
    res.json({ success: false, message: "Internal Server Error" });
  }
};

 const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.json({ success: false, message: "Customer not found" });
    }
    
    res.json({ success: true, data: customer });
  } catch (error) {
    res.json({ success: false, message:error.message || "Internal Server Error" });
  }
};

 const editCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.json({ success: false, message: "Customer not found" });
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

    res.json({ success: true, message: "Customer updated successfully"});
  }catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message || "Internal Server Error" });
  }
};

 const deleteCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    const customerDetails = await Customer.findByIdAndUpdate(
      id,
      { is_deleted: 1 },
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

const addCustomers = async (req, res) => {
    try {
        const { name, phone, email, address, city, country, created_by } = req.body;
        
        if (req.body.id) {
            const existingCustomer = await Customer.findById(req.body.id);
            if (existingCustomer) {
                existingCustomer.name = name;
                existingCustomer.phone = phone;
                existingCustomer.email = email;
                existingCustomer.address = address;
                existingCustomer.city = city;
                existingCustomer.country = country;
                await existingCustomer.save();
                
                return res.json({ 
                    success: true, 
                    message: "Customer updated successfully",
                    data: existingCustomer 
                });
            }
        }

        const customer = new Customer({ name, phone, email, address, city, country, created_by });
        await customer.save();
        
        res.json({ 
            success: true, 
            message: "Customer added successfully",
            data: customer 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message || "Internal Server Error" 
        });
    }
};

const getCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("ID:", id);
        console.log("ID:", id);
        const customer = await Customer.findOne({ 
            _id: id, 
            is_deleted: "0" 
        });
        
        if (!customer) {
            return res.status(404).json({ 
                success: false, 
                message: "Customer not found" 
            });
        }

        const responseData = {
            success: true,
            data: customer
        };
        
        const encryptedData = encryptData(responseData);
        return res.status(200).json({
            success: true,
            encrypted: true,
            data: encryptedData,
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message || "Internal Server Error" 
        });
    }
};

const getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.find({ is_deleted: "0" });
        
        const responseData = {
            success: true,
            data: customers
        };
        
        const encryptedData = encryptData(responseData);
        return res.status(200).json({
            success: true,
            encrypted: true,
            data: encryptedData,
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message || "Internal Server Error" 
        });
    }
};


const customerDetailByPhoneNumber = async(req,res) =>{
    try {
        const { phone } = req.params;
        const customer = await Customer.findOne({ phone }).sort({ createdAt: -1 });

        res.json({ success: true, data: customer });
    } catch (error) {
        res.json({ success: false, message: "Internal Server Error" });
    }
}

// export { addCustomers, getCustomer, getAllCustomers };


export {customerDetailByPhoneNumber,addCustomers, getCustomer, getAllCustomers, addCustomer, getCustomers, getCustomerById, editCustomer, deleteCustomer };