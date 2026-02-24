import e from "express";
import ContainerRun from "../models/containerRunModel.js";
import { checkExistingRecord, handleValidationError } from "./baseController.js";
import { encryptData } from "../utils/encryption.js";


const addContainerRun = async (req, res) => {
  try {

    const { run_number, mode, status, created_by } = req.body;

    const containerRun = new ContainerRun({
      run_number,
      mode,
      status,
      created_by
    });

    await containerRun.save();

    await containerRun.populate("created_by", "name email");

    res.json({
      success: true,
      message: "Container run added successfully",

    });

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message || "Internal Server Error" });
  }
};

const getContainerRuns = async (req, res) => {
  try {
    const containerRuns = await ContainerRun.find({ is_deleted: "0" })
      .populate("created_by", "name email")
      .sort({ run_number: -1 });
    const formattedContainerRuns = containerRuns.map(containerRun => ({
      id: containerRun._id,
      run_number: containerRun.run_number,
      mode: containerRun.mode,
      status: containerRun.status,
      createdAt: containerRun.createdAt,
      createdBy: containerRun.created_by?.name
    }));
    const responseData = {
      success: true,
      data: formattedContainerRuns,
    };
    const encryptedData = encryptData(responseData);
    res.json({ success: true, encrypted: true, data: encryptedData });

    // res.json({ success: true, data: containerRuns });
  } catch (error) {
    res.json({ success: false, message: error.message || "Internal Server Error" });
  }
};

const getContainerRunById = async (req, res) => {
  try {
    const containerRun = await ContainerRun.findById(req.params.id)
      .populate("created_by", "name email");

    if (!containerRun) {
      return res.json({ success: false, message: "Container run not found" });
    }

    res.json({ success: true, data: containerRun });
  } catch (error) {
    res.json({ success: false, message: error.message || "Internal Server Error" });
  }
};

const getContainerRunByNumber = async (req, res) => {
  try {
    const { run_number } = req.params;

    const containerRun = await ContainerRun.findOne({
      run_number: parseInt(run_number),
      status: "1"
    }).populate("created_by", "name email");

    if (!containerRun) {
      return res.json({ success: false, message: "Container run not found" });
    }

    res.json({ success: true, data: containerRun });
  } catch (error) {
    res.json({ success: false, message: error.message || "Internal Server Error" });
  }
};

const editContainerRun = async (req, res) => {
  try {
    const { id } = req.params;

    const containerRun = await ContainerRun.findById(id);
    if (!containerRun) {
      return res.json({ success: false, message: "Container run not found" });
    }

    const { run_number } = req.body;

    // // Check if run number is being changed and if it already exists
    // if (run_number && run_number !== containerRun.run_number) {
    //   const runExists = await checkExistingRecord(
    //     ContainerRun, 
    //     { run_number: run_number, _id: { $ne: id } }, 
    //     "run_number", 
    //     res
    //   );
    //   if (runExists) return;
    // }

    const updated = await ContainerRun.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    }).populate("created_by", "name email");

    res.json({
      success: true,
      message: "Container run updated successfully",

    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message || "Internal Server Error" });
  }
};

const deleteContainerRun = async (req, res) => {
  const { id } = req.params;
  try {
    const containerDetails = await ContainerRun.findByIdAndUpdate(
      id,
      { is_deleted: 1 },
      { new: true }
    );
    if (!containerDetails) {
      return res.json({ success: false, message: "Container Not Found" });
    }
    res.json({ success: true, message: "Container deleted successfully" });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
};

export {
  addContainerRun,
  getContainerRuns,
  getContainerRunById,
  getContainerRunByNumber,
  editContainerRun,
  deleteContainerRun
}