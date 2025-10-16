import { toast } from "react-toastify";
import React from "react";
import { getApperClient } from "@/services/apperClient";
import Error from "@/components/ui/Error";

const TABLE_NAME = "lead_c";

// Transform database fields to UI properties
const transformLeadFromDB = (dbLead) => {
  if (!dbLead) return null;
  
let activities = [];
  try {
    // Validate activities_c is a non-empty string before parsing
    if (dbLead.activities_c && 
        typeof dbLead.activities_c === 'string' && 
        dbLead.activities_c.trim() !== '') {
      
      // Additional check: ensure it looks like JSON (starts with [ or {)
      const trimmed = dbLead.activities_c.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        activities = JSON.parse(trimmed);
      } else {
        console.error("activities_c does not appear to be valid JSON format:", trimmed.substring(0, 50));
        activities = [];
      }
    } else {
      activities = [];
    }
  } catch (e) {
    console.error("Failed to parse activities_c. Error:", e.message, "Value:", dbLead.activities_c?.substring(0, 50));
    activities = [];
  }

  return {
    Id: dbLead.Id,
    name: dbLead.name_c || "",
    email: dbLead.email_c || "",
    phone: dbLead.phone_c || "",
    company: dbLead.company_c || "",
    status: dbLead.status_c || "New",
    notes: dbLead.notes_c || "",
    activities: activities,
    createdAt: dbLead.CreatedOn || new Date().toISOString()
  };
};

// Transform UI properties to database fields
const transformLeadToDB = (uiLead) => {
  const dbLead = {};
  
  if (uiLead.name !== undefined) dbLead.name_c = uiLead.name;
  if (uiLead.email !== undefined) dbLead.email_c = uiLead.email;
  if (uiLead.phone !== undefined) dbLead.phone_c = uiLead.phone;
  if (uiLead.company !== undefined) dbLead.company_c = uiLead.company;
  if (uiLead.status !== undefined) dbLead.status_c = uiLead.status;
  if (uiLead.notes !== undefined) dbLead.notes_c = uiLead.notes;
  if (uiLead.activities !== undefined) {
    dbLead.activities_c = JSON.stringify(uiLead.activities || []);
  }
  
  return dbLead;
};

export const leadService = {
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
          { field: { Name: "company_c" } },
          { field: { Name: "status_c" } },
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
        console.error(response?.message || "Failed to fetch leads");
        toast.error(response?.message || "Failed to load leads");
        return [];
      }

      return (response.data || []).map(transformLeadFromDB);
    } catch (error) {
      console.error("Failed to load leads:", error?.message || error);
      toast.error("Failed to load leads");
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
          { field: { Name: "company_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "activities_c" } },
          { field: { Name: "CreatedOn" } }
        ]
      });

      if (!response?.success) {
        console.error(response?.message || `Failed to fetch lead ${id}`);
        return null;
      }

      return transformLeadFromDB(response.data);
    } catch (error) {
      console.error(`Failed to load lead ${id}:`, error?.message || error);
      return null;
    }
  },

  create: async (leadData) => {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const dbLead = transformLeadToDB(leadData);
      
      const response = await apperClient.createRecord(TABLE_NAME, {
        records: [dbLead]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to create lead: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }
        return transformLeadFromDB(response.results[0]?.data);
      }

      return null;
    } catch (error) {
      console.error("Failed to create lead:", error?.message || error);
      toast.error("Failed to create lead");
      return null;
    }
  },

  update: async (id, leadData) => {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const dbLead = transformLeadToDB(leadData);
      dbLead.Id = parseInt(id);

      const response = await apperClient.updateRecord(TABLE_NAME, {
        records: [dbLead]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to update lead: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }
        return transformLeadFromDB(response.results[0]?.data);
      }

      return null;
    } catch (error) {
      console.error("Failed to update lead:", error?.message || error);
      toast.error("Failed to update lead");
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
          console.error(`Failed to delete lead: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Failed to delete lead:", error?.message || error);
      toast.error("Failed to delete lead");
return false;
    }
  }
};