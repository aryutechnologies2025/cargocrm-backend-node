import ContainerRun from "../models/containerRunModel.js";
import Event from "../models/eventModel.js";
import Order from "../models/orderModel.js";
import { handleValidationError } from "./baseController.js";



 const addEvent = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.json({ success: false, message: "Data is required" });
    }

    const { event_name, run_number,tracking_number, quantity, weight, event_date, event_time, status,created_by } = req.body;

const runNumber = parseInt(run_number);
    const containerRun = await ContainerRun.findById(run_number);
   
    if (!containerRun) {
      return res.json({ 
        success: false, 
        errors: { run_number: "Invalid  container run" } 
      });
    }

    const trackingNumber = await Order.findById(tracking_number);

    if (!trackingNumber) {
      return res.json({ 
        success: false, 
        errors: { tracking_number: "Invalid tracking number" } 
      });
    }

    const event = new Event({
      event_name,
      run_number,
      tracking_number,
      quantity,
      weight,
      event_date,
      event_time,
      status,
      created_by
    });

    await event.save();
    
    await event.populate([
      { path: "created_by", select: "name email" }
    ]);

    res.json({ 
      success: true, 
      message: "Event added successfully", 

    });

  } catch (error) {
    console.error(error);
    res.json({ success: false, message:error.message || "Internal Server Error" });
  }
};

 const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ is_deleted: "0" })
      .populate("created_by", "name email")
      .sort({ event_date: -1, event_time: -1 });
      
    res.json({ success: true, data: events });
  } catch (error) {
    res.json({ success: false, message: error.message || "Internal Server Error" });
  }
};

 const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("created_by", "name email");
    
    if (!event) {
      return res.json({ success: false, message: "Event not found" });
    }
    
    res.json({ success: true, data: event });
  } catch (error) {
    res.json({ success: false, message: error.message || "Internal Server Error" });
  }
};


 const editEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findById(id);
    if (!event) {
      return res.json({ success: false, message: "Event not found" });
    }

    const { run_number } = req.body;
    
    // // If run number is being updated, verify container run exists
    // if (run_number && run_number !== event.run_number) {
    //   const containerRun = await ContainerRun.findOne({ 
    //     run_number: parseInt(run_number),
    //     status: "1" 
    //   });
      
    //   if (!containerRun) {
    //     return res.json({ 
    //       success: false, 
    //       errors: { run_number: "Invalid or inactive container run" } 
    //     });
    //   }
    // }

    // // Prevent updating tracking number as it's auto-generated
    // if (req.body.tracking_number) {
    //   delete req.body.tracking_number;
    // }

    const updated = await Event.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    }).populate("created_by", "name email");

    res.json({ 
      success: true, 
      message: "Event updated successfully", 

    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message:error.message || "Internal Server Error" });
  }
};

const deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const eventDetails = await Event.findByIdAndUpdate(
      id,
      { is_deleted: 1 },
      { new: true }
    );
    if (!eventDetails) {
      return res.json({ success: false, message: "Event Not Found" });
    }
    res.json({ success: true, message: "Event deleted successfully" });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
};


export {
  addEvent,
  getEvents,
  getEventById,
  editEvent,
  deleteEvent,
  
};