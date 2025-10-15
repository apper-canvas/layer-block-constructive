import { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const FilterPanel = ({ isOpen, onClose, onApplyFilters, activeFilters, presets, onSavePreset, onLoadPreset, onDeletePreset }) => {
  const [localFilters, setLocalFilters] = useState({
    dateRange: { start: "", end: "" },
    valueRange: { min: "", max: "" },
    lastContactDate: "",
    customFields: {}
  });
  const [expandedSections, setExpandedSections] = useState({
    dateRange: true,
    valueRange: true,
    lastContact: false,
    customFields: false
  });
  const [presetName, setPresetName] = useState("");
  const [showPresetInput, setShowPresetInput] = useState(false);

  useEffect(() => {
    if (activeFilters) {
      setLocalFilters(activeFilters);
    }
  }, [activeFilters]);

  function toggleSection(section) {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }

  function handleApply() {
    onApplyFilters(localFilters);
  }

  function handleClear() {
    const emptyFilters = {
      dateRange: { start: "", end: "" },
      valueRange: { min: "", max: "" },
      lastContactDate: "",
      customFields: {}
    };
    setLocalFilters(emptyFilters);
    onApplyFilters(emptyFilters);
  }

  function handleSavePreset() {
    if (presetName.trim()) {
      onSavePreset(presetName.trim(), localFilters);
      setPresetName("");
      setShowPresetInput(false);
    }
  }

  function addCustomField() {
    const fieldName = prompt("Enter custom field name:");
    if (fieldName) {
      setLocalFilters(prev => ({
        ...prev,
        customFields: { ...prev.customFields, [fieldName]: "" }
      }));
    }
  }

  function removeCustomField(fieldName) {
    setLocalFilters(prev => {
      const newCustomFields = { ...prev.customFields };
      delete newCustomFields[fieldName];
      return { ...prev, customFields: newCustomFields };
    });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="w-full sm:w-96 bg-white shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Advanced Filters</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <ApperIcon name="X" size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Date Range Section */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('dateRange')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              style={{ minHeight: '44px' }}
            >
              <span className="font-medium text-gray-900">Date Range</span>
              <ApperIcon name={expandedSections.dateRange ? "ChevronUp" : "ChevronDown"} size={20} />
            </button>
            {expandedSections.dateRange && (
              <div className="px-4 pb-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <Input
                    type="date"
                    value={localFilters.dateRange.start}
                    onChange={(e) => setLocalFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <Input
                    type="date"
                    value={localFilters.dateRange.end}
                    onChange={(e) => setLocalFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Value Range Section */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('valueRange')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              style={{ minHeight: '44px' }}
            >
              <span className="font-medium text-gray-900">Deal Value Range</span>
              <ApperIcon name={expandedSections.valueRange ? "ChevronUp" : "ChevronDown"} size={20} />
            </button>
            {expandedSections.valueRange && (
              <div className="px-4 pb-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Value</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={localFilters.valueRange.min}
                    onChange={(e) => setLocalFilters(prev => ({
                      ...prev,
                      valueRange: { ...prev.valueRange, min: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Value</label>
                  <Input
                    type="number"
                    placeholder="No limit"
                    value={localFilters.valueRange.max}
                    onChange={(e) => setLocalFilters(prev => ({
                      ...prev,
                      valueRange: { ...prev.valueRange, max: e.target.value }
                    }))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Last Contact Date Section */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('lastContact')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              style={{ minHeight: '44px' }}
            >
              <span className="font-medium text-gray-900">Last Contact Date</span>
              <ApperIcon name={expandedSections.lastContact ? "ChevronUp" : "ChevronDown"} size={20} />
            </button>
            {expandedSections.lastContact && (
              <div className="px-4 pb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact After</label>
                <Input
                  type="date"
                  value={localFilters.lastContactDate}
                  onChange={(e) => setLocalFilters(prev => ({
                    ...prev,
                    lastContactDate: e.target.value
                  }))}
                />
              </div>
            )}
          </div>

          {/* Custom Fields Section */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('customFields')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              style={{ minHeight: '44px' }}
            >
              <span className="font-medium text-gray-900">Custom Fields</span>
              <ApperIcon name={expandedSections.customFields ? "ChevronUp" : "ChevronDown"} size={20} />
            </button>
            {expandedSections.customFields && (
              <div className="px-4 pb-4 space-y-3">
                {Object.entries(localFilters.customFields).map(([fieldName, value]) => (
                  <div key={fieldName} className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">{fieldName}</label>
                      <Input
                        type="text"
                        value={value}
                        onChange={(e) => setLocalFilters(prev => ({
                          ...prev,
                          customFields: { ...prev.customFields, [fieldName]: e.target.value }
                        }))}
                      />
                    </div>
                    <button
                      onClick={() => removeCustomField(fieldName)}
                      className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      style={{ minWidth: '44px', minHeight: '44px' }}
                    >
                      <ApperIcon name="Trash2" size={16} />
                    </button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addCustomField}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <ApperIcon name="Plus" size={16} />
                  Add Custom Field
                </Button>
              </div>
            )}
          </div>

          {/* Saved Presets */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Saved Presets</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPresetInput(!showPresetInput)}
                className="flex items-center gap-1"
              >
                <ApperIcon name="Save" size={14} />
                Save Current
              </Button>
            </div>
            {showPresetInput && (
              <div className="mb-3 flex gap-2">
                <Input
                  type="text"
                  placeholder="Preset name..."
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSavePreset} size="sm">Save</Button>
              </div>
            )}
            <div className="space-y-2">
              {presets.map((preset) => (
                <div key={preset.name} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <button
                    onClick={() => onLoadPreset(preset)}
                    className="flex-1 text-left text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                    style={{ minHeight: '44px' }}
                  >
                    {preset.name}
                  </button>
                  <button
                    onClick={() => onDeletePreset(preset.name)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                  >
                    <ApperIcon name="Trash2" size={14} />
                  </button>
                </div>
              ))}
              {presets.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No saved presets</p>
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
          <Button variant="outline" onClick={handleClear} className="flex-1">
            Clear All
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;