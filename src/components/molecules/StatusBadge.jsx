import { cn } from "@/utils/cn";

const StatusBadge = ({ status, className = "" }) => {
  const statusStyles = {
    "New": "bg-blue-100 text-blue-800 border-blue-200",
    "Contacted": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Qualified": "bg-green-100 text-green-800 border-green-200",
    "Lost": "bg-gray-100 text-gray-800 border-gray-200"
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      statusStyles[status] || statusStyles["New"],
      className
    )}>
      {status}
    </span>
  );
};

export default StatusBadge;