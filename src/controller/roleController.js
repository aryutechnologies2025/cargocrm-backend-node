
import e from 'express';
import Role from '../models/roleModels.js';

const addRole = async (req, res) => {
  const { name,status,createdBy } = req.body;
  // console.log(req.body)
  try{
  
   if (!req.body || Object.keys(req.body).length === 0) {
    return res.json({ success: false, message: "Data Is Required" });
  }

  const { name, status,createdBy } = req.body;
  // Check if role already exists
  const existingRole = await Role.findOne({ name, is_deleted: "0" });
  if (existingRole) {         
    return res.json({ success: false, errors: { name: "Role Already Exists" } });
  }

  const role = new Role({ name, status });
  await role.save(); 


  res.json({ success: true, message: "Role Added Successfully" });

  }
  catch(error){
     if (error.name === "ValidationError") {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.json({ errors });
    } else {
      res.json({ success: false, error: "Internal Server Error" });
    }
    console.log("error",error);
    return res.json({success:false,message:error.message || "Internal Server Error"});
  }
 
};

const getRole = async (req, res) => {
  // const data = await Role.find();
  const data = await Role.find({  is_deleted: "0" });
  const encodedData = Buffer.from(
      JSON.stringify(data)
    ).toString("base64");
  res.json({success:true,data:encodedData});
};

const getRoleById = async (req, res) => {
  const data = await Role.findById(req.params.id);
  res.json({success:true,data});
};

const editRole = async (req, res) => {
  const { id } = req.params;
  // Check if the role exists
  const existingRole = await Role.findOne({ _id: id });
  if (!existingRole) {
    return res.json({ success: false, message: "Role Not Found" });
  } 
  // Check if the new name already exists
  const { name } = req.body;  
  if (name) {
    const roleExists = await Role.findOne({ name, _id: { $ne: id } });
    if (roleExists) {
      return res.json({ success: false, errors: { name: "Role name already exists" } });
    }
  }
  // Update the role
  const updated = await Role.findByIdAndUpdate(id, req.body,{
    new: true,
  });
  res.json({success:true,message:"Uploaded Successfully Role"});
};


const deleteRole = async (req, res) => {
  const { id } = req.params;
  try {
    const roleDetails = await Role.findByIdAndUpdate(
      id,
      { is_deleted: 1 },
      { new: true }
    );
    if (!roleDetails) {
      return res.json({ success: false, message: "Role Not Found" });
    }
    res
      
      .json({ success: true, message: "Role deleted successfully" });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
};

export  {
  addRole,
  getRole,
  getRoleById,
  editRole,
  deleteRole
};