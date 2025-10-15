import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const ActivityLog = ({ activities = [], className = "" }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case "call":
        return "Phone";
      case "email":
        return "Mail";
      case "meeting":
        return "Calendar";
      default:
        return "Activity";
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "call":
        return "bg-blue-100 text-blue-700";
      case "email":
        return "bg-purple-100 text-purple-700";
      case "meeting":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (!activities || activities.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <ApperIcon name="Activity" size={48} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">No activities yet</p>
        <p className="text-sm text-gray-400 mt-1">Start logging interactions with this contact</p>
      </div>
    );
  }

  // Sort activities by date (most recent first)
  const sortedActivities = [...activities].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  return (
    <div className={cn("space-y-4", className)}>
      {sortedActivities.map((activity) => (
        <div key={activity.Id} className="flex gap-4">
          <div className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
            getActivityColor(activity.type)
          )}>
            <ApperIcon name={getActivityIcon(activity.type)} size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                getActivityColor(activity.type)
              )}>
                {activity.type}
              </span>
              <span className="text-sm text-gray-500">
                {formatDate(activity.date)}
              </span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {activity.notes}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityLog;