import User from "../models/userModel.js";

 const createUser = async (req, res) => {
  try {
    const { name, email, password, role,status,createdBy } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      status,
      createdBy
    });

    res.status(201).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

 const getAllUsers = async (req, res) => {
  const users = await User.find({ isDeleted: "0" });
  res.json({ success: true, users });
};

const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json({ success: true, user });
}

const updateUser = async (req, res) => {
  const { id } = req.params;
  // Check if the user exists
  const existingUser = await User.findById({ _id: id });
  if (!existingUser) {
    return res.json({ success: false, message: "User Not Found" });
  } 
  // Check if the new name already exists
  const { name } = req.body;  
  if (name) {
    const userExists = await User.findById({ name, _id: { $ne: id } });
    if (userExists) {
      return res.json({ success: false, errors: { name: "User name already exists" } });
    }
  }
  // Update the role
  const updated = await User.findByIdAndUpdate(id, req.body,{
    new: true,
  });
  res.json({success:true,message:"User Uploaded Successfully",updated});
};

 const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const userDetails = await User.findByIdAndUpdate(
      id,
      { isDeleted: 1 },
      { new: true }
    );
    if (userDetails) {
      return res.json({ success: false, message: "User Not Found" });
    }
    res
      
      .json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
};


export { createUser, getAllUsers,getUserById, updateUser, deleteUser };