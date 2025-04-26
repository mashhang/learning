import { Router } from "express";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  markAnnouncementAsRead,
} from "../announcementHandlers.js"; // We'll create handlers next

const router = Router();

router.get("/", getAnnouncements); // ➔ Student get announcements
router.post("/", createAnnouncement); // ➔ Admin create announcement
router.put("/:id", updateAnnouncement); // ➔ Admin update announcement
router.delete("/:id", deleteAnnouncement); // ➔ Admin delete announcement
router.post("/:id/read", markAnnouncementAsRead); // ➔ Mark as read

export default router;
