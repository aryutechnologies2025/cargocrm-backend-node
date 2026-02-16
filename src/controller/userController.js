import User from "../models/userModel.js";

 const createUser = async (req, res) => {
  try {
    const { name, email, password, role,status } = req.body;

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
      createdBy: req.user?.id  
    });

    res.status(201).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

 const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json({ success: true, users });
};

const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  res.json({ success: true, user });
}

 const updateUser = async (req, res) => {
  const updated = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  ).select("-password");

  res.json({ success: true, updated });
};

 const deleteUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, {
    status: false
  });

  res.json({ success: true, message: "User Deleted" });
};


export { createUser, getAllUsers,getUserById, updateUser, deleteUser };