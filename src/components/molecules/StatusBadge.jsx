import { cn } from "@/utils/cn";

const StatusBadge = ({ status, className = "" }) => {
const statusStyles = {
    "New": "bg-blue-100 text-blue-800 border-blue-200",
    "Qualified": "bg-green-100 text-green-800 border-green-200",
    "Proposal": "bg-purple-100 text-purple-800 border-purple-200",
    "Negotiation": "bg-orange-100 text-orange-800 border-orange-200",
    "Won": "bg-emerald-100 text-emerald-800 border-emerald-200",
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