import { useState } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Modal from "@/components/molecules/Modal";
import { leadService } from "@/services/api/leadService";

const LeadForm = ({ isOpen, onClose, lead = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: lead?.name || "",
    email: lead?.email || "",
    phone: lead?.phone || "",
    company: lead?.company || "",
    status: lead?.status || "New",
    notes: lead?.notes || ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

const statusOptions = [
    { value: "New", label: "New" },
    { value: "Qualified", label: "Qualified" },
    { value: "Proposal", label: "Proposal" },
    { value: "Negotiation", label: "Negotiation" },
    { value: "Won", label: "Won" },
    { value: "Lost", label: "Lost" }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.company.trim()) newErrors.company = "Company is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (lead) {
        await leadService.update(lead.Id, formData);
        toast.success("Lead updated successfully!");
      } else {
        await leadService.create(formData);
        toast.success("Lead created successfully!");
      }
      
      onSuccess();
      onClose();
      setFormData({ name: "", email: "", phone: "", company: "", status: "New", notes: "" });
    } catch (error) {
      toast.error("Failed to save lead. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setFormData({ name: "", email: "", phone: "", company: "", status: "New", notes: "" });
    setErrors({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={lead ? "Edit Lead" : "Add New Lead"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
          placeholder="Enter full name"
        />

        <Input
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
          placeholder="Enter email address"
        />

        <Input
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          required
          placeholder="Enter phone number"
        />

        <Input
          label="Company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          error={errors.company}
          required
          placeholder="Enter company name"
        />

        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
            placeholder="Enter any additional notes..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            {lead ? "Update Lead" : "Create Lead"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LeadForm;