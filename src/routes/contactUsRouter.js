import express from "express";

import useAuth from "../middlewares/authMiddleware.js";
import {
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
} from "../controller/contactUsController.js";


const contactUsRouter = express.Router();

contactUsRouter.post("/create-message", addContactMessage);
contactUsRouter.get("/view-messages", getContactMessages);
contactUsRouter.get("/view-message/:id", getContactMessageById);
contactUsRouter.put("/edit-message/:id", editContactMessage);
contactUsRouter.delete("/delete-message/:id", deleteContactMessage);


//if needed
contactUsRouter.get("/view-by-email/:email", getContactMessagesByEmail);

contactUsRouter.delete("/permanent-delete/:id", permanentDeleteContactMessage);
contactUsRouter.put("/mark-replied/:id", markAsReplied);
contactUsRouter.get("/statistics", getContactStats);
contactUsRouter.get("/search", searchContactMessages);
contactUsRouter.post("/bulk-update-status", bulkUpdateStatus);

export default contactUsRouter;