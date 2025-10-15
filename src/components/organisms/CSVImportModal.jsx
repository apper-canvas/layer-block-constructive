import React, { useState } from "react";
import { toast } from "react-toastify";
import { contactService } from "@/services/api/contactService";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Modal from "@/components/molecules/Modal";
import ApperIcon from "@/components/ApperIcon";

const CSVImportModal = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [fieldMapping, setFieldMapping] = useState({
    name: '',
    email: '',
    phone: '',
    companyId: '',
    jobTitle: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    notes: '',
    type: '',
    status: '',
    source: ''
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: upload, 2: mapping, 3: preview

  const contactFields = [
    { value: 'name', label: 'Name *', required: true },
    { value: 'email', label: 'Email *', required: true },
    { value: 'phone', label: 'Phone' },
    { value: 'companyId', label: 'Company ID' },
    { value: 'jobTitle', label: 'Job Title' },
    { value: 'street', label: 'Street Address' },
    { value: 'city', label: 'City' },
    { value: 'state', label: 'State' },
    { value: 'zip', label: 'ZIP Code' },
    { value: 'notes', label: 'Notes' },
    { value: 'type', label: 'Type' },
    { value: 'status', label: 'Status' },
    { value: 'source', label: 'Source' }
  ];

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return { headers: [], data: [] };

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const data = lines.slice(1).map(line => {
      const values = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/^"|"$/g, ''));

      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    return { headers, data };
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      const { headers, data } = parseCSV(text);
      setHeaders(headers);
      setCsvData(data);
      
      // Auto-map fields based on header names
      const autoMapping = {};
      headers.forEach(header => {
        const lowerHeader = header.toLowerCase();
        if (lowerHeader.includes('name')) autoMapping.name = header;
        else if (lowerHeader.includes('email')) autoMapping.email = header;
        else if (lowerHeader.includes('phone')) autoMapping.phone = header;
        else if (lowerHeader.includes('company') && lowerHeader.includes('id')) autoMapping.companyId = header;
        else if (lowerHeader.includes('job') || lowerHeader.includes('title')) autoMapping.jobTitle = header;
        else if (lowerHeader.includes('street')) autoMapping.street = header;
        else if (lowerHeader.includes('city')) autoMapping.city = header;
        else if (lowerHeader.includes('state')) autoMapping.state = header;
        else if (lowerHeader.includes('zip')) autoMapping.zip = header;
        else if (lowerHeader.includes('note')) autoMapping.notes = header;
        else if (lowerHeader.includes('type')) autoMapping.type = header;
        else if (lowerHeader.includes('status')) autoMapping.status = header;
        else if (lowerHeader.includes('source')) autoMapping.source = header;
      });
      setFieldMapping(prev => ({ ...prev, ...autoMapping }));
      setStep(2);
    };
    reader.readAsText(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const fakeEvent = { target: { files: [droppedFile] } };
      handleFileChange(fakeEvent);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleMappingChange = (field, csvColumn) => {
    setFieldMapping(prev => ({ ...prev, [field]: csvColumn }));
  };

  const validateMapping = () => {
    if (!fieldMapping.name || !fieldMapping.email) {
      toast.error('Name and Email fields are required');
      return false;
    }
    return true;
  };

  const handlePreview = () => {
    if (!validateMapping()) return;
    setStep(3);
  };

  const handleImport = async () => {
    if (!validateMapping()) return;

    setLoading(true);
    try {
      const mappedData = csvData.map(row => {
        const contact = {};
        Object.keys(fieldMapping).forEach(field => {
          const csvColumn = fieldMapping[field];
          if (csvColumn && row[csvColumn]) {
            contact[field] = row[csvColumn];
          }
        });
        return contact;
      });

      await contactService.importContacts(mappedData);
      toast.success(`Successfully imported ${mappedData.length} contacts!`);
      onSuccess();
      handleClose();
    } catch (error) {
      toast.error(error.message || 'Failed to import contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setCsvData([]);
    setHeaders([]);
    setFieldMapping({
      name: '', email: '', phone: '', companyId: '', jobTitle: '',
      street: '', city: '', state: '', zip: '', notes: '', type: '', status: '', source: ''
    });
    setStep(1);
    onClose();
  };

  const getPreviewData = () => {
    return csvData.slice(0, 5).map(row => {
      const contact = {};
      Object.keys(fieldMapping).forEach(field => {
        const csvColumn = fieldMapping[field];
        if (csvColumn && row[csvColumn]) {
          contact[field] = row[csvColumn];
        }
      });
      return contact;
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Contacts from CSV"
      size="lg"
    >
      <div className="space-y-6">
        {step === 1 && (
          <div>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
            >
              <ApperIcon name="Upload" size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drop your CSV file here or click to browse
              </p>
              <p className="text-sm text-gray-500 mb-4">
                CSV file should include headers for Name and Email (required)
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload">
                <Button variant="primary" as="span">
                  Select CSV File
                </Button>
              </label>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">CSV Format Guidelines:</p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>First row should contain column headers</li>
                <li>Required fields: Name, Email</li>
                <li>Optional fields: Phone, Company ID, Job Title, Address fields, Notes</li>
                <li>Use commas to separate values</li>
                <li>Enclose values with commas in quotes</li>
              </ul>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <ApperIcon name="CheckCircle" size={16} className="inline mr-2" />
                File loaded: <span className="font-medium">{file?.name}</span> ({csvData.length} rows)
              </p>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Map your CSV columns to contact fields. Fields marked with * are required.
            </p>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {contactFields.map(field => (
                <div key={field.value}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  <Select
                    value={fieldMapping[field.value]}
                    onChange={(e) => handleMappingChange(field.value, e.target.value)}
                  >
                    <option value="">-- Do not import --</option>
                    {headers.map(header => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </Select>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button variant="secondary" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handlePreview}>
                Preview Import
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="mb-4">
              <p className="text-sm text-gray-700 mb-2">
                Preview of first 5 contacts to be imported:
              </p>
            </div>
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Job Title</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getPreviewData().map((contact, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-900">{contact.name || '-'}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{contact.email || '-'}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{contact.phone || '-'}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{contact.jobTitle || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <ApperIcon name="Info" size={16} className="inline mr-2" />
                Total contacts to import: <span className="font-medium">{csvData.length}</span>
              </p>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button variant="secondary" onClick={() => setStep(2)}>
                Back to Mapping
              </Button>
              <Button onClick={handleImport} loading={loading}>
                Import Contacts
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CSVImportModal;