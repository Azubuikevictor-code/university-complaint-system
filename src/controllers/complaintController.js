import Complaint from "../models/Complaint.js";
import User from "../models/User.js";
import { createError, sendDuplicateError } from "../utils/errorHelpers.js";
import {
  complaintStatuses,
  complaintPriorities,
  complaintCategories,
} from "../config/constants.js";

export async function createComplaint(req, res, next) {
  try {
    const { subject, category, description } = req.body;
    if (!subject || !category || !description) {
      throw createError("Subject, category, and description are required");
    }

    const complaint = await Complaint.create({
      student: req.session.user.id,
      subject,
      category,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      complaint,
    });
  } catch (error) {
    next(error);
  }
}

export async function getStudentComplaints(req, res, next) {
  try {
    const { search, status } = req.query;
    const filter = { student: req.session.user.id };

    if (status && complaintStatuses.includes(status)) filter.status = status;
    if (search) {
      filter.$or = [
        { referenceNumber: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }

    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .select(
        "referenceNumber subject category status priority createdAt updatedAt",
      );

    res.status(200).json({ success: true, complaints });
  } catch (error) {
    next(error);
  }
}

export async function getStudentComplaint(req, res, next) {
  try {
    const complaint = await Complaint.findOne({
      _id: req.params.id,
      student: req.session.user.id,
    }).populate("responses.respondedBy", "fullName role");

    if (!complaint)
      throw createError("Complaint not found or access is not allowed", 404);
    res.status(200).json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
}

export async function getStudentDashboard(req, res, next) {
  try {
    const studentId = req.session.user.id;
    const [total, active, resolved, recent] = await Promise.all([
      Complaint.countDocuments({ student: studentId }),
      Complaint.countDocuments({
        student: studentId,
        status: { $in: ["Submitted", "Under Review", "In Progress"] },
      }),
      Complaint.countDocuments({ student: studentId, status: "Resolved" }),
      Complaint.find({ student: studentId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("referenceNumber subject category status priority createdAt"),
    ]);

    res.status(200).json({
      success: true,
      statistics: { total, active, resolved },
      recentComplaints: recent,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminComplaints(req, res, next) {
  try {
    const { search, status, category, priority } = req.query;
    const filter = {};

    if (status && complaintStatuses.includes(status)) filter.status = status;
    if (category && complaintCategories.includes(category))
      filter.category = category;
    if (priority && complaintPriorities.includes(priority))
      filter.priority = priority;
    if (search) {
      filter.$or = [
        { referenceNumber: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }

    const complaints = await Complaint.find(filter)
      .populate("student", "fullName matriculationNumber email department")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, complaints });
  } catch (error) {
    next(error);
  }
}

export async function getAdminComplaint(req, res, next) {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate(
        "student",
        "fullName matriculationNumber email faculty department",
      )
      .populate("responses.respondedBy", "fullName role")
      .populate("statusHistory.changedBy", "fullName role");

    if (!complaint) throw createError("Complaint not found", 404);
    res.status(200).json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
}

export async function updateComplaint(req, res, next) {
  try {
    const { status, priority, response } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) throw createError("Complaint not found", 404);

    if (status) {
      if (!complaintStatuses.includes(status))
        throw createError("Invalid complaint status");
      if (status !== complaint.status) {
        complaint.statusHistory.push({
          previousStatus: complaint.status,
          newStatus: status,
          changedBy: req.session.user.id,
        });
        complaint.status = status;
      }
    }

    if (priority) {
      if (!complaintPriorities.includes(priority))
        throw createError("Invalid complaint priority");
      complaint.priority = priority;
    }

    if (response?.trim()) {
      complaint.responses.push({
        message: response.trim(),
        respondedBy: req.session.user.id,
      });
    }

    await complaint.save();

    const updatedComplaint = await Complaint.findById(complaint._id)
      .populate(
        "student",
        "fullName matriculationNumber email faculty department",
      )
      .populate("responses.respondedBy", "fullName role")
      .populate("statusHistory.changedBy", "fullName role");

    res.status(200).json({
      success: true,
      message: "Complaint updated successfully",
      complaint: updatedComplaint,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminDashboard(req, res, next) {
  try {
    const statusCounts = await Complaint.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const statusStatistics = Object.fromEntries(
      statusCounts.map(({ _id, count }) => [_id, count]),
    );
    const [studentCount, complaintCount, recentComplaints] = await Promise.all([
      User.countDocuments({ role: "student" }),
      Complaint.countDocuments(),
      Complaint.find()
        .populate("student", "fullName matriculationNumber")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.status(200).json({
      success: true,
      statistics: {
        students: studentCount,
        complaints: complaintCount,
        submitted: statusStatistics.Submitted || 0,
        underReview: statusStatistics["Under Review"] || 0,
        inProgress: statusStatistics["In Progress"] || 0,
        resolved: statusStatistics.Resolved || 0,
        rejected: statusStatistics.Rejected || 0,
      },
      recentComplaints,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRegisteredStudents(req, res, next) {
  try {
    const students = await User.find({ role: "student" })
      .sort({ createdAt: -1 })
      .select(
        "fullName matriculationNumber email faculty department createdAt",
      );
    res.status(200).json({ success: true, students });
  } catch (error) {
    next(error);
  }
}
