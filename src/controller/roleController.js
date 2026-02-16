
import Role from '../models/roleModels.js';

const addRole = async (req, res) => {
  const { name,status } = req.body;
  console.log(req.body)
  try{
  
   if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(200).json({ success: false, message: "Data Is Required" });
  }

  const { name, status } = req.body;
  // Check if role already exists
  const existingRole = await Role.findOne({ name });
  if (existingRole) {         
    return res.status(400).json({ success: false, errors: { name: "Role Already Exists" } });
  }

  const role = new Role({ name, status,createdBy: req.user._id });
  await role.save(); 


  res.status(200).json({ success: true, message: "Role Added Successfully" });

  }
  catch(error){
     if (error.name === "ValidationError") {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ errors });
    } else {
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
    console.log("error",error);
    return res.status(500).json({success:false,message:"Internal Server Error"});
  }
 
};

const getRole = async (req, res) => {
  // const data = await Role.find();
  const data = await Role.find({ status: "1" });
  res.status(200).json({success:true,data});
};

const getRoleById = async (req, res) => {
  const data = await Role.findById(req.params.id);
  res.status(200).json({success:true,data});
};

const editRole = async (req, res) => {
  const { id } = req.params;
  // Check if the role exists
  const existingRole = await Role.findOne({ _id: id });
  if (!existingRole) {
    return res.status(404).json({ success: false, message: "Role Not Found" });
  } 
  // Check if the new name already exists
  const { name } = req.body;  
  if (name) {
    const roleExists = await Role.findOne({ name, _id: { $ne: id } });
    if (roleExists) {
      return res.status(400).json({ success: false, errors: { name: "Role name already exists" } });
    }
  }
  // Update the role
  const updated = await Role.findByIdAndUpdate(id, req.body,{
    new: true,
  });
  res.status(200).json({success:true,message:"Uploaded Successfully Role"});
};

// const deleteRole = async (req, res) => {
    
//   await Role.findByIdAndDelete(req.params.id);
//   res.json({success:true, message: "Deleted" });
// };

const deleteRole = async (req, res) => {
  const role = await Role.findById(req.params.id);

  if (!role) {
    return res.status(404).json({
      success: false,
      message: "Role Not Found"
    });
  }

  role.status = "0"; // inactive
  await role.save();

  res.status(200).json({
    success: true,
    message: "Role deactivated successfully"
  });
};

export  {
  addRole,
  getRole,
  getRoleById,
  editRole,
  deleteRole
};