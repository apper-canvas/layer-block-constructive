import { toast } from "react-toastify";
import React from "react";
import { getApperClient } from "@/services/apperClient";
import Error from "@/components/ui/Error";

const TABLE_NAME = "email_template_c";

// Transform database fields to UI properties
const transformTemplateFromDB = (dbTemplate) => {
  if (!dbTemplate) return null;
  
  return {
    Id: dbTemplate.Id,
    name: dbTemplate.name_c || "",
    subject: dbTemplate.subject_c || "",
    body: dbTemplate.body_c || "",
    category: dbTemplate.category_c || "general"
  };
};

// Transform UI properties to database fields
const transformTemplateToDB = (uiTemplate) => {
  const dbTemplate = {};
  
  if (uiTemplate.name !== undefined) dbTemplate.name_c = uiTemplate.name;
  if (uiTemplate.subject !== undefined) dbTemplate.subject_c = uiTemplate.subject;
  if (uiTemplate.body !== undefined) dbTemplate.body_c = uiTemplate.body;
  if (uiTemplate.category !== undefined) dbTemplate.category_c = uiTemplate.category;
  
  return dbTemplate;
};

export const emailTemplateService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords(TABLE_NAME, {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "name_c" } },
          { field: { Name: "subject_c" } },
          { field: { Name: "body_c" } },
          { field: { Name: "category_c" } }
        ],
        pagingInfo: {
          limit: 1000,
          offset: 0
        }
      });

      if (!response?.success) {
        console.error(response?.message || "Failed to fetch email templates");
        toast.error(response?.message || "Failed to load email templates");
        return [];
      }

      return (response.data || []).map(transformTemplateFromDB);
    } catch (error) {
      console.error("Failed to load email templates:", error?.message || error);
      toast.error("Failed to load email templates");
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.getRecordById(TABLE_NAME, parseInt(id), {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "name_c" } },
          { field: { Name: "subject_c" } },
          { field: { Name: "body_c" } },
          { field: { Name: "category_c" } }
        ]
      });

      if (!response?.success) {
        console.error(response?.message || `Failed to fetch email template ${id}`);
        return null;
      }

      return transformTemplateFromDB(response.data);
    } catch (error) {
      console.error(`Failed to load email template ${id}:`, error?.message || error);
      return null;
    }
  },

  async create(templateData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const dbTemplate = transformTemplateToDB(templateData);
      
      const response = await apperClient.createRecord(TABLE_NAME, {
        records: [dbTemplate]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to create email template: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }
        return transformTemplateFromDB(response.results[0]?.data);
      }

      return null;
    } catch (error) {
      console.error("Failed to create email template:", error?.message || error);
      toast.error("Failed to create email template");
      return null;
    }
  },

  async update(id, templateData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const dbTemplate = transformTemplateToDB(templateData);
      dbTemplate.Id = parseInt(id);

      const response = await apperClient.updateRecord(TABLE_NAME, {
        records: [dbTemplate]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to update email template: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }
        return transformTemplateFromDB(response.results[0]?.data);
      }

      return null;
    } catch (error) {
      console.error("Failed to update email template:", error?.message || error);
      toast.error("Failed to update email template");
      return null;
    }
  },

  async delete(id) {
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
          console.error(`Failed to delete email template: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Failed to delete email template:", error?.message || error);
      toast.error("Failed to delete email template");
return false;
    }
  }
};