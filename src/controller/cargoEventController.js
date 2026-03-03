import Event from "../models/eventModel.js";
import EventLog from "../models/evertLogModel.js";
import Order from "../models/orderModel.js";
import { encryptData } from "../utils/encryption.js";

import Beneficiary from "../models/beneficiaryModel.js";
import Parcel from "../models/parcelModel.js";

const TrackingNumberInEvent = async (req, res) => {
    try {
        let { tracking_number } = req.query;
        console.log("tracking_number", tracking_number);

        if (!tracking_number) {
            return res.json({ success: false, message: "Tracking number is required" });
        }

        const trackingDocs = await Order.find({
            tracking_number: tracking_number
        });

        if(!trackingDocs || trackingDocs.length === 0){
            return res.json({ success: false, message: "No tracking number found" });
        }

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

        const formattedEvents = filteredEvents.map((event) => ({
            id: event._id,
            event_name: event.event_name?.name,
            cargo_mode: event.tracking_number?.cargo_mode,
            packed: event.tracking_number?.packed,
            quantity: event.quantity,
            weight: event.weight,
            createdAt: event.createdAt
        }));


        const currentEvents = await Event.findOne({
            tracking_number: { $in: trackingObjectIds }
        })
            .populate("event_name", "name");

        const formattedCurrentEvents = currentEvents ? [{
            id: currentEvents._id,
            event_name: currentEvents.event_name?.name,
            cargo_mode: currentEvents.tracking_number?.cargo_mode,
            packed: currentEvents.tracking_number?.packed,
            quantity: currentEvents.quantity,
            weight: currentEvents.weight,
            createdAt: currentEvents.createdAt,
            event_date: currentEvents.event_date,
            event_time: currentEvents.event_time,
            tracking_number: currentEvents.tracking_number?.tracking_number
        }] : [];
           

//        const eventDateAndTime = await Event.find({
//     tracking_number: { $in: trackingObjectIds },
//     event_name: "pickup"
// })
// .populate({
//     path: "tracking_number",
//     match: { tracking_number: tracking_number }
// });

        // let beneficiaryDetails = [];

        const beneficiaryDetails = await Beneficiary.find({
            tracking_number: tracking_number
        }).populate("customerId", "name email phone address city country");


        const formattedBeneficiary = beneficiaryDetails.map((beneficiary) => ({
            id: beneficiary._id,
            beneficiary_name: beneficiary.name,
            beneficiary_email: beneficiary.email,
            beneficiary_phone: beneficiary.phone,
            beneficiary_address: beneficiary.address,
            beneficiary_city: beneficiary.city,
            beneficiary_country: beneficiary.country,
            customer_name: beneficiary.customerId?.name,
            customer_email: beneficiary.customerId?.email,
            customer_phone: beneficiary.customerId?.phone,
            customer_address: beneficiary.customerId?.address,
            customer_city: beneficiary.customerId?.city,
            customer_country: beneficiary.customerId?.country,
        }));

        console.log("beneficiaryDetails", beneficiaryDetails);

        const parcelDetails = await Parcel.findOne({
            customerId: beneficiaryDetails ? beneficiaryDetails.customerId : null,
            // customerId: { $in: beneficiaryDetails.map(b => b.customerId) }
        });


        // res.json({ 
        //   success: true, 
        //   data: formattedEvents, 
        //   beneficiary: formattedBeneficiary,
        //   parcel: parcelDetails,
        //   event:formattedCurrentEvents
        // });

        const responseData = {
            success: true,
            data: formattedEvents,
            beneficiary: formattedBeneficiary,
            parcel: parcelDetails,
            event:formattedCurrentEvents
        };

        res.status(200).json({ success: true, data: responseData });

        // const encryptedData = encryptData(responseData);
        // return res.status(200).json({ success: true, encrypted: true, data: encryptedData });

    } catch (error) {
        res.json({ success: false, message: error.message || "Internal Server Error" });
    }
};

export { TrackingNumberInEvent };