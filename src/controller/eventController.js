import ContainerRun from "../models/containerRunModel.js";
import EventMaster from "../models/eventMasterModel.js";
import Event from "../models/eventModel.js";
import EventLog from "../models/evertLogModel.js";
import Order from "../models/orderModel.js";
import { encryptData } from "../utils/encryption.js";
import { handleValidationError } from "./baseController.js";
import mongoose from "mongoose";
import Customer from "../models/customerModel.js";

import Beneficiary from "../models/beneficiaryModel.js";
import Parcel from "../models/parcelModel.js";


const addEvent = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.json({ success: false, message: "Data is required" });
    }

    const { event_name, run_number, tracking_number, event, quantity, weight, event_date, event_time, status, created_by } = req.body;

    const events = new Event({
      event_name,
      event,
      run_number,
      tracking_number,
      quantity,
      weight,
      event_date,
      event_time,
      status,
      created_by
    });

    await events.save();

    await events.populate([
      { path: "created_by", select: "name email" }
    ]);

    const EventLogs = new EventLog({
      event_name,
      tracking_number,
      quantity,
      weight,
      event_date,
      event_time,
      customer_id : events.customer_id
    });

    await EventLogs.save();

    res.json({
      success: true,
      message: "Event added successfully",

    });

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message || "Internal Server Error" });
  }
};

const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ is_deleted: "0" })
      .populate("run_number", "run_number")
      .populate("event_name", "name")
      .populate("tracking_number", "tracking_number")
      .populate("created_by", "name email")
      .sort({ createdAt: -1 });
    const eventMaster = await EventMaster.find({ is_deleted: "0", status: "1" });
    const orders = await Order.find({ is_deleted: "0", status: "1" });
    const container = await ContainerRun.find({ is_deleted: "0", status: "1" });

    const formattedEvents = events.map((event) => ({
      id: event._id,
      event_name: event.event_name?.name,
      event_id: event.event_name?._id,
      run_number: event.run_number?.run_number,
      run_id: event.run_number?._id,
      tracking_number: event.tracking_number,
      tracking_id: event.tracking_number?._id,
      event: event.event,
      quantity: event.quantity,
      weight: event.weight,
      event_date: event.event_date,
      event_time: event.event_time,
      status: event.status,
      created_by: event.created_by?.name,
    }));
    const formattedEventMasters = eventMaster.map((event) => ({
      id: event._id,
      name: event.name,
    }));
    const formattedOrders = orders.map((order) => ({
      id: order._id,
      tracking_number: order.tracking_number,
    }));
    const formattedContainers = container.map((container) => ({
      id: container._id,
      run_number: container.run_number,
    }));
    const responseData = {
      success: true,
      events: formattedEvents,
      eventMasters: formattedEventMasters,
      orders: formattedOrders,
      containers: formattedContainers
    };
    const encryptedData = encryptData(responseData);

    res.json({ success: true, encrypted: true, data: encryptedData });
    // res.json({ success: true, data: formattedEvents, eventMasters: formattedEventMasters, orders: formattedOrders, containers: formattedContainers });
    // res.json({ success: true, data: responseData });
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

    const EventLogs = new EventLog({
      event_name: updated.event_name,
      tracking_number: updated.tracking_number,
      quantity: updated.quantity,
      weight: updated.weight,
      event_date: updated.event_date,
      event_time: updated.event_time,
      customer_id : updated.customer_id
    });

    await EventLogs.save();

    res.json({
      success: true,
      message: "Event updated successfully",

    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message || "Internal Server Error" });
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


const TrackingNumberInEvent = async (req, res) => {
  try {
    let { tracking_number } = req.body;
    console.log("tracking_number", tracking_number);

    if (!tracking_number) {
      return res.json({ success: false, message: "Tracking number is required" });
    }

    const trackingDocs = await Order.find({
      tracking_number: tracking_number
    });

    console.log("trackingDocs", trackingDocs);

    const trackingObjectIds = trackingDocs.map(doc => doc._id);
    console.log("trackingObjectIds", trackingObjectIds);
    
    const events = await EventLog.find({
      tracking_number: { $in: trackingObjectIds }
    })
    .populate("event_name", "name")
    .populate({
      path: "tracking_number",
      match: { tracking_number: tracking_number }
    });

    const filteredEvents = events.filter(event => 
      event.tracking_number && event.tracking_number.length > 0
    );

    let beneficiaryDetails = [];
    
      beneficiaryDetails = await Beneficiary.findOne({
        tracking_number: tracking_number
      }).populate("customerId", "name email phone");

      console.log("beneficiaryDetails", beneficiaryDetails);

      const parcelDetails = await Parcel.findOne({
        customerId: beneficiaryDetails ? beneficiaryDetails.customerId : null,
        // customerId: { $in: beneficiaryDetails.map(b => b.customerId) }
      });
    

    res.json({ 
      success: true, 
      data: filteredEvents, 
      beneficiary: beneficiaryDetails,
      parcel: parcelDetails
    });

  } catch (error) {
    res.json({ success: false, message: error.message || "Internal Server Error" });
  }
};


export {
  addEvent,
  getEvents,
  getEventById,
  editEvent,
  deleteEvent,
  TrackingNumberInEvent
};