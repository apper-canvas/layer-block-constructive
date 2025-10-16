import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { format, isPast } from "date-fns";

function TaskCard({ task, onComplete, onEdit, onDelete, className }) {
  const isOverdue = !task.completed && isPast(new Date(task.dueDate));
  
  const priorityColors = {
    high: "text-red-600 bg-red-50 border-red-200",
    medium: "text-orange-600 bg-orange-50 border-orange-200",
    low: "text-blue-600 bg-blue-50 border-blue-200"
  };

  const priorityIcons = {
    high: "AlertCircle",
    medium: "Info",
    low: "CheckCircle"
  };

  return (
    <div
      className={cn(
        "bg-white rounded-xl border shadow-sm p-5 transition-all hover:shadow-md",
        isOverdue && "border-red-300 bg-red-50/30",
        task.completed && "opacity-60",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            onClick={() => onComplete(task.Id)}
            className={cn(
              "flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all mt-0.5",
              task.completed
                ? "bg-green-500 border-green-500"
                : "border-gray-300 hover:border-green-500"
            )}
            disabled={task.completed}
          >
            {task.completed && (
              <ApperIcon name="Check" size={14} className="text-white" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                "font-semibold text-gray-900 mb-1",
                task.completed && "line-through text-gray-500"
              )}
            >
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {/* Priority Badge */}
<span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border",
            priorityColors[task.priority ?? 'medium']
          )}
        >
          <ApperIcon name={priorityIcons[task.priority ?? 'medium']} size={12} />
          {(task.priority ?? 'medium').charAt(0).toUpperCase() + (task.priority ?? 'medium').slice(1)}
        </span>

        {/* Status Badge */}
        {isOverdue && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700 border border-red-200">
            <ApperIcon name="AlertTriangle" size={12} />
            Overdue
          </span>
        )}
        {task.completed && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700 border border-green-200">
            <ApperIcon name="CheckCircle2" size={12} />
            Completed
          </span>
        )}
      </div>

      {/* Due Date & Entity */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4 text-sm">
          <span
            className={cn(
              "flex items-center gap-1.5",
              isOverdue ? "text-red-600 font-medium" : "text-gray-600"
            )}
          >
            <ApperIcon name="Calendar" size={14} />
            {format(new Date(task.dueDate), "MMM d, yyyy")}
          </span>
          {task.entityName && (
            <span className="flex items-center gap-1.5 text-gray-600">
              <ApperIcon name={task.entityType === "contact" ? "User" : "Briefcase"} size={14} />
              {task.entityName}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(task)}
            className="h-8 w-8 p-0"
          >
            <ApperIcon name="Edit2" size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.Id)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <ApperIcon name="Trash2" size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TaskCard;