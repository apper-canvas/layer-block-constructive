import { useState } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Modal from "@/components/molecules/Modal";
import { activityService } from "@/services/api/activityService";

const ActivityForm = ({ isOpen, onClose, entityType, entityId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "call",
    date: new Date().toISOString().split('T')[0],
    notes: ""
  });

  const activityTypes = [
    { value: "call", label: "Call" },
    { value: "email", label: "Email" },
    { value: "meeting", label: "Meeting" }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.type) {
      toast.error("Please select an activity type");
      return false;
    }
    if (!formData.date) {
      toast.error("Please select a date");
      return false;
    }
    if (!formData.notes.trim()) {
      toast.error("Please add notes for this activity");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const activityData = {
        type: formData.type,
        date: new Date(formData.date).toISOString(),
        notes: formData.notes.trim()
      };

      await activityService.create(entityType, entityId, activityData);
      
      toast.success("Activity logged successfully!");
      handleClose();
      onSuccess();
    } catch (error) {
      toast.error(error.message || "Failed to log activity");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      type: "call",
      date: new Date().toISOString().split('T')[0],
      notes: ""
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Log Activity"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Activity Type *
          </label>
          <Select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            {activityTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <Input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes *
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            placeholder="Add details about this activity..."
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            Log Activity
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ActivityForm;