import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No data found", 
  description = "Get started by adding your first item", 
  actionText = "Add Item",
  onAction = null,
  icon = "Database",
  className = "" 
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center", className)}>
      <div className="bg-gray-100 rounded-full p-6 mb-6">
        <ApperIcon name={icon} size={48} className="text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-8 max-w-md">{description}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 font-medium"
        >
          <ApperIcon name="Plus" size={16} />
          {actionText}
        </button>
      )}
    </div>
  );
};

export default Empty;