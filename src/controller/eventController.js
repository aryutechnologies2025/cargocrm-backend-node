import ContainerRun from "../models/containerRunModel.js";
import Event from "../models/eventModel.js";
import { handleValidationError } from "./baseController.js";

// Generate automatic tracking number
const generateTrackingNumber = async () => {
  const lastEvent = await Event.findOne().sort({ trackingNumber: -1 });
  const newNumber = lastEvent ? lastEvent.trackingNumber + 1 : 1000;
  return newNumber;
};

 const addEvent = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, message: "Data is required" });
    }

    const { eventName, runNumber, quantity, weight, eventDate, eventTime, status } = req.body;

    // Verify container run exists and is active
    const containerRun = await ContainerRun.findOne({ 
      runNumber: parseInt(runNumber),
      status: "active" 
    });
    
    if (!containerRun) {
      return res.status(400).json({ 
        success: false, 
        errors: { runNumber: "Invalid or inactive container run" } 
      });
    }

    // Generate automatic tracking number
    const trackingNumber = await generateTrackingNumber();

    const event = new Event({
      eventName,
      runNumber,
      trackingNumber,
      quantity,
      weight,
      eventDate,
      eventTime,
      status,
      createdBy: req.user._id
    });

    await event.save();
    
    await event.populate([
      { path: "createdBy", select: "name email" }
    ]);

    res.status(201).json({ 
      success: true, 
      message: "Event added successfully", 
      data: event 
    });

  } catch (error) {
    console.log("error", error);
    const validationError = handleValidationError(error, res);
    if (validationError) return;
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

 const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "active" })
      .populate("createdBy", "name email")
      .sort({ eventDate: -1, eventTime: -1 });
      
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

 const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("createdBy", "name email");
    
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

 const getEventsByRunNumber = async (req, res) => {
  try {
    const { runNumber } = req.params;
    
    const events = await Event.find({ 
      runNumber: parseInt(runNumber),
      status: "active" 
    })
      .populate("createdBy", "name email")
      .sort({ eventDate: -1, eventTime: -1 });
      
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

 const getEventsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide startDate and endDate" 
      });
    }

    const events = await Event.find({
      eventDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      status: "active"
    })
      .populate("createdBy", "name email")
      .sort({ eventDate: -1, eventTime: -1 });
      
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

 const getEventsByTrackingNumber = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    
    const event = await Event.findOne({ 
      trackingNumber: parseInt(trackingNumber),
      status: "active" 
    }).populate("createdBy", "name email");
    
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

 const editEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const { runNumber } = req.body;
    
    // If run number is being updated, verify container run exists
    if (runNumber && runNumber !== event.runNumber) {
      const containerRun = await ContainerRun.findOne({ 
        runNumber: parseInt(runNumber),
        status: "active" 
      });
      
      if (!containerRun) {
        return res.status(400).json({ 
          success: false, 
          errors: { runNumber: "Invalid or inactive container run" } 
        });
      }
    }

    // Prevent updating tracking number as it's auto-generated
    if (req.body.trackingNumber) {
      delete req.body.trackingNumber;
    }

    const updated = await Event.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    }).populate("createdBy", "name email");

    res.status(200).json({ 
      success: true, 
      message: "Event updated successfully", 
      data: updated 
    });
  } catch (error) {
    console.log("error", error);
    const validationError = handleValidationError(error, res);
    if (validationError) return;
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

 const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    event.status = "inactive";
    await event.save();

    res.status(200).json({ success: true, message: "Event deactivated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

 const getEventStats = async (req, res) => {
  try {
    const stats = await Event.aggregate([
      { $match: { status: "active" } },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
          totalWeight: { $sum: "$weight" },
          avgQuantity: { $avg: "$quantity" },
          avgWeight: { $avg: "$weight" }
        }
      }
    ]);

    const runStats = await Event.aggregate([
      { $match: { status: "active" } },
      {
        $group: {
          _id: "$runNumber",
          eventCount: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
          totalWeight: { $sum: "$weight" }
        }
      },
      { $sort: { runNumber: 1 } }
    ]);

    res.status(200).json({ 
      success: true, 
      data: {
        overall: stats[0] || { totalEvents: 0, totalQuantity: 0, totalWeight: 0 },
        byRun: runStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export {
  addEvent,
  getEvents,
  getEventById,
  editEvent,
  deleteEvent,
  getEventStats,getEventsByTrackingNumber,
  getEventsByRunNumber,
  getEventsByDateRange
};