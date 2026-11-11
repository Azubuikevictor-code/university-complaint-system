import mongoose from "mongoose";
import crypto from "crypto";
import {
  complaintCategories,
  complaintStatuses,
  complaintPriorities,
} from "../config/constants.js";

const responseSchema = new mongoose.Schema(
  {
    message: { type: String, required: true, trim: true, maxlength: 3000 },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const statusHistorySchema = new mongoose.Schema(
  {
    previousStatus: { type: String, enum: complaintStatuses },
    newStatus: { type: String, enum: complaintStatuses, required: true },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const complaintSchema = new mongoose.Schema(
  {
    referenceNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 150,
    },
    category: { type: String, required: true, enum: complaintCategories },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 5000,
    },
    status: { type: String, enum: complaintStatuses, default: "Submitted" },
    priority: { type: String, enum: complaintPriorities, default: "Normal" },
    responses: [responseSchema],
    statusHistory: [statusHistorySchema],
  },
  { timestamps: true },
);

complaintSchema.pre("validate", function () {
  if (!this.referenceNumber) {
    const datePart = new Date().toISOString().slice(2, 10).replaceAll("-", "");
    const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();
    this.referenceNumber = `UCS-${datePart}-${randomPart}`;
  }
});

complaintSchema.index({ student: 1, createdAt: -1 });
complaintSchema.index({ status: 1, category: 1, priority: 1 });
complaintSchema.index({ referenceNumber: "text", subject: "text" });

export default mongoose.model("Complaint", complaintSchema);
