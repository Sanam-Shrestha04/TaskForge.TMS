const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
  exportUsersReport,
  exportTasksReport,
  exportAssignedTasksReport,
  exportUsersAssignedByAdmin,
} = require("../controllers/reportController");

const router = express.Router();

router.get("/export/tasks", protect, adminOnly, exportTasksReport); //Export all tasks as Excel
router.get("/export/users", protect, adminOnly, exportUsersReport); //Export user-tasks report
router.get(
  "/export/assigned-tasks/:adminId",
  protect,
  adminOnly,
  (req, res, next) => {
    console.log("Assigned tasks export route triggered");
    next();
  },
  exportAssignedTasksReport
);
router.get(
  "/export/users-assigned-by/:adminId",
  protect,
  adminOnly,
  exportUsersAssignedByAdmin
);
module.exports = router;
