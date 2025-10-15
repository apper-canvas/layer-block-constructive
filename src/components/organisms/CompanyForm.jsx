import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { companyService } from '@/services/api/companyService';
import Modal from '@/components/molecules/Modal';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Button from '@/components/atoms/Button';

const CompanyForm = ({ isOpen, onClose, onSuccess, company = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    employeeCount: '',
    annualRevenue: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        industry: company.industry || '',
        website: company.website || '',
        phone: company.phone || '',
        email: company.email || '',
        address: company.address || '',
        city: company.city || '',
        state: company.state || '',
        zipCode: company.zipCode || '',
        country: company.country || 'USA',
        employeeCount: company.employeeCount || '',
        annualRevenue: company.annualRevenue || '',
        notes: company.notes || ''
      });
    } else {
      resetForm();
    }
  }, [company, isOpen]);

  const resetForm = () => {
    setFormData({
      name: '',
      industry: '',
      website: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      employeeCount: '',
      annualRevenue: '',
      notes: ''
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Company name is required';
    if (!formData.industry.trim()) newErrors.industry = 'Industry is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Invalid website URL (must start with http:// or https://)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        employeeCount: formData.employeeCount ? parseInt(formData.employeeCount) : 0,
        annualRevenue: formData.annualRevenue ? parseFloat(formData.annualRevenue) : 0
      };

      if (company) {
        await companyService.update(company.Id, submitData);
      } else {
        await companyService.create(submitData);
      }
      
      onSuccess();
      resetForm();
    } catch (err) {
      toast.error(company ? 'Failed to update company' : 'Failed to create company');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Manufacturing',
    'Retail',
    'Consulting',
    'Education',
    'Real Estate',
    'Transportation',
    'Hospitality',
    'Other'
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={company ? 'Edit Company' : 'Add New Company'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Company Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
          placeholder="Enter company name"
        />

        <Select
          label="Industry"
          name="industry"
          value={formData.industry}
          onChange={handleChange}
          error={errors.industry}
          required
        >
          <option value="">Select Industry</option>
          {industries.map(industry => (
            <option key={industry} value={industry}>{industry}</option>
          ))}
        </Select>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Website"
            name="website"
            type="url"
            value={formData.website}
            onChange={handleChange}
            error={errors.website}
            placeholder="https://example.com"
          />

          <Input
            label="Phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1-555-0100"
          />
        </div>

        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="contact@company.com"
        />

        <Input
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Street address"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City"
          />

          <Input
            label="State"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="State"
          />

          <Input
            label="Zip Code"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            placeholder="Zip"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Employee Count"
            name="employeeCount"
            type="number"
            value={formData.employeeCount}
            onChange={handleChange}
            placeholder="Number of employees"
          />

          <Input
            label="Annual Revenue"
            name="annualRevenue"
            type="number"
            value={formData.annualRevenue}
            onChange={handleChange}
            placeholder="Annual revenue in USD"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Additional notes about the company"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : company ? 'Update Company' : 'Add Company'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CompanyForm;