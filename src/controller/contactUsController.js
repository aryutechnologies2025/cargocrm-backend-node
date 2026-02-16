import ContactUs from "../models/contactUsModel.js";
import { handleValidationError, checkExistingRecord } from "./baseController.js";

// Add new contact message
 const addContactMessage = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, message: "Data is required" });
    }

    const { name, email, message, status } = req.body;

    // Check if email already exists
    const emailExists = await checkExistingRecord(ContactUs, { email }, "email", res);
    if (emailExists) return;

    const contactMessage = new ContactUs({
      name,
      email,
      message,
      status: status || "active",
      createdBy: req.user._id
    });

    await contactMessage.save();
    
    // Populate createdBy for response
    await contactMessage.populate("createdBy", "name email");

    res.status(201).json({ 
      success: true, 
      message: "Contact message sent successfully", 
      data: contactMessage 
    });

  } catch (error) {
    console.log("error", error);
    const validationError = handleValidationError(error, res);
    if (validationError) return;
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get all active contact messages
 const getContactMessages = async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await ContactUs.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ContactUs.countDocuments(query);

    res.status(200).json({ 
      success: true, 
      data: messages,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get contact message by ID
 const getContactMessageById = async (req, res) => {
  try {
    const message = await ContactUs.findById(req.params.id)
      .populate("createdBy", "name email");
    
    if (!message) {
      return res.status(404).json({ success: false, message: "Contact message not found" });
    }
    
    res.status(200).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get contact messages by email
 const getContactMessagesByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    
    const messages = await ContactUs.find({ 
      email: email.toLowerCase(),
      status: "active" 
    })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
      
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Edit/Update contact message
 const editContactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await ContactUs.findById(id);
    if (!message) {
      return res.status(404).json({ success: false, message: "Contact message not found" });
    }

    const { email } = req.body;
    
    // Check if email is being changed and if it already exists
    if (email && email !== message.email) {
      const emailExists = await checkExistingRecord(
        ContactUs, 
        { email, _id: { $ne: id } }, 
        "email", 
        res
      );
      if (emailExists) return;
    }

    const updated = await ContactUs.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    }).populate("createdBy", "name email");

    res.status(200).json({ 
      success: true, 
      message: "Contact message updated successfully", 
      data: updated 
    });
  } catch (error) {
    console.log("error", error);
    const validationError = handleValidationError(error, res);
    if (validationError) return;
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Delete/Deactivate contact message
 const deleteContactMessage = async (req, res) => {
  try {
    const message = await ContactUs.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ success: false, message: "Contact message not found" });
    }

    message.status = "inactive";
    await message.save();

    res.status(200).json({ success: true, message: "Contact message deactivated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Permanent delete (use with caution)
 const permanentDeleteContactMessage = async (req, res) => {
  try {
    const message = await ContactUs.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ success: false, message: "Contact message not found" });
    }

    await ContactUs.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Contact message permanently deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Mark message as read/replied
 const markAsReplied = async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await ContactUs.findById(id);
    if (!message) {
      return res.status(404).json({ success: false, message: "Contact message not found" });
    }

    // You can add a custom field for replied status if needed
    // For now, we'll update the message with a note
    const updated = await ContactUs.findByIdAndUpdate(
      id, 
      { 
        $set: { 
          "replied": true,
          "repliedAt": new Date(),
          "repliedBy": req.user._id
        } 
      }, 
      {
        new: true,
        runValidators: true
      }
    ).populate("createdBy", "name email");

    res.status(200).json({ 
      success: true, 
      message: "Message marked as replied", 
      data: updated 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get message statistics
 const getContactStats = async (req, res) => {
  try {
    const stats = await ContactUs.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const totalMessages = await ContactUs.countDocuments();
    const activeMessages = await ContactUs.countDocuments({ status: "active" });
    const inactiveMessages = await ContactUs.countDocuments({ status: "inactive" });

    // Get messages per day for the last 7 days
    const last7Days = await ContactUs.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 7))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } }
    ]);

    res.status(200).json({ 
      success: true, 
      data: {
        total: totalMessages,
        active: activeMessages,
        inactive: inactiveMessages,
        byStatus: stats,
        last7Days: last7Days
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Search contact messages
 const searchContactMessages = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide a search query" 
      });
    }

    const messages = await ContactUs.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { message: { $regex: query, $options: "i" } }
      ],
      status: "active"
    })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ 
      success: true, 
      data: messages,
      count: messages.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Bulk update status
 const bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide an array of message IDs" 
      });
    }

    if (!status || !["active", "inactive"].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide a valid status (active/inactive)" 
      });
    }

    const result = await ContactUs.updateMany(
      { _id: { $in: ids } },
      { $set: { status } }
    );

    res.status(200).json({ 
      success: true, 
      message: `${result.modifiedCount} messages updated successfully`,
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export { 
    addContactMessage, 
  getContactMessages,
  getContactMessageById, 
  getContactMessagesByEmail,
  editContactMessage, 
  deleteContactMessage,
  permanentDeleteContactMessage,
  markAsReplied,
  getContactStats, 
  searchContactMessages, 
  bulkUpdateStatus
      };