import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { contactService } from "@/services/api/contactService";
import { activityService } from "@/services/api/activityService";
import ActivityLog from "@/components/molecules/ActivityLog";
import ActivityForm from "@/components/organisms/ActivityForm";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Contacts from "@/components/pages/Contacts";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
const ContactDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activities, setActivities] = useState([]);
  const [isActivityFormOpen, setIsActivityFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    address: { street: "", city: "", state: "", zip: "" },
    notes: ""
  });

useEffect(() => {
    loadContact();
    loadActivities();
  }, [id]);

const loadContact = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await contactService.getById(parseInt(id));
      setContact(data);
      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        company: data.company || "",
        jobTitle: data.jobTitle || "",
        address: data.address || { street: "", city: "", state: "", zip: "" },
        notes: data.notes || ""
      });
    } catch (err) {
      setError(err.message || "Failed to load contact details");
      toast.error("Failed to load contact");
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    try {
      const data = await activityService.getActivitiesByEntityId('contact', id);
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

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await contactService.update(parseInt(id), formData);
      setContact({ ...contact, ...formData });
      setIsEditing(false);
      toast.success("Contact updated successfully");
    } catch (err) {
      toast.error(err.message || "Failed to update contact");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: contact.name || "",
      email: contact.email || "",
      phone: contact.phone || "",
      company: contact.company || "",
      jobTitle: contact.jobTitle || "",
      address: contact.address || { street: "", city: "", state: "", zip: "" },
      notes: contact.notes || ""
    });
    setIsEditing(false);
};

  const handleAddActivity = () => {
    setIsActivityFormOpen(true);
  };
  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!contact) return <Error message="Contact not found" />;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate("/contacts")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ApperIcon name="ArrowLeft" size={20} />
          <span>Back to Contacts</span>
        </button>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="primary">
            <ApperIcon name="Edit" size={16} />
            Edit Contact
          </Button>
        )}
      </div>

      {/* Contact Details Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        {/* Contact Header */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          {isEditing ? (
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{contact.name}</h1>
              <p className="text-lg text-gray-600">{contact.jobTitle}</p>
            </>
          )}
        </div>

        {/* Contact Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Company</label>
            {isEditing ? (
              <Input
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
              />
            ) : (
              <p className="text-gray-900 font-medium">{contact.company}</p>
            )}
          </div>

          {/* Job Title */}
          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Job Title</label>
              <Input
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                required
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Email</label>
            {isEditing ? (
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            ) : (
              <a href={`mailto:${contact.email}`} className="text-blue-600 hover:text-blue-700 font-medium">
                {contact.email}
              </a>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Phone</label>
            {isEditing ? (
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            ) : (
              <a href={`tel:${contact.phone}`} className="text-blue-600 hover:text-blue-700 font-medium">
                {contact.phone}
              </a>
            )}
          </div>
        </div>

        {/* Address Section */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-500 mb-3">Address</label>
          {isEditing ? (
            <div className="space-y-3">
              <Input
                placeholder="Street address"
                value={formData.address.street}
                onChange={(e) => handleAddressChange("street", e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="City"
                  value={formData.address.city}
                  onChange={(e) => handleAddressChange("city", e.target.value)}
                />
                <Input
                  placeholder="State"
                  value={formData.address.state}
                  onChange={(e) => handleAddressChange("state", e.target.value)}
                />
              </div>
              <Input
                placeholder="ZIP code"
                value={formData.address.zip}
                onChange={(e) => handleAddressChange("zip", e.target.value)}
              />
            </div>
          ) : (
            contact.address && (contact.address.street || contact.address.city) ? (
              <div className="text-gray-900">
                {contact.address.street && <p>{contact.address.street}</p>}
                {(contact.address.city || contact.address.state || contact.address.zip) && (
                  <p>
                    {contact.address.city}
                    {contact.address.city && contact.address.state && ", "}
                    {contact.address.state} {contact.address.zip}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-400 italic">No address provided</p>
            )
          )}
        </div>

        {/* Notes Section */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-500 mb-3">Notes</label>
          {isEditing ? (
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Add notes about this contact..."
            />
          ) : (
            contact.notes ? (
              <p className="text-gray-900 whitespace-pre-wrap">{contact.notes}</p>
            ) : (
              <p className="text-gray-400 italic">No notes available</p>
            )
          )}
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
            <Button onClick={handleCancel} variant="secondary" disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} variant="primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
)}

        {/* Activities Section */}
        {!isEditing && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <ApperIcon name="Activity" size={20} className="text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Activity Log</h2>
              </div>
              <Button
                onClick={handleAddActivity}
                icon="Plus"
                size="sm"
              >
                Log Activity
              </Button>
            </div>
            <ActivityLog activities={activities} />
          </div>
        )}
      </div>

      {/* Activity Form Modal */}
      <ActivityForm
        isOpen={isActivityFormOpen}
        onClose={() => setIsActivityFormOpen(false)}
        entityType="contact"
        entityId={id}
        onSuccess={handleActivitySuccess}
      />
</div>
  );
};

export default ContactDetail;