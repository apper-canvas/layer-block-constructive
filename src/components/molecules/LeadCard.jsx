import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import StatusBadge from "@/components/molecules/StatusBadge";

const LeadCard = ({ 
  lead, 
  onEdit, 
  onDelete, 
  className = "" 
}) => {
  return (
    <div className={cn(
      "bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-1",
      className
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
            <StatusBadge status={lead.status} />
          </div>
          <p className="text-sm text-gray-600">{lead.company}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon="Edit2"
            onClick={() => onEdit(lead)}
            className="h-8 w-8 p-0"
          />
          <Button
            variant="ghost"
            size="sm"
            icon="Trash2"
            onClick={() => onDelete(lead.Id)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          />
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ApperIcon name="Mail" size={16} className="text-gray-400" />
          <span>{lead.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ApperIcon name="Phone" size={16} className="text-gray-400" />
          <span>{lead.phone}</span>
        </div>
      </div>
      
      {lead.notes && (
        <div className="border-t pt-3">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Notes: </span>
            {lead.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default LeadCard;