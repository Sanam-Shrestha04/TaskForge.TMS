const Task = require("../models/Task");

// Utility Functions

// Calculate task priority 
const calculatePriority = (task) => {
  let score = 0;

  // Priority scoring: High=1, Medium=2, Low=3
  switch (task.priority) {
    case "High":
      score += 1;
      break;
    case "Medium":
      score += 2;
      break;
    case "Low":
      score += 3;
      break;
    default:
      score += 4;
  }

  // If same priority, sort by due date
  const deadline = new Date(task.dueDate || task.deadline);
  const today = new Date();
  const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
  score += daysLeft * 0.01; // Small weight for due date within same priority

  if (task.urgent) score -= 0.5;

  return score;
};

// Priority Queue: sort tasks by calculated priority (High>Medium>Low, then by due date)
const getPrioritizedTasks = (tasks) => {
  return tasks.sort((a, b) => calculatePriority(a) - calculatePriority(b));
};

// Merge Sort for sorting by any key with custom status order
const mergeSortTasks = (tasks, key) => {
  if (tasks.length <= 1) return tasks;

  const mid = Math.floor(tasks.length / 2);
  const left = mergeSortTasks(tasks.slice(0, mid), key);
  const right = mergeSortTasks(tasks.slice(mid), key);

  const merge = (left, right) => {
    const result = [];
    while (left.length && right.length) {
      if (key === "status") {
        // Custom status order: In Progress -> Pending -> Completed
        const statusOrder = { "In Progress": 1, Pending: 2, Completed: 3 };
        const leftOrder = statusOrder[left[0][key]] || 4;
        const rightOrder = statusOrder[right[0][key]] || 4;
        if (leftOrder <= rightOrder) result.push(left.shift());
        else result.push(right.shift());
      } else {
        if (left[0][key] <= right[0][key]) result.push(left.shift());
        else result.push(right.shift());
      }
    }
    return [...result, ...left, ...right];
  };

  return merge(left, right);
};

