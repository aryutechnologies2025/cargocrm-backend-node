import Loginlog from "../models/loginLogModel.js";



const getLoginLog = async (req, res) => {
  // const data = await Role.find();
  const data = await Loginlog.find().sort({ createdAt: -1 });
  const encodedData = Buffer.from(
      JSON.stringify(data)
    ).toString("base64");
  res.json({success:true,data:encodedData});
};

export {getLoginLog};