import ContactMessage from "../models/ContactMessage.js";

export async function submitContactMessage(req, res, next) {
  try {
    const { name, email, subject, message, website } = req.body;

    if (website) {
      return res
        .status(400)
        .json({ success: false, message: "Unable to submit this message" });
    }

    if (!name || !email || !subject || !message) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Name, email, subject, and message are required",
        });
    }

    await ContactMessage.create({ name, email, subject, message });

    res.status(201).json({
      success: true,
      message:
        "Your message has been received. We will get back to you shortly.",
    });
  } catch (error) {
    next(error);
  }
}