// Get all tasks
const getTasks = async (req, res) => {
  try {
    const { status, sortBy } = req.query;
    let filter = {};
    if (status) filter.status = status;

    let tasks;
    if (req.user.role == "admin") {
      tasks = await Task.find({ ...filter, createdBy: req.user._id }).populate(
        "assignedTo",
        "name email profileImageUrl"
      );
    } else {
      tasks = await Task.find({ ...filter, assignedTo: req.user._id }).populate(
        "assignedTo",
        "name email profileImageUrl"
      );
    }

    // Add completedTodoCount
    tasks = await Promise.all(
      tasks.map(async (task) => {
        const completedCount = task.todoChecklist.filter(
          (item) => item.completed
        ).length;
        return { ...task._doc, completedTodoCount: completedCount };
      })
    );

    // Apply sorting logic
    if (sortBy && sortBy !== "priority") {
      // Apply Merge Sort for other sorting criteria
      tasks = mergeSortTasks(tasks, sortBy);
    } else {
      // Apply Priority Queue (default sorting or when sortBy is 'priority')
      tasks = getPrioritizedTasks(tasks);
    }

    // Status summary counts
    const userFilter =
      req.user.role === "admin"
        ? { createdBy: req.user._id }
        : { assignedTo: req.user._id };

    const allTasks = await Task.countDocuments(userFilter);

    const pendingTasks = await Task.countDocuments({
      ...userFilter,
      status: "Pending",
    });
    const inProgressTasks = await Task.countDocuments({
      ...userFilter,
      status: "In Progress",
    });
    const completedTasks = await Task.countDocuments({
      ...userFilter,
      status: "Completed",
    });

    res.json({
      tasks,
      statusSummary: {
        all: allTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// =========================
// Get task by ID
// =========================
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      "assignedTo",
      "name email profileImageUrl"
    );

    if (!task) return res.status(404).json({ message: "Task not found" });

    const formattedTask = {
      ...task._doc,
      todoChecklist: Array.isArray(task.todoChecklist)
        ? task.todoChecklist
        : [],
      attachments: Array.isArray(task.attachments) ? task.attachments : [],
    };

    res.json(formattedTask);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// =========================
// Create task
// =========================
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      attachments,
      todoChecklist,
      urgent,
    } = req.body;

    if (!Array.isArray(assignedTo)) {
      return res
        .status(400)
        .json({ message: "assignedTo must be an array of user IDs" });
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      createdBy: req.user._id,
      todoChecklist,
      attachments,
      urgent,
      status: "Pending",
    });

    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// =========================
// Update task
// =========================
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.priority = req.body.priority || task.priority;
    task.dueDate = req.body.dueDate || task.dueDate;
    task.todoChecklist = req.body.todoChecklist || task.todoChecklist;
    task.attachments = req.body.attachments || task.attachments;
    task.urgent = req.body.urgent ?? task.urgent;

    if (req.body.assignedTo) {
      if (!Array.isArray(req.body.assignedTo)) {
        return res
          .status(400)
          .json({ message: "assignedTo must be an array of user IDs" });
      }
      task.assignedTo = req.body.assignedTo;
    }

    const updateTask = await task.save();
    res.json({ message: "Task updated successfully", updateTask });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// =========================
// Delete task
// =========================
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    await task.deleteOne();
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// =========================
// Update task status
// =========================
const updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const isAssigned = task.assignedTo.some(
      (userID) => userID.toString() === req.user._id.toString()
    );

    if (!isAssigned && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    task.status = req.body.status || task.status;

    if (task.status === "Completed") {
      task.todoChecklist.forEach((item) => (item.completed = true));
      task.progress = 100;
    }

    await task.save();
    res.json({ message: "Task status updated", task });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// =========================
// Update task checklist
// =========================
const updateTaskChecklist = async (req, res) => {
  try {
    const { todoChecklist } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    if (!task.assignedTo.includes(req.user._id) && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to update checklist" });
    }

    task.todoChecklist = todoChecklist;

    const completedCount = task.todoChecklist.filter(
      (item) => item.completed
    ).length;
    const totalItems = task.todoChecklist.length;
    task.progress =
      totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

    if (task.progress === 100) {
      task.status = "Completed";
    } else if (task.progress > 0) {
      task.status = "In Progress";
    } else {
      task.status = "Pending";
    }

    await task.save();
    const updateTask = await Task.findById(req.params.id).populate(
      "assignedTo",
      "name email profileImageUrl"
    );

    res.json({ message: "Task checklist updated", task: updateTask });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// =========================
// Dashboard Data
// =========================
const getDashboardData = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments({ createdBy: req.user._id });
    const pendingTasks = await Task.countDocuments({
      createdBy: req.user._id,
      status: "Pending",
    });
    const completedTasks = await Task.countDocuments({
      createdBy: req.user._id,
      status: "Completed",
    });
    const overdueTasks = await Task.countDocuments({
      createdBy: req.user._id,
      status: { $ne: "Completed" },
      dueDate: { $lt: new Date() },
    });

    // Task distribution by status
    const taskStatuses = ["Pending", "In Progress", "Completed"];
    const taskDistributionRaw = await Task.aggregate([
      { $match: { createdBy: req.user._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const taskDistribution = taskStatuses.reduce((acc, status) => {
      const key = status.replace(/\s+/g, "");
      acc[key] =
        taskDistributionRaw.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});
    taskDistribution["All"] = totalTasks;

    // Task distribution by priority
    const taskPriorities = ["Low", "Medium", "High"];
    const taskPriorityLevelsRaw = await Task.aggregate([
      { $match: { createdBy: req.user._id } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
      acc[priority] =
        taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
      return acc;
    }, {});

    // Fetch recent 10 tasks and prioritize them
    let recentTasks = await Task.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("title status priority dueDate createdAt");
    recentTasks = getPrioritizedTasks(recentTasks);

    res.status(200).json({
      statistics: { totalTasks, pendingTasks, completedTasks, overdueTasks },
      charts: { taskDistribution, taskPriorityLevels },
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// =========================
// User-specific Dashboard
// =========================
const getUserDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalTasks = await Task.countDocuments({ assignedTo: userId });
    const pendingTasks = await Task.countDocuments({
      assignedTo: userId,
      status: "Pending",
    });
    const completedTasks = await Task.countDocuments({
      assignedTo: userId,
      status: "Completed",
    });
    const overdueTasks = await Task.countDocuments({
      assignedTo: userId,
      status: { $ne: "Completed" },
      dueDate: { $lt: new Date() },
    });

    // Task distribution by status
    const taskStatuses = ["Pending", "In Progress", "Completed"];
    const taskDistributionRaw = await Task.aggregate([
      { $match: { assignedTo: userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const taskDistribution = taskStatuses.reduce((acc, status) => {
      const key = status.replace(/\s+/g, "");
      acc[key] =
        taskDistributionRaw.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});
    taskDistribution["All"] = totalTasks;

    // Task distribution by priority
    const taskPriorities = ["Low", "Medium", "High"];
    const taskPriorityLevelsRaw = await Task.aggregate([
      { $match: { assignedTo: userId } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
      acc[priority] =
        taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
      return acc;
    }, {});

    // Recent 20 tasks prioritized
    let recentTasks = await Task.find({ assignedTo: userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("title status priority dueDate createdAt");
    recentTasks = getPrioritizedTasks(recentTasks);

    res.status(200).json({
      statistics: { totalTasks, pendingTasks, completedTasks, overdueTasks },
      charts: { taskDistribution, taskPriorityLevels },
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskChecklist,
  getDashboardData,
  getUserDashboardData,
};
