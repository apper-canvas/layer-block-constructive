import { useNavigate } from "react-router-dom";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import StatusBadge from "@/components/molecules/StatusBadge";

const DealCard = ({ 
  deal, 
  onEdit, 
  onDelete, 
  className = "" 
}) => {
  const navigate = useNavigate();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCardClick = () => {
    navigate(`/deals/${deal.Id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className={cn(
        "bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{deal.name}</h3>
            <StatusBadge status={deal.stage} />
          </div>
          <p className="text-2xl font-bold text-primary">{formatCurrency(deal.value)}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon="Edit2"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(deal);
            }}
            className="h-8 w-8 p-0"
          />
          <Button
            variant="ghost"
            size="sm"
            icon="Trash2"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(deal.Id);
            }}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          />
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ApperIcon name="Calendar" size={16} className="text-gray-400" />
          <span>Close: {formatDate(deal.closeDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ApperIcon name="User" size={16} className="text-gray-400" />
          <span>Contact ID: {deal.contactId}</span>
        </div>
      </div>
      
      {deal.notes && (
        <div className="border-t pt-3">
          <p className="text-sm text-gray-600 line-clamp-2">
            {deal.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default DealCard;