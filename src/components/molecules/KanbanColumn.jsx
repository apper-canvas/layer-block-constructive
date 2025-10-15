import { cn } from "@/utils/cn";

const KanbanColumn = ({ 
  stage, 
  deals, 
  totalValue, 
  onDrop,
  onDragOver,
  children,
  className = "" 
}) => {
  const stageColors = {
    "New": "bg-blue-50 border-blue-200",
    "Contacted": "bg-indigo-50 border-indigo-200",
    "Qualified": "bg-green-50 border-green-200",
    "Proposal": "bg-purple-50 border-purple-200",
    "Negotiation": "bg-orange-50 border-orange-200",
    "Closed Won": "bg-emerald-50 border-emerald-200",
    "Closed Lost": "bg-gray-50 border-gray-200"
  };

  const stageBadgeColors = {
    "New": "bg-blue-100 text-blue-700",
    "Contacted": "bg-indigo-100 text-indigo-700",
    "Qualified": "bg-green-100 text-green-700",
    "Proposal": "bg-purple-100 text-purple-700",
    "Negotiation": "bg-orange-100 text-orange-700",
    "Closed Won": "bg-emerald-100 text-emerald-700",
    "Closed Lost": "bg-gray-100 text-gray-700"
  };

  function handleDrop(e) {
    e.preventDefault();
    const dealId = parseInt(e.dataTransfer.getData("dealId"));
    if (dealId) {
      onDrop(dealId);
    }
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  return (
    <div 
      className={cn(
        "flex flex-col w-80 min-w-80 bg-white rounded-lg border-2 transition-colors",
        stageColors[stage] || "bg-gray-50 border-gray-200",
        className
      )}
      onDrop={handleDrop}
      onDragOver={onDragOver}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className={cn(
            "px-3 py-1 rounded-full text-sm font-medium",
            stageBadgeColors[stage] || "bg-gray-100 text-gray-700"
          )}>
            {stage}
          </span>
          <span className="text-sm text-gray-600">
            {deals.length} {deals.length === 1 ? 'deal' : 'deals'}
          </span>
        </div>
        <div className="text-lg font-bold text-gray-900">
          {formatCurrency(totalValue)}
        </div>
      </div>
      
      <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-300px)]">
        {deals.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No deals in this stage</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;