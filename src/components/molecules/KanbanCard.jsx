import { useNavigate } from "react-router-dom";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const KanbanCard = ({ 
  deal, 
  onEdit, 
  onDelete,
  onDragStart,
  onDragEnd,
  className = "" 
}) => {
  const navigate = useNavigate();

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  function formatDate(dateString) {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  function handleCardClick(e) {
    if (e.target.closest('button')) return;
    navigate(`/deals/${deal.Id}`);
  }

  function handleDragStart(e) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("dealId", deal.Id.toString());
    if (onDragStart) onDragStart();
  }

  function handleDragEnd() {
    if (onDragEnd) onDragEnd();
  }

  return (
    <div 
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleCardClick}
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 p-4",
        "hover:shadow-md transition-all duration-200 cursor-move",
        "hover:border-blue-300",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-sm flex-1 pr-2">
          {deal.name}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(deal);
            }}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Edit deal"
          >
            <ApperIcon name="Pencil" size={14} className="text-gray-500" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(deal.Id);
            }}
            className="p-1 hover:bg-red-50 rounded transition-colors"
            title="Delete deal"
          >
            <ApperIcon name="Trash2" size={14} className="text-red-500" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Value</span>
          <span className="text-sm font-semibold text-green-600">
            {formatCurrency(deal.value || 0)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Expected Close</span>
          <span className="text-xs text-gray-700">
            {formatDate(deal.expectedCloseDate)}
          </span>
        </div>

        {deal.companyName && (
          <div className="flex items-center gap-1 text-xs text-gray-600 mt-2 pt-2 border-t border-gray-100">
            <ApperIcon name="Building2" size={12} />
            <span className="truncate">{deal.companyName}</span>
          </div>
        )}

        {deal.notes && (
          <p className="text-xs text-gray-500 line-clamp-2 mt-2">
            {deal.notes}
          </p>
        )}
      </div>
    </div>
  );
};

export default KanbanCard;