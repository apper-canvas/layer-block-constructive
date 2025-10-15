import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { contactService } from "@/services/api/contactService";
import { companyService } from "@/services/api/companyService";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Input from "@/components/atoms/Input";
import Modal from "@/components/molecules/Modal";

const ContactForm = ({ isOpen, onClose, contact = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: contact?.name || "",
    email: contact?.email || "",
    phone: contact?.phone || "",
    companyId: contact?.companyId || "",
    jobTitle: contact?.jobTitle || "",
    address: contact?.address || { street: "", city: "", state: "", zip: "" },
    notes: contact?.notes || ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const response = await companyService.getAll();
        setCompanies(response?.data || []);
      } catch (error) {
        console.error("Failed to fetch companies:", error);
        toast.error("Failed to load companies");
        setCompanies([]);
      } finally {
        setLoadingCompanies(false);
      }
    };

    if (isOpen) {
      fetchCompanies();
    }
  }, [isOpen]);
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
    if (!formData.companyId) newErrors.companyId = "Company is required";
    if (!formData.jobTitle.trim()) newErrors.jobTitle = "Job title is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
if (contact) {
        await contactService.update(contact.id, formData);
        toast.success("Contact updated successfully!");
      } else {
        await contactService.create(formData);
        toast.success("Contact created successfully!");
}
      onSuccess();
      onClose();
      setFormData({ 
        name: "", 
        email: "", 
        phone: "", 
        companyId: "", 
        jobTitle: "", 
        address: { street: "", city: "", state: "", zip: "" }, 
        notes: "" 
      });
    } catch (error) {
      console.error("Failed to save contact:", error);
      toast.error("Failed to save contact. Please try again.");
    } finally {
      setLoading(false);
    }
  };

const handleClose = () => {
    onClose();
    setFormData({ 
      name: "", 
      email: "", 
      phone: "", 
      companyId: "", 
      jobTitle: "", 
      address: { street: "", city: "", state: "", zip: "" }, 
      notes: "" 
    });
    setErrors({});
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={contact ? "Edit Contact" : "Add New Contact"}
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

<Select
          label="Company"
          name="companyId"
          value={formData.companyId}
          onChange={handleChange}
          error={errors.companyId}
          required
          disabled={loadingCompanies}
        >
          <option value="">{loadingCompanies ? "Loading companies..." : "Select Company"}</option>
          {companies.map(c => (
            <option key={c.Id} value={c.Id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Input
          label="Job Title"
          name="jobTitle"
          value={formData.jobTitle}
          onChange={handleChange}
          error={errors.jobTitle}
          required
          placeholder="Enter job title"
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <Input
            name="address.street"
            value={formData.address.street}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              address: { ...prev.address, street: e.target.value }
            }))}
            placeholder="Street address"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              name="address.city"
              value={formData.address.city}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                address: { ...prev.address, city: e.target.value }
              }))}
              placeholder="City"
            />
            <Input
              name="address.state"
              value={formData.address.state}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                address: { ...prev.address, state: e.target.value }
              }))}
              placeholder="State"
            />
          </div>
          <Input
            name="address.zip"
            value={formData.address.zip}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              address: { ...prev.address, zip: e.target.value }
            }))}
            placeholder="ZIP code"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Add notes about this contact..."
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
            {contact ? "Update Contact" : "Create Contact"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ContactForm;