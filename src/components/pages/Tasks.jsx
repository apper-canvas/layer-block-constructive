import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { taskService } from "@/services/api/taskService";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import TaskCard from "@/components/molecules/TaskCard";
import TaskForm from "@/components/organisms/TaskForm";
import ApperIcon from "@/components/ApperIcon";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    filterAndSortTasks();
  }, [tasks, searchTerm, filterStatus, sortBy]);

  async function loadTasks() {
    try {
      setLoading(true);
      const data = await taskService.getAll();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  function filterAndSortTasks() {
    let filtered = [...tasks];

    // Apply status filter
    if (filterStatus === "pending") {
      filtered = filtered.filter(t => !t.completed);
    } else if (filterStatus === "completed") {
      filtered = filtered.filter(t => t.completed);
    } else if (filterStatus === "overdue") {
      const now = new Date();
      filtered = filtered.filter(t => !t.completed && new Date(t.dueDate) < now);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.title.toLowerCase().includes(term) ||
          t.description?.toLowerCase().includes(term) ||
          t.entityName?.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "dueDate") {
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else if (sortBy === "priority") {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === "created") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });

    setFilteredTasks(filtered);
  }

  async function handleMarkComplete(taskId) {
    try {
      await taskService.markComplete(taskId);
      toast.success("Task marked as complete");
      loadTasks();
    } catch (error) {
      toast.error("Failed to complete task");
    }
  }

  function handleEditTask(task) {
    setSelectedTask(task);
    setIsFormOpen(true);
  }

  async function handleDeleteTask(taskId) {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await taskService.delete(taskId);
      toast.success("Task deleted successfully");
      loadTasks();
    } catch (error) {
      toast.error("Failed to delete task");
    }
  }

  function handleFormClose() {
    setIsFormOpen(false);
    setSelectedTask(null);
  }

  function getEmptyMessage() {
    if (searchTerm) {
      return "No tasks found matching your search";
    }
    switch (filterStatus) {
      case "pending":
        return "No pending tasks";
      case "completed":
        return "No completed tasks yet";
      case "overdue":
        return "No overdue tasks";
      default:
        return "No tasks yet. Create your first task to get started!";
    }
  }

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  const overdueCount = tasks.filter(
    t => !t.completed && new Date(t.dueDate) < new Date()
  ).length;
  const pendingCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">Manage your follow-up reminders and tasks</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="sm:w-auto">
          <ApperIcon name="Plus" size={18} />
          Add Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{tasks.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="CheckSquare" size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="Clock" size={24} className="text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{overdueCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="AlertTriangle" size={24} className="text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{completedCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="CheckCircle2" size={24} className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon="Search"
            />
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-48">
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: "all", label: "All Tasks" },
                { value: "pending", label: "Pending" },
                { value: "completed", label: "Completed" },
                { value: "overdue", label: "Overdue" }
              ]}
            />
          </div>

          {/* Sort */}
          <div className="w-full lg:w-48">
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: "dueDate", label: "Due Date" },
                { value: "priority", label: "Priority" },
                { value: "created", label: "Created Date" }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      {filteredTasks.length === 0 ? (
        <Empty message={getEmptyMessage()} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.Id}
              task={task}
              onComplete={handleMarkComplete}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        task={selectedTask}
        onSuccess={loadTasks}
      />
    </div>
  );
}

export default Tasks;