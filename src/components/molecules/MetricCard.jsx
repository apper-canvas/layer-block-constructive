import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const MetricCard = ({ 
  label, 
  value, 
  icon = "TrendingUp", 
  trend = null,
  className = "" 
}) => {
  return (
    <div className={cn(
      "bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200",
      className
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
              <ApperIcon name="TrendingUp" size={14} />
              {trend}
            </p>
          )}
        </div>
        <div className="bg-primary/10 rounded-lg p-3">
          <ApperIcon name={icon} size={24} className="text-primary" />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;