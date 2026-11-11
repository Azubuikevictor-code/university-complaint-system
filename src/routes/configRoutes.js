import express from "express";
import {
  facultiesAndDepartments,
  complaintCategories,
  complaintStatuses,
  complaintPriorities,
} from "../config/constants.js";

const router = express.Router();

router.get("/options", (req, res) => {
  res.status(200).json({
    success: true,
    facultiesAndDepartments,
    complaintCategories,
    complaintStatuses,
    complaintPriorities,
    supportEmail: process.env.SUPPORT_EMAIL || "",
  });
});

export default router;
