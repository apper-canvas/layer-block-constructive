import React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const ContactCard = ({ 
  contact, 
  onEdit,
  onDelete, 
  className = "" 
}) => {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    navigate(`/contacts/${contact.Id}`);
  };
  
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(contact.Id);
  };

  return (
    <div 
      onClick={handleCardClick}
      className={cn(
        "bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer",
        className
      )}
    >
      {/* Header with name and actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">{contact.name}</h3>
<p className="text-sm text-gray-500">{contact.companyName || 'No Company'}</p>
        </div>
<div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon="Edit2"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(contact);
            }}
            className="h-8 w-8 p-0"
          />
<Button
            variant="ghost"
            size="sm"
            icon="Trash2"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(contact.Id);
            }}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ApperIcon name="Mail" size={16} className="text-gray-400" />
          <span>{contact.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ApperIcon name="Phone" size={16} className="text-gray-400" />
          <span>{contact.phone}</span>
        </div>
      </div>
    </div>
  );
};

export default ContactCard;