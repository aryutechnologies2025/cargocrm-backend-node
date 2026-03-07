
import BeneficiaryLog from "../models/beneficiaryLogModel.js";
import Beneficiary from "../models/beneficiaryModel.js";
import CustomerLog from "../models/customerLogModel.js";
import Customer from "../models/customerModel.js";
import { encryptData } from "../utils/encryption.js";
import { checkExistingRecord, handleValidationError } from "./baseController.js";
import User from "../models/userModel.js";
import Roles from "../models/roleModels.js";

const addCustomer = async (req, res) => {
  try {

    const { tracking_number, customerName, customerEmail, customerPhone, customerAddress, customerCity, customerCountry, customerPostcode, beneficiaryName, beneficiaryEmail, beneficiaryPhone, beneficiaryAddress, beneficiaryCity, beneficiaryCountry, beneficiaryPostcode, piece_number, piece_details, description, cargo_mode, packed, created_by } = req.body;

    const customer = new Customer({
      tracking_number, customerName, customerEmail, customerPhone, customerAddress, customerCity, customerCountry, customerPostcode, beneficiaryName, beneficiaryEmail, beneficiaryPhone, beneficiaryAddress, beneficiaryCity, beneficiaryCountry, beneficiaryPostcode, piece_number, piece_details, description, cargo_mode, packed, created_by
    });

    await customer.save();

    const customerLogs = new CustomerLog({
      customerName, customerEmail, customerPhone, customerAddress, customerCity, customerCountry, customerPostcode
    });
    await customerLogs.save();

    const beneficiaryLog = new BeneficiaryLog({
      beneficiaryName, beneficiaryEmail, beneficiaryPhone, beneficiaryAddress, beneficiaryCity, beneficiaryCountry, beneficiaryPostcode
    });
    beneficiaryLog.customerId = customerLogs._id;
    await beneficiaryLog.save();

    res.json({ success: true, message: "Customer added successfully" });

  } catch (error) {
    console.error("ADD CUSTOMER ERROR:", error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

const getCustomers = async (req, res) => {
  const { customerName, beneficiaryName, created_by_name, cargo_mode, from_date, to_date, created_by } = req.query;

  try {

    const roleDetails = await Roles.findById(created_by);


    let filter = { is_deleted: "0" };

    if (roleDetails?.name !== "Admin") {
      filter.created_by = created_by;
    }

    if (customerName) {
      filter.customerName = { $regex: customerName, $options: 'i' };
    }

    if (beneficiaryName) {
      filter.beneficiaryName = { $regex: beneficiaryName, $options: 'i' };
    }

    if (created_by_name) {

      filter.created_by = created_by_name;

    }

    if (cargo_mode) {
      filter.cargo_mode = cargo_mode;
    }

    if (from_date || to_date) {
      filter.createdAt = {};

      if (from_date) {
        const fromDateObj = new Date(from_date);
        if (isNaN(fromDateObj)) {
          return res.json({
            success: false,
            message: "Invalid from_date format"
          });
        }
        filter.createdAt.$gte = fromDateObj;
      }

      if (to_date) {
        const toDateObj = new Date(to_date);
        if (isNaN(toDateObj)) {
          return res.json({
            success: false,
            message: "Invalid to_date format"
          });
        }
        const endDate = new Date(toDateObj);
        endDate.setDate(endDate.getDate() + 1);
        filter.createdAt.$lt = endDate;
      }
    }

    const customers = await Customer.find(filter)
      .populate("created_by", "name email")
      .sort({ createdAt: -1 });

    const userDetails = await User.find({ is_deleted: "0", status: "1" });
    const formattedUserDetails = userDetails.map((user) => ({
      id: user._id,
      name: user.name
    }));

    const responseData = {
      success: true,
      data: customers,
      user: formattedUserDetails
    };

    const encryptedData = encryptData(responseData);
    return res.json({ success: true, encrypted: true, data: encryptedData });

  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
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
    res.json({ success: false, message: error.message || "Internal Server Error" });
  }
};

const editCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Customer.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, message: "Customer updated successfully" });
  } catch (error) {
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

// const addCustomers = async (req, res) => {
//   try {
//     const { name, phone, email, address, city, country, postcode, created_by } = req.body;

//     if (req.body.id && req.body.mode !== "existing") {
//       const existingCustomer = await Customer.findById(req.body.id);
//       if (existingCustomer) {
//         existingCustomer.name = name;
//         existingCustomer.phone = phone;
//         existingCustomer.email = email;
//         existingCustomer.address = address;
//         existingCustomer.city = city;
//         existingCustomer.country = country;
//         existingCustomer.postcode = postcode;
//         await existingCustomer.save();

//         return res.json({
//           success: true,
//           message: "Customer updated successfully",
//           data: existingCustomer
//         });
//       }
//     }

//     const customer = new Customer({ name, phone, email, address, postcode, city, country, created_by });
//     await customer.save();

//     res.json({
//       success: true,
//       message: "Customer added successfully",
//       data: customer
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message || "Internal Server Error"
//     });
//   }
// };

// const getCustomer = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log("ID:", id);
//     console.log("ID:", id);
//     const customer = await Customer.findOne({
//       _id: id,
//       is_deleted: "0"
//     });

//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: "Customer not found"
//       });
//     }

//     const responseData = {
//       success: true,
//       data: customer
//     };

//     const encryptedData = encryptData(responseData);
//     return res.status(200).json({
//       success: true,
//       encrypted: true,
//       data: encryptedData,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message || "Internal Server Error"
//     });
//   }
// };

// const getAllCustomers = async (req, res) => {
//   try {
//     const customers = await Customer.find({ is_deleted: "0" });

//     const responseData = {
//       success: true,
//       data: customers
//     };

//     const encryptedData = encryptData(responseData);
//     return res.status(200).json({
//       success: true,
//       encrypted: true,
//       data: encryptedData,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message || "Internal Server Error"
//     });
//   }
// };


// const customerDetailByPhoneNumber = async (req, res) => {
//   try {
//     const { phone } = req.params;
//     const customer = await Customer.findOne({ phone }).sort({ createdAt: -1 });

//     res.json({ success: true, data: customer });
//   } catch (error) {
//     res.json({ success: false, message: "Internal Server Error" });
//   }
// }

const getCustomerName = async (req, res) => {
  try {
    const getCustomerName = await CustomerLog.find();
    const formattedCustomerData = getCustomerName.map((customer) => ({
      id: customer._id,
      name: customer.customerName
    }));

    const responseData = {
      success: true,
      customer: formattedCustomerData,
    };
    // res.status(200).json({ success: true, data: responseData });
    const encryptedData = encryptData(responseData);
    return res.json({ success: true, encrypted: true, data: encryptedData });
  } catch (error) {
    res.json({ success: false, message: "Internal Server Error" });
  }
}
const getBeneficiaryName = async (req, res) => {
  const { id } = req.query;
  console.log("ben id:", id);
  try {
    const getBeneficiaryName = await BeneficiaryLog.find({ customerId: id });
    const formattedBeneficiaryData = getBeneficiaryName.map((beneficiary) => ({
      id: beneficiary._id,
      name: beneficiary.beneficiaryName
    }));
    const responseData = {
      success: true,
      beneficiary: formattedBeneficiaryData
    };
    // res.status(200).json({ success: true, data: responseData });
    const encryptedData = encryptData(responseData);
    return res.json({ success: true, encrypted: true, data: encryptedData });
  } catch (error) {
    res.json({ success: false, message: "Internal Server Error" });
  }
}
const getCustomerDetails = async (req, res) => {
  try {
    const { id } = req.query;
    const customerDetails = await CustomerLog.findById(id);
    const formattedCustomerDetails = {
      id: customerDetails._id,
      name: customerDetails.customerName,
      phone: customerDetails.customerPhone,
      email: customerDetails.customerEmail,
      address: customerDetails.customerAddress,
      city: customerDetails.customerCity,
      country: customerDetails.customerCountry,
      postcode: customerDetails.customerPostcode,
    };

    const responseData = {
      success: true,
      customer: formattedCustomerDetails
    };
    // res.status(200).json({ success: true, data: responseData });
    const encryptedData = encryptData(responseData);
    return res.json({ success: true, encrypted: true, data: encryptedData });
  } catch (error) {
    res.json({ success: false, message: "Internal Server Error" });
  }
}

const getBeneficiaryDetails = async (req, res) => {
  try {
    const { id } = req.query;
    const beneficiaryDetails = await BeneficiaryLog.findById(id);

    const formattedBeneficiaryDetails = {
      id: beneficiaryDetails._id,
      name: beneficiaryDetails.beneficiaryName,
      phone: beneficiaryDetails.beneficiaryPhone,
      email: beneficiaryDetails.beneficiaryEmail,
      address: beneficiaryDetails.beneficiaryAddress,
      city: beneficiaryDetails.beneficiaryCity,
      country: beneficiaryDetails.beneficiaryCountry,
      postcode: beneficiaryDetails.beneficiaryPostcode,
    };

    const responseData = {
      success: true,
      beneficiary: formattedBeneficiaryDetails
    };
    // res.status(200).json({ success: true, data: responseData });
    const encryptedData = encryptData(responseData);
    return res.json({ success: true, encrypted: true, data: encryptedData });
  } catch (error) {
    res.json({ success: false, message: "Internal Server Error" });
  }
}



export { getCustomerDetails, getCustomerName, getBeneficiaryDetails, getBeneficiaryName, addCustomer, getCustomers, getCustomerById, editCustomer, deleteCustomer };