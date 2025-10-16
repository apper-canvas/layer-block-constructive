import { toast } from "react-toastify";
import React from "react";
import { getApperClient } from "@/services/apperClient";
import Error from "@/components/ui/Error";

const TABLE_NAME = "contact_c";

// Transform database fields to UI properties
const transformContactFromDB = (dbContact) => {
  if (!dbContact) return null;
  
  let activities = [];
  let address = { street: "", city: "", state: "", zip: "" };
  
  try {
    activities = dbContact.activities_c ? JSON.parse(dbContact.activities_c) : [];
  } catch (e) {
    console.error("Failed to parse activities:", e);
    activities = [];
  }
  
  try {
    address = dbContact.address_c ? JSON.parse(dbContact.address_c) : { street: "", city: "", state: "", zip: "" };
  } catch (e) {
    console.error("Failed to parse address:", e);
    address = { street: "", city: "", state: "", zip: "" };
  }

  return {
    Id: dbContact.Id,
    name: dbContact.name_c || "",
    email: dbContact.email_c || "",
    phone: dbContact.phone_c || "",
    companyId: dbContact.company_id_c?.Id || dbContact.company_id_c || null,
    type: dbContact.type_c || "Customer",
    status: dbContact.status_c || "Active",
    source: dbContact.source_c || "Direct",
    jobTitle: dbContact.job_title_c || "",
    address: address,
    notes: dbContact.notes_c || "",
    activities: activities,
    createdAt: dbContact.CreatedOn || new Date().toISOString()
  };
};

// Transform UI properties to database fields
const transformContactToDB = (uiContact) => {
  const dbContact = {};
  
  if (uiContact.name !== undefined) dbContact.name_c = uiContact.name;
  if (uiContact.email !== undefined) dbContact.email_c = uiContact.email;
  if (uiContact.phone !== undefined) dbContact.phone_c = uiContact.phone;
  if (uiContact.companyId !== undefined) {
    dbContact.company_id_c = uiContact.companyId ? parseInt(uiContact.companyId) : null;
  }
  if (uiContact.type !== undefined) dbContact.type_c = uiContact.type;
  if (uiContact.status !== undefined) dbContact.status_c = uiContact.status;
  if (uiContact.source !== undefined) dbContact.source_c = uiContact.source;
  if (uiContact.jobTitle !== undefined) dbContact.job_title_c = uiContact.jobTitle;
  if (uiContact.address !== undefined) {
    dbContact.address_c = JSON.stringify(uiContact.address || { street: "", city: "", state: "", zip: "" });
  }
  if (uiContact.notes !== undefined) dbContact.notes_c = uiContact.notes;
  if (uiContact.activities !== undefined) {
    dbContact.activities_c = JSON.stringify(uiContact.activities || []);
  }
  
  return dbContact;
};

export const contactService = {
  getAll: async () => {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords(TABLE_NAME, {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "name_c" } },
          { field: { Name: "email_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "company_id_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "source_c" } },
          { field: { Name: "job_title_c" } },
          { field: { Name: "address_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "activities_c" } },
          { field: { Name: "CreatedOn" } }
        ],
        pagingInfo: {
          limit: 1000,
          offset: 0
        }
      });

      if (!response?.success) {
        console.error(response?.message || "Failed to fetch contacts");
        toast.error(response?.message || "Failed to load contacts");
        return [];
      }

      return (response.data || []).map(transformContactFromDB);
    } catch (error) {
      console.error("Failed to load contacts:", error?.message || error);
      toast.error("Failed to load contacts");
      return [];
    }
  },

  getById: async (id) => {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.getRecordById(TABLE_NAME, parseInt(id), {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "name_c" } },
          { field: { Name: "email_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "company_id_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "source_c" } },
          { field: { Name: "job_title_c" } },
          { field: { Name: "address_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "activities_c" } },
          { field: { Name: "CreatedOn" } }
        ]
      });

      if (!response?.success) {
        console.error(response?.message || `Failed to fetch contact ${id}`);
        return null;
      }

      return transformContactFromDB(response.data);
    } catch (error) {
      console.error(`Failed to load contact ${id}:`, error?.message || error);
      return null;
    }
  },

  create: async (contactData) => {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const dbContact = transformContactToDB(contactData);
      
      const response = await apperClient.createRecord(TABLE_NAME, {
        records: [dbContact]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to create contact: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }
        return transformContactFromDB(response.results[0]?.data);
      }

      return null;
    } catch (error) {
      console.error("Failed to create contact:", error?.message || error);
      toast.error("Failed to create contact");
      return null;
    }
  },

  update: async (id, contactData) => {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const dbContact = transformContactToDB(contactData);
      dbContact.Id = parseInt(id);

      const response = await apperClient.updateRecord(TABLE_NAME, {
        records: [dbContact]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to update contact: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }
        return transformContactFromDB(response.results[0]?.data);
      }

      return null;
    } catch (error) {
      console.error("Failed to update contact:", error?.message || error);
      toast.error("Failed to update contact");
      return null;
    }
  },

  delete: async (id) => {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.deleteRecord(TABLE_NAME, {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to delete contact: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Failed to delete contact:", error?.message || error);
      toast.error("Failed to delete contact");
      return false;
    }
  },

  exportContacts: async () => {
    try {
      const contacts = await this.getAll();
      
      const headers = [
        'Name', 'Email', 'Phone', 'Company ID', 'Job Title',
        'Street', 'City', 'State', 'ZIP', 'Notes', 'Type', 'Status', 'Source'
      ];
      
      const escapeCSV = (value) => {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };
      
      const rows = contacts.map(contact => [
        escapeCSV(contact.name),
        escapeCSV(contact.email),
        escapeCSV(contact.phone),
        escapeCSV(contact.companyId || ''),
        escapeCSV(contact.jobTitle),
        escapeCSV(contact.address?.street || ''),
        escapeCSV(contact.address?.city || ''),
        escapeCSV(contact.address?.state || ''),
        escapeCSV(contact.address?.zip || ''),
        escapeCSV(contact.notes),
        escapeCSV(contact.type || 'Customer'),
        escapeCSV(contact.status || 'Active'),
        escapeCSV(contact.source || 'Direct')
      ].join(','));
      
      const csvContent = [headers.join(','), ...rows].join('\n');
      return csvContent;
    } catch (error) {
      console.error("Failed to export contacts:", error?.message || error);
      toast.error("Failed to export contacts");
      return "";
    }
  },

  importContacts: async (contactsData) => {
    try {
      const importedContacts = [];
      
      for (const contactData of contactsData) {
        if (!contactData.name || !contactData.email) {
          throw new Error('Name and Email are required for all contacts');
        }
        
        const newContact = {
          name: contactData.name,
          email: contactData.email,
          phone: contactData.phone || '',
          companyId: contactData.companyId ? parseInt(contactData.companyId) : null,
          type: contactData.type || 'Customer',
          status: contactData.status || 'Active',
          source: contactData.source || 'Import',
          jobTitle: contactData.jobTitle || '',
          address: {
            street: contactData.street || '',
            city: contactData.city || '',
            state: contactData.state || '',
            zip: contactData.zip || ''
          },
          notes: contactData.notes || '',
          activities: []
        };
        
        const created = await this.create(newContact);
        if (created) {
          importedContacts.push(created);
        }
      }
      
      return importedContacts;
    } catch (error) {
      console.error("Failed to import contacts:", error?.message || error);
      toast.error(error.message || "Failed to import contacts");
throw error;
    }
  }
};