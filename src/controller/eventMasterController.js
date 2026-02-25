import EventMaster from "../models/eventMasterModel.js";
import { encryptData } from "../utils/encryption.js";

const createEventMaster = async (req, res) => {
    try {
        const { name, status } = req.body;
        const eventMaster = new EventMaster({ name , status});
        await eventMaster.save();
        res.status(201).json(eventMaster);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getEventMasters = async (req, res) => {
    try {
        const eventMasters = await EventMaster.find({is_deleted: "0"});
        const formatedEventMasters = eventMasters.map((eventMaster) => ({
            id: eventMaster._id,
            name: eventMaster.name,
            status: eventMaster.status
        }))
        const responseData = {
            success: true,
            data: formatedEventMasters
        };
        const encryptedData = encryptData(responseData);
        
            return res.status(200).json({
              success: true,
              encrypted: true,
              data: encryptedData,
            });
        // res.status(200).json(eventMasters);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};  

const editEventMaster = async(req, res) =>{
    try {
        const { id } = req.params;
        const { name, status } = req.body;
        const eventMaster = await EventMaster.findById(id);
        if (!eventMaster) {
            return res.status(404).json({ message: "Event Master not found" });
        }
        eventMaster.name = name;
        eventMaster.status = status;
        await eventMaster.save();
        res.status(200).json(eventMaster);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteEventMaster = async(req, res) =>{
    try {
        const { id } = req.params;
        const eventMaster = await EventMaster.findById(id);
        if (!eventMaster) {
            return res.status(404).json({ message: "Event Master not found" });
        }
        eventMaster.is_deleted = "1";
        await eventMaster.save();
        res.status(200).json(eventMaster);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export {
    createEventMaster,
    getEventMasters,
    editEventMaster,
    deleteEventMaster
}