import ContainerRun from "../models/containerRunModel.js";
import { checkExistingRecord, handleValidationError } from "./baseController.js";


 const addContainerRun = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, message: "Data is required" });
    }

    const { runNumber, mode, status } = req.body;

    // Check if run number already exists
    const runExists = await checkExistingRecord(ContainerRun, { runNumber }, "runNumber", res);
    if (runExists) return;

    const containerRun = new ContainerRun({
      runNumber,
      mode,
      status,
      createdBy: req.user._id
    });

    await containerRun.save();
    
    await containerRun.populate("createdBy", "name email");

    res.status(201).json({ 
      success: true, 
      message: "Container run added successfully", 
      data: containerRun 
    });

  } catch (error) {
    console.log("error", error);
    const validationError = handleValidationError(error, res);
    if (validationError) return;
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

 const getContainerRuns = async (req, res) => {
  try {
    const containerRuns = await ContainerRun.find({ status: "active" })
      .populate("createdBy", "name email")
      .sort({ runNumber: -1 });
      
    res.status(200).json({ success: true, data: containerRuns });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

 const getContainerRunById = async (req, res) => {
  try {
    const containerRun = await ContainerRun.findById(req.params.id)
      .populate("createdBy", "name email");
    
    if (!containerRun) {
      return res.status(404).json({ success: false, message: "Container run not found" });
    }
    
    res.status(200).json({ success: true, data: containerRun });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

 const getContainerRunByNumber = async (req, res) => {
  try {
    const { runNumber } = req.params;
    
    const containerRun = await ContainerRun.findOne({ 
      runNumber: parseInt(runNumber),
      status: "active" 
    }).populate("createdBy", "name email");
    
    if (!containerRun) {
      return res.status(404).json({ success: false, message: "Container run not found" });
    }
    
    res.status(200).json({ success: true, data: containerRun });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

 const editContainerRun = async (req, res) => {
  try {
    const { id } = req.params;
    
    const containerRun = await ContainerRun.findById(id);
    if (!containerRun) {
      return res.status(404).json({ success: false, message: "Container run not found" });
    }

    const { runNumber } = req.body;
    
    // Check if run number is being changed and if it already exists
    if (runNumber && runNumber !== containerRun.runNumber) {
      const runExists = await checkExistingRecord(
        ContainerRun, 
        { runNumber, _id: { $ne: id } }, 
        "runNumber", 
        res
      );
      if (runExists) return;
    }

    const updated = await ContainerRun.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    }).populate("createdBy", "name email");

    res.status(200).json({ 
      success: true, 
      message: "Container run updated successfully", 
      data: updated 
    });
  } catch (error) {
    console.log("error", error);
    const validationError = handleValidationError(error, res);
    if (validationError) return;
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

 const deleteContainerRun = async (req, res) => {
  try {
    const containerRun = await ContainerRun.findById(req.params.id);
    
    if (!containerRun) {
      return res.status(404).json({ success: false, message: "Container run not found" });
    }

    containerRun.status = "inactive";
    await containerRun.save();

    res.status(200).json({ success: true, message: "Container run deactivated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
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