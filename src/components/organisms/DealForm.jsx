import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { dealService } from "@/services/api/dealService";
import { contactService } from "@/services/api/contactService";
import { create, getAll, update } from "@/services/api/taskService";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Input from "@/components/atoms/Input";
import Modal from "@/components/molecules/Modal";
const DealForm = ({ isOpen, onClose, deal = null, onSuccess }) => {
  const [companies, setCompanies] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  const statusOptions = [
    { value: "Prospect", label: "Prospect" },
    { value: "Qualified", label: "Qualified" },
    { value: "Proposal", label: "Proposal" },
    { value: "Negotiation", label: "Negotiation" },
    { value: "Won", label: "Won" },
    { value: "Lost", label: "Lost" }
  ];
  
  const [formData, setFormData] = useState({
    name: "",
    value: "",
    closeDate: "",
    status: "Prospect",
    companyId: "",
    contactId: "",
    notes: ""
  });

useEffect(() => {
    if (isOpen) {
      loadContacts();
      
      if (deal) {
        setFormData({
          name: deal.name || "",
          value: deal.value || "",
          closeDate: deal.closeDate || "",
          stage: deal.stage || "New",
          contactId: deal.contactId || "",
          notes: deal.notes || ""
        });
      } else {
        setFormData({
          name: "",
          value: "",
          closeDate: "",
          stage: "New",
          contactId: "",
          notes: ""
        });
      }
      setErrors({});
    }
  }, [isOpen, deal]);

  async function loadContacts() {
    try {
      const data = await contactService.getAll();
      setContacts(data || []);
    } catch (err) {
      toast.error("Failed to load contacts");
      setContacts([]);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  }

  function validateForm() {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Deal name is required";
    }
    
    if (!formData.value || formData.value <= 0) {
      newErrors.value = "Deal value must be greater than 0";
    }
    
    if (!formData.closeDate) {
      newErrors.closeDate = "Close date is required";
    }
    
    if (!formData.contactId) {
      newErrors.contactId = "Contact is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    try {
      const dealData = {
        ...formData,
        value: parseFloat(formData.value),
        contactId: parseInt(formData.contactId)
      };
      
      if (deal) {
        await dealService.update(deal.Id, dealData);
        toast.success("Deal updated successfully");
      } else {
        await dealService.create(dealData);
        toast.success("Deal created successfully");
      }
      
      onSuccess();
    } catch (err) {
      toast.error(deal ? "Failed to update deal" : "Failed to create deal");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    if (!submitting) {
      onClose();
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={deal ? "Edit Deal" : "Add New Deal"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Deal Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
          placeholder="Enter deal name"
        />

        <Input
          label="Deal Value"
          name="value"
          type="number"
          min="0"
          step="0.01"
          value={formData.value}
          onChange={handleChange}
          error={errors.value}
          required
          placeholder="Enter deal value"
        />

        <Input
          label="Close Date"
          name="closeDate"
          type="date"
          value={formData.closeDate}
          onChange={handleChange}
          error={errors.closeDate}
          required
        />

<Select
          label="Status"
          name="stage"
          value={formData.stage}
          onChange={handleChange}
          required
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Select
          label="Associated Contact"
          name="contactId"
          value={formData.contactId}
          onChange={handleChange}
          error={errors.contactId}
          required
        >
          <option value="">Select a contact</option>
          {contacts.map(contact => (
            <option key={contact.Id} value={contact.Id}>
              {contact.name} - {contact.company}
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
            rows={4}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
            placeholder="Add any additional notes..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={submitting}
            className="flex-1"
          >
            {submitting ? "Saving..." : deal ? "Update Deal" : "Create Deal"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DealForm;