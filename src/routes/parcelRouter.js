import express from "express";
import useAuth from "../middlewares/authMiddleware.js";
import { addParcel, 
    deleteParcel, 
    editParcel, 
    getParcelById, 
    getParcels 
} from "../controller/parcelController.js";

const parcelRouter = express.Router();

parcelRouter.post("/create-parcels", addParcel);
parcelRouter.get("/view-parcels", getParcels);
parcelRouter.get("/view-parcels/:id", getParcelById);
parcelRouter.put("/edit-parcels/:id", editParcel);
parcelRouter.delete("/delete-parcels/:id", deleteParcel);

export default parcelRouter;