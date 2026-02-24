import express from "express";
import {
    addCollection, getCollection, editCollection, deleteCollection
} from "../controller/collectionController.js";

const collectionRouter = express.Router();
collectionRouter.post("/create-collection", addCollection);
collectionRouter.get("/view-collection", getCollection);
collectionRouter.put("/edit-collection/:id", editCollection);
collectionRouter.delete("/delete-collection/:id", deleteCollection);
export default collectionRouter;