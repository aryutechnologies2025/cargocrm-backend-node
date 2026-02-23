import Role from "../models/roleModels.js";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";

 const createUser = async (req, res) => {
  try {
    const { name, email, password,phone,role,status,created_by } = req.body;

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
      created_by
    });

     res.json({
      success: true,
      message: "User created successfully",
    });
  } catch (err) {
    res.json({ message: err.message || "Internal Server Error" });
  }
};

 const getAllUsers = async (req, res) => {
   const superAdminRole = await Role.findOne({ role: "superadmin" });
 const users = await User.find({
  role: { $ne: superAdminRole?._id },
  is_deleted: "0"
}).populate("role", "name");
  const role=await Role.find({}).select("name");
  res.json({ success: true, users:users,role:role });
};

// const getAllUsers = async (req, res) => {
//   try {

//      const superAdminRole = await Role.findOne({ name: "superadmin" });

//     const users = await User.find({role: { $ne: superAdminRole?._id }, is_deleted: "0" })
//       .populate("role", "name")
//       .select("name email role status createdAt updatedAt");

//     const roles = await Role.find({})
//       .select("name");

//     const formattedUsers = users.map(user => ({
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role ? user.role.name : null,
//       status: user.status,
//       createdAt: user.createdAt,
//       updatedAt: user.updatedAt
//     }));

//     const formattedRoles = roles.map(role => ({
//       id: role._id,
//       name: role.name
//     }));

//     res.json({
//       success: true,
//       users: formattedUsers,
//       roles: formattedRoles
//     });
//   } catch (error) {
//     res.json({
//       success: false,
//       message: "Failed to fetch users",
//       error: error.message
//     });
//   }
// };


const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).populate("role", "name");

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
      message: err.message || "Internal Server Error"
    });
  }
};


 const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const userDetails = await User.findByIdAndUpdate(
      id,
      { is_deleted: 1 },
      { new: true }
    );
    if (!userDetails) {
      return res.json({ success: false, message: "User Not Found" });
    }
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.json({ success: false, error: err.message || "Internal Server Error" });
  }
};


export { createUser, getAllUsers,getUserById, updateUser, deleteUser };