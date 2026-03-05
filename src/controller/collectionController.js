import CollectionDetails from "../models/collectionModel.js";
import Customer from "../models/customerModel.js";
import Order from "../models/orderModel.js";
import { encryptData } from "../utils/encryption.js";

const addCollection = async (req, res) => {
    try {
        const { orderId, address, date_time, city, country, postcode,email,phone_no,alter_phone,collection_for,notes } = req.body;
        const collection = new CollectionDetails({ orderId, address, date_time, city, country, postcode,email,phone_no,alter_phone,collection_for,notes });
        await collection.save();
        res.json({ success: true, message: "Collection added successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message || "Internal Server Error" });
    }
}

const getCollection = async (req, res) => {
    try {
        const collectionDetails = await CollectionDetails.find({is_deleted: "0"})
            .populate("orderId", "tracking_number")
        const customerDetails = await Customer.find({ is_deleted: "0" });
        const formattedCollectionDetails = collectionDetails.map((collection) => ({
            id: collection._id,
            orderId: collection.orderId,
            tracking_number: collection?.orderId?.tracking_number,
            address: collection.address,
            date_time: collection.date_time,
            city: collection.city,
            country: collection.country,
            postcode: collection.postcode,
            email: collection.email,
            phone_no: collection.phone_no,
            alter_phone: collection.alter_phone,
            collection_for: collection.collection_for,
            notes: collection.notes,
            status: collection.status,
        }));
        const formattedCustomers = customerDetails.map((customer) => ({
            id: customer._id,
            name: customer?.tracking_number,
        }));
        const responseData = {
            success: true,
            data: formattedCollectionDetails,
            customer: formattedCustomers
        }
        const encryptedData = encryptData(responseData);
        return res.status(200).json({
            success: true,
            encrypted: true,
            data: encryptedData,
        });
    } catch (error) {
        res.json({ success: false, message: error.message || "Internal Server Error" });
    }
}

const editCollection = async (req, res) => {
    try {
        const { id } = req.params;
        const { orderId, address, date_time,city, country, postcode,email,phone_no,alter_phone,collection_for,notes,status } = req.body;
        const collection = await CollectionDetails.findById(id);
        if (!collection) {
            return res.json({ success: false, message: "Collection not found" });
        }
        collection.orderId = orderId;
        collection.address = address;
        collection.date_time = date_time;
        collection.city = city;
        collection.country = country;
        collection.postcode = postcode;
        collection.email = email;
        collection.phone_no = phone_no;
        collection.alter_phone = alter_phone;
        collection.collection_for = collection_for;
        collection.notes = notes;
        collection.status = status;
        await collection.save();
        res.json({ success: true, message: "Collection updated successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message || "Internal Server Error" });
    }
}

const deleteCollection = async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await CollectionDetails.findByIdAndUpdate(
            id,
            { is_deleted: 1 },
            { new: true }
        );
        console.log("collection", collection);
      
        res.json({ success: true, message: "Collection deleted successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message || "Internal Server Error" });
    }
}

export { addCollection, getCollection, editCollection, deleteCollection };