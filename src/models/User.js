import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { facultiesAndDepartments } from "../config/constants.js";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    matriculationNumber: {
      type: String,
      required: function () {
        return this.role === "student";
      },
      trim: true,
      uppercase: true,
      maxlength: 30,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address"],
    },
    faculty: {
      type: String,
      required: function () {
        return this.role === "student";
      },
      enum: Object.keys(facultiesAndDepartments),
    },
    department: {
      type: String,
      required: function () {
        return this.role === "student";
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
      required: true,
    },
  },
  { timestamps: true },
);

userSchema.index({ matriculationNumber: 1 }, { unique: true, sparse: true });

userSchema.pre("validate", function () {
  if (this.role === "student" && this.faculty) {
    const validDepartments = facultiesAndDepartments[this.faculty] || [];
    if (!validDepartments.includes(this.department)) {
      this.invalidate(
        "department",
        "Select a valid department for the chosen faculty",
      );
    }
  }
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
