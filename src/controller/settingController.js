import Settings from "../models/settingModel.js";
const createSetting = async (req, res) => {
  try {
    const {
      teamAndCondition,
      

    } = req.body;


    let settings = await Settings.findOne();

    if (settings) {
      settings.teamAndCondition = teamAndCondition;
      
      
      await settings.save();

      return res.status(200).json({
        message: "Settings updated successfully",
        settings,
      });
    } else {
    
      settings = new Settings({
        teamAndCondition,
        
      });

      await settings.save();

      return res.status(201).json({
        message: "Settings created successfully",
        settings,
      });
    }
  } catch (error) {
    console.error(error);
    if (error.name === "ValidationError") {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ errors });
    } else {
      return res
        .status(500)
        .json({ success: false, error: "Internal Server Error" });
    }
  }
};

const getSetting = async (req, res) => {
  try {
    const settings = await Settings.find();
    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }
    return res.status(200).json(settings);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

export {
  createSetting,
  getSetting
}