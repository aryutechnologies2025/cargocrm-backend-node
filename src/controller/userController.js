import User from "../models/userModel.js";
import bcrypt from "bcrypt";

 const createUser = async (req, res) => {
  try {
    const { name, email, password,phone,role,status,createdBy } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.json({ message: "Email already exists" });
    }

  const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      status,
      createdBy
    });

     res.json({
      success: true,
      message: "User created successfully",
    });
  } catch (err) {
    res.json({ message: err.message });
  }
};

 const getAllUsers = async (req, res) => {
  const users = await User.find({ is_deleted: "0" });
  res.json({ success: true, users });
};

const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json({ success: true, user });
}

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // 1Check user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.json({
        success: false,
        message: "User Not Found"
      });
    }

    //  Check duplicate name (excluding current user)
    const { name } = req.body;
    if (name) {
      const userExists = await User.findOne({
        name,
        _id: { $ne: id }
      });

      if (userExists) {
        return res.json({
          success: false,
          errors: { name: "User name already exists" }
        });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      message: "User Updated Successfully",
 
    });

  } catch (err) {
    console.error("UPDATE USER ERROR:", err);
    res.json({
      success: false,
      message: err.message
    });
  }
};


 const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const userDetails = await User.findByIdAndUpdate(
      id,
      { isDeleted: 1 },
      { new: true }
    );
    if (!userDetails) {
      return res.json({ success: false, message: "User Not Found" });
    }
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
};


export { createUser, getAllUsers,getUserById, updateUser, deleteUser };