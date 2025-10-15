import React from 'react';
import ApperIcon from '@/components/ApperIcon';
import { cn } from '@/utils/cn';

const CompanyCard = ({ company, contactCount, dealValue, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 p-6",
        "hover:shadow-md transition-shadow cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{company.name}</h3>
          <p className="text-sm text-gray-500">{company.industry}</p>
        </div>
        <ApperIcon name="Building2" size={24} className="text-gray-400" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-500">Contacts</label>
          <div className="flex items-center mt-1">
            <ApperIcon name="Users" size={16} className="text-gray-400 mr-1" />
            <p className="text-sm font-medium text-gray-900">{contactCount}</p>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Deal Value</label>
          <div className="flex items-center mt-1">
            <ApperIcon name="DollarSign" size={16} className="text-gray-400 mr-1" />
            <p className="text-sm font-medium text-gray-900">
              ${(dealValue / 1000).toFixed(0)}K
            </p>
          </div>
        </div>
      </div>

      {company.city && company.state && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">{company.city}, {company.state}</p>
        </div>
      )}
    </div>
  );
};

export default CompanyCard;