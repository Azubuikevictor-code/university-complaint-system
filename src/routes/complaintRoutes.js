import express from "express";
import {
  createComplaint,
  getStudentComplaints,
  getStudentComplaint,
  getStudentDashboard,
  getAdminComplaints,
  getAdminComplaint,
  updateComplaint,
  getAdminDashboard,
  getRegisteredStudents,
} from "../controllers/complaintController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/student/dashboard", requireRole("student"), getStudentDashboard);
router.post("/", requireRole("student"), createComplaint);
router.get("/student", requireRole("student"), getStudentComplaints);
router.get("/student/:id", requireRole("student"), getStudentComplaint);

router.get("/admin/dashboard", requireRole("admin"), getAdminDashboard);
router.get("/admin/students", requireRole("admin"), getRegisteredStudents);
router.get("/admin", requireRole("admin"), getAdminComplaints);
router.get("/admin/:id", requireRole("admin"), getAdminComplaint);
router.patch("/admin/:id", requireRole("admin"), updateComplaint);

export default router;
