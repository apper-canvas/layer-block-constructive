import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { leadService } from "@/services/api/leadService";
import { activityService } from "@/services/api/activityService";
import TaskForm from "@/components/organisms/TaskForm";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Input from "@/components/atoms/Input";
import ActivityLog from "@/components/molecules/ActivityLog";
import StatusBadge from "@/components/molecules/StatusBadge";
import ActivityForm from "@/components/organisms/ActivityForm";

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activities, setActivities] = useState([]);
const [isActivityFormOpen, setIsActivityFormOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "New",
    notes: ""
  });

  const statusOptions = [
    { value: "New", label: "New" },
    { value: "Qualified", label: "Qualified" },
    { value: "Proposal", label: "Proposal" },
    { value: "Negotiation", label: "Negotiation" },
    { value: "Won", label: "Won" },
    { value: "Lost", label: "Lost" }
  ];

  useEffect(() => {
    loadLead();
    loadActivities();
}, [id]);

  function handleAddTask() {
    setIsTaskFormOpen(true);
  }

  const loadLead = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await leadService.getById(parseInt(id));
      if (!data) {
        setError("Lead not found");
        return;
      }
      setLead(data);
      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        company: data.company || "",
        status: data.status || "New",
        notes: data.notes || ""
      });
    } catch (err) {
      setError(err.message || "Failed to load lead details");
      toast.error("Failed to load lead");
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    try {
      const data = await activityService.getActivitiesByEntityId('lead', id);
      setActivities(data);
    } catch (err) {
      console.error("Failed to load activities:", err);
    }
  };

const handleActivitySuccess = () => {
    loadActivities();
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

const handleEdit = () => {
    setFormData({
      name: lead.name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      company: lead.company || "",
      status: lead.status || "New",
      notes: lead.notes || ""
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: lead.name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      company: lead.company || "",
      status: lead.status || "New",
      notes: lead.notes || ""
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.company.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);
      await leadService.update(parseInt(id), formData);
      setLead(prev => ({ ...prev, ...formData }));
      setIsEditing(false);
      toast.success("Lead updated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to update lead");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this lead?")) {
      return;
    }

    try {
      await leadService.delete(parseInt(id));
      toast.success("Lead deleted successfully!");
      navigate("/leads");
    } catch (err) {
      toast.error(err.message || "Failed to delete lead");
    }
  };

  const handleAddActivity = () => {
    setIsActivityFormOpen(true);
  };
  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadLead} />;
  if (!lead) return <Error message="Lead not found" />;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            icon="ArrowLeft"
            onClick={() => navigate("/leads")}
            size="sm"
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
            <p className="text-gray-500 mt-1">{lead.company}</p>
          </div>
        </div>
        {!isEditing && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              icon="Edit"
              onClick={handleEdit}
              size="sm"
            >
              Edit
            </Button>
            <Button
              variant="outline"
              icon="Trash2"
              onClick={handleDelete}
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Delete
            </Button>
          </div>
        )}
        {isEditing && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              loading={saving}
              size="sm"
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Lead Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <ApperIcon name="User" size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Lead Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              {isEditing ? (
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter name"
                  required
                />
              ) : (
                <p className="text-gray-900">{lead.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              {isEditing ? (
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  required
                />
              ) : (
                <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                  {lead.email}
                </a>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              {isEditing ? (
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone"
                  required
                />
              ) : (
                <a href={`tel:${lead.phone}`} className="text-primary hover:underline">
                  {lead.phone}
                </a>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company *
              </label>
              {isEditing ? (
                <Input
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Enter company"
                  required
                />
              ) : (
                <p className="text-gray-900">{lead.company}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              {isEditing ? (
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              ) : (
                <StatusBadge status={lead.status} />
              )}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            {isEditing ? (
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Add notes about this lead..."
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">
                {lead.notes || "No notes available"}
              </p>
            )}
          </div>
        </div>

        {/* Activities Section */}
        {!isEditing && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <ApperIcon name="Activity" size={20} className="text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Activity Log</h2>
              </div>
<div className="flex gap-2">
                <Button
                  onClick={handleAddActivity}
                  icon="Plus"
                  size="sm"
                >
                  Log Activity
                </Button>
                <Button onClick={handleAddTask} variant="secondary" size="sm">
                  <ApperIcon name="Plus" size={18} />
                  Add Task
                </Button>
              </div>
            </div>
            <ActivityLog activities={activities} />
          </div>
        )}
        
        {/* Task Form Modal */}
<TaskForm
          isOpen={isTaskFormOpen}
          onClose={() => setIsTaskFormOpen(false)}
          onSuccess={loadLead}
          prefilledEntity={{ type: "lead", id: lead.id }}
        />
      </div>

      {/* Activity Form Modal */}
      <ActivityForm
        isOpen={isActivityFormOpen}
        onClose={() => setIsActivityFormOpen(false)}
        entityType="lead"
        entityId={id}
        onSuccess={handleActivitySuccess}
      />
    </div>
  );
};

export default LeadDetail;