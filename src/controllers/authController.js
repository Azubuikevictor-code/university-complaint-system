import User from "../models/User.js";
import { sendDuplicateError } from "../utils/errorHelpers.js";

export async function registerStudent(req, res, next) {
  try {
    const {
      fullName,
      matriculationNumber,
      email,
      faculty,
      department,
      password,
      confirmPassword,
    } = req.body;

    if (
      !fullName ||
      !matriculationNumber ||
      !email ||
      !faculty ||
      !department ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "All registration fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    const user = await User.create({
      fullName,
      matriculationNumber,
      email,
      faculty,
      department,
      password,
      role: "student",
    });

    req.session.user = {
      id: user._id.toString(),
      fullName: user.fullName,
      role: user.role,
    };

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: req.session.user,
    });
  } catch (error) {
    const duplicateResponse = sendDuplicateError(error, res);
    if (duplicateResponse) return duplicateResponse;
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    req.session.user = {
      id: user._id.toString(),
      fullName: user.fullName,
      role: user.role,
    };

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: req.session.user,
    });
  } catch (error) {
    next(error);
  }
}

export function getCurrentUser(req, res) {
  if (!req.session?.user) {
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  }
  res.status(200).json({ success: true, user: req.session.user });
}

export function logout(req, res, next) {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie("ucs.sid");
    res.status(200).json({ success: true, message: "Logged out successfully" });
  });
}
