import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";

const TABLE_NAME = "deal_c";

// Transform database fields to UI properties
const transformDealFromDB = (dbDeal) => {
  if (!dbDeal) return null;
  
  return {
    Id: dbDeal.Id,
    name: dbDeal.name_c || "",
    value: dbDeal.value_c || 0,
    stage: dbDeal.stage_c || "Prospecting",
    closeDate: dbDeal.close_date_c || "",
    contactId: dbDeal.contact_id_c?.Id || dbDeal.contact_id_c || null,
    notes: dbDeal.notes_c || "",
    createdAt: dbDeal.CreatedOn || new Date().toISOString()
  };
};

// Transform UI properties to database fields
const transformDealToDB = (uiDeal) => {
  const dbDeal = {};
  
  if (uiDeal.name !== undefined) dbDeal.name_c = uiDeal.name;
  if (uiDeal.value !== undefined) dbDeal.value_c = parseFloat(uiDeal.value) || 0;
  if (uiDeal.stage !== undefined) dbDeal.stage_c = uiDeal.stage;
  if (uiDeal.closeDate !== undefined) dbDeal.close_date_c = uiDeal.closeDate;
  if (uiDeal.contactId !== undefined) dbDeal.contact_id_c = uiDeal.contactId ? parseInt(uiDeal.contactId) : null;
  if (uiDeal.notes !== undefined) dbDeal.notes_c = uiDeal.notes;
  
  return dbDeal;
};

export const dealService = {
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
          { field: { Name: "value_c" } },
          { field: { Name: "stage_c" } },
          { field: { Name: "close_date_c" } },
          { field: { Name: "contact_id_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "CreatedOn" } }
        ],
        pagingInfo: {
          limit: 1000,
          offset: 0
        }
      });

      if (!response?.success) {
        console.error(response?.message || "Failed to fetch deals");
        toast.error(response?.message || "Failed to load deals");
        return [];
      }

      return (response.data || []).map(transformDealFromDB);
    } catch (error) {
      console.error("Failed to load deals:", error?.message || error);
      toast.error("Failed to load deals");
      return [];
    }
  },

  getFiltered: async (filters) => {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const whereConditions = [];

      if (filters.dateRange?.start) {
        whereConditions.push({
          FieldName: "CreatedOn",
          Operator: "GreaterThanOrEqualTo",
          Values: [filters.dateRange.start]
        });
      }
      if (filters.dateRange?.end) {
        whereConditions.push({
          FieldName: "CreatedOn",
          Operator: "LessThanOrEqualTo",
          Values: [filters.dateRange.end]
        });
      }
      if (filters.valueRange?.min !== undefined) {
        whereConditions.push({
          FieldName: "value_c",
          Operator: "GreaterThanOrEqualTo",
          Values: [filters.valueRange.min]
        });
      }
      if (filters.valueRange?.max !== undefined) {
        whereConditions.push({
          FieldName: "value_c",
          Operator: "LessThanOrEqualTo",
          Values: [filters.valueRange.max]
        });
      }

      const response = await apperClient.fetchRecords(TABLE_NAME, {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "name_c" } },
          { field: { Name: "value_c" } },
          { field: { Name: "stage_c" } },
          { field: { Name: "close_date_c" } },
          { field: { Name: "contact_id_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "CreatedOn" } }
        ],
        where: whereConditions.length > 0 ? whereConditions : undefined,
        pagingInfo: {
          limit: 1000,
          offset: 0
        }
      });

      if (!response?.success) {
        console.error(response?.message || "Failed to fetch filtered deals");
        toast.error(response?.message || "Failed to filter deals");
        return [];
      }

      let filtered = (response.data || []).map(transformDealFromDB);

      // Apply custom field filters client-side if needed
      if (filters.customFields && Object.keys(filters.customFields).length > 0) {
        filtered = filtered.filter(deal => {
          return Object.entries(filters.customFields).every(([key, value]) => {
            return deal[key] && deal[key].toString().toLowerCase().includes(value.toLowerCase());
          });
        });
      }

      return filtered;
    } catch (error) {
      console.error("Failed to filter deals:", error?.message || error);
      toast.error("Failed to filter deals");
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
          { field: { Name: "value_c" } },
          { field: { Name: "stage_c" } },
          { field: { Name: "close_date_c" } },
          { field: { Name: "contact_id_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "CreatedOn" } }
        ]
      });

      if (!response?.success) {
        console.error(response?.message || `Failed to fetch deal ${id}`);
        return null;
      }

      return transformDealFromDB(response.data);
    } catch (error) {
      console.error(`Failed to load deal ${id}:`, error?.message || error);
      return null;
    }
  },

  create: async (dealData) => {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const dbDeal = transformDealToDB(dealData);
      
      const response = await apperClient.createRecord(TABLE_NAME, {
        records: [dbDeal]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to create deal: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }
        return transformDealFromDB(response.results[0]?.data);
      }

      return null;
    } catch (error) {
      console.error("Failed to create deal:", error?.message || error);
      toast.error("Failed to create deal");
      return null;
    }
  },

  update: async (id, dealData) => {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const dbDeal = transformDealToDB(dealData);
      dbDeal.Id = parseInt(id);

      const response = await apperClient.updateRecord(TABLE_NAME, {
        records: [dbDeal]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to update deal: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }
        return transformDealFromDB(response.results[0]?.data);
      }

      return null;
    } catch (error) {
      console.error("Failed to update deal:", error?.message || error);
      toast.error("Failed to update deal");
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
          console.error(`Failed to delete deal: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Failed to delete deal:", error?.message || error);
      toast.error("Failed to delete deal");
      return false;
    }
  }
};