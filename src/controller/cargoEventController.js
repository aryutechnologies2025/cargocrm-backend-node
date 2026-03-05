import Event from "../models/eventModel.js";
import EventLog from "../models/evertLogModel.js";
import Order from "../models/orderModel.js";
import { encryptData } from "../utils/encryption.js";

import Beneficiary from "../models/beneficiaryModel.js";
import Parcel from "../models/parcelModel.js";
import Customer from "../models/customerModel.js";

const TrackingNumberInEvent = async (req, res) => {
    try {
        let { tracking_number } = req.query;
        console.log("tracking_number", tracking_number);

        if (!tracking_number) {
            return res.json({ success: false, message: "Tracking number is required" });
        }

        const trackingDocs = await Customer.find({
            tracking_number: tracking_number
        });

        const formattedTrackingDocs = trackingDocs.map((doc) => ({
            id: doc._id,
            tracking_number: doc.tracking_number,
            customerName: doc.customerName,
            customerEmail: doc.customerEmail,
            customerPhone: doc.customerPhone,
            customerAddress:doc.customerAddress,
            customerCity: doc.customerCity,
            customerCountry: doc.customerCountry,
            customerPostcode: doc.customerPostcode,
            beneficiaryName: doc.beneficiaryName,
            beneficiaryEmail: doc.beneficiaryEmail,
            beneficiaryPhone: doc.beneficiaryPhone, 
            beneficiaryAddress: doc.beneficiaryAddress,
            beneficiaryCity: doc.beneficiaryCity,
            beneficiaryCountry: doc.beneficiaryCountry,
            beneficiaryPostcode: doc.beneficiaryPostcode,
            cargo_mode: doc.cargo_mode,
            packed: doc.packed,
            piece_number: doc.piece_number,

        }));

        if(!trackingDocs || trackingDocs.length === 0){
            return res.status(404).json({ success: false, message: "No tracking number found" });
        }

        console.log("trackingDocs", trackingDocs);


        const trackingObjectIds = trackingDocs.map(doc => doc._id);
        console.log("trackingObjectIds", trackingObjectIds);

        const events = await EventLog.find({
            tracking_number: { $in: trackingObjectIds }
        })
            .populate("event_name", "name");
            


        const filteredEvents = events.filter(event =>
            event.tracking_number && event.tracking_number.length > 0
        );

        const formattedEvents = filteredEvents.map((event) => ({
            id: event._id,
            event_name: event.event_name?.name,
            event_date: event.event_date,
            event_time: event.event_time,
            createdAt: event.createdAt
        }));


        const currentEvents = await Event.findOne({
            tracking_number: { $in: trackingObjectIds }
        })
            .populate("event_name", "name");

        const formattedCurrentEvents = currentEvents ? [{
            id: currentEvents._id,
            event_name: currentEvents.event_name?.name,
            createdAt: currentEvents.createdAt,
            event_date: currentEvents.event_date,
            event_time: currentEvents.event_time,
        }] : [];
           


        const responseData = {
            success: true,
            eventLogs: formattedEvents,
            event:formattedCurrentEvents,
            order:formattedTrackingDocs
        };

        // res.status(200).json({ success: true, data: responseData });

        const encryptedData = encryptData(responseData);
        return res.status(200).json({ success: true, encrypted: true, data: encryptedData });

    } catch (error) {
        res.json({ success: false, message: error.message || "Internal Server Error" });
    }
};

export { TrackingNumberInEvent };