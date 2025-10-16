import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";

const companyService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

const response = await apperClient.fetchRecords("company_c", {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "name_c" } },
          { field: { Name: "industry_c" } },
          { field: { Name: "website_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "email_c" } },
          { field: { Name: "address_c" } },
          { field: { Name: "city_c" } },
          { field: { Name: "state_c" } },
          { field: { Name: "zip_code_c" } },
          { field: { Name: "country_c" } },
          { field: { Name: "employee_count_c" } },
          { field: { Name: "annual_revenue_c" } },
          { field: { Name: "notes_c" } }
        ]
      });
if (!response?.data) {
        return [];
      }

      // Transform database field names to UI-friendly property names
return response.data.map(company => ({
        Id: company.Id,
        name: company.name_c,
        industry: company.industry_c,
        website: company.website_c,
        phone: company.phone_c,
        email: company.email_c,
        address: company.address_c,
        city: company.city_c,
        state: company.state_c,
        zipCode: company.zip_code_c,
        country: company.country_c,
        employeeCount: company.employee_count_c,
        annualRevenue: company.annual_revenue_c,
        notes: company.notes_c
      }));
    } catch (error) {
      console.error("Failed to load companies:", error?.message || error);
      toast.error("Failed to load companies");
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.getRecordById("company_c", parseInt(id), {
fields: [
          { field: { Name: "Id" } },
          { field: { Name: "name_c" } },
          { field: { Name: "industry_c" } },
          { field: { Name: "website_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "email_c" } },
          { field: { Name: "address_c" } },
          { field: { Name: "city_c" } },
          { field: { Name: "state_c" } },
          { field: { Name: "zip_code_c" } },
          { field: { Name: "country_c" } },
          { field: { Name: "employee_count_c" } },
          { field: { Name: "annual_revenue_c" } },
          { field: { Name: "notes_c" } }
        ]
});

      if (!response?.data) {
        return null;
      }

      // Transform database field names to UI-friendly property names
const company = response.data;
      return {
        Id: company.Id,
        name: company.name_c,
        industry: company.industry_c,
        website: company.website_c,
        phone: company.phone_c,
        email: company.email_c,
        address: company.address_c,
        city: company.city_c,
        state: company.state_c,
        zipCode: company.zip_code_c,
        country: company.country_c,
        employeeCount: company.employee_count_c,
        annualRevenue: company.annual_revenue_c,
        notes: company.notes_c
      };
    } catch (error) {
      console.error(`Failed to load company ${id}:`, error?.message || error);
      return null;
    }
  },

  async create(companyData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const payload = {
        records: [
          {
            name_c: companyData.name,
            industry_c: companyData.industry,
            website_c: companyData.website || '',
            phone_c: companyData.phone || '',
            email_c: companyData.email || '',
            address_c: companyData.address || '',
            city_c: companyData.city || '',
            state_c: companyData.state || '',
            zip_code_c: companyData.zipCode || '',
            country_c: companyData.country || 'USA',
            employee_count_c: companyData.employeeCount ? parseInt(companyData.employeeCount) : null,
            annual_revenue_c: companyData.annualRevenue ? parseFloat(companyData.annualRevenue) : null,
            notes_c: companyData.notes || ''
          }
        ]
      };

      const response = await apperClient.createRecord("company_c", payload);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to create company: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }
        return response.results[0]?.data || null;
      }

      return null;
    } catch (error) {
      console.error("Failed to create company:", error?.message || error);
      toast.error("Failed to create company");
      return null;
    }
  },

  async update(id, companyData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const payload = {
        records: [
          {
            Id: parseInt(id),
            name_c: companyData.name,
            industry_c: companyData.industry,
            website_c: companyData.website || '',
            phone_c: companyData.phone || '',
            email_c: companyData.email || '',
            address_c: companyData.address || '',
            city_c: companyData.city || '',
            state_c: companyData.state || '',
            zip_code_c: companyData.zipCode || '',
            country_c: companyData.country || 'USA',
            employee_count_c: companyData.employeeCount ? parseInt(companyData.employeeCount) : null,
            annual_revenue_c: companyData.annualRevenue ? parseFloat(companyData.annualRevenue) : null,
            notes_c: companyData.notes || ''
          }
        ]
      };

      const response = await apperClient.updateRecord("company_c", payload);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to update company: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }
        return response.results[0]?.data || null;
      }

      return null;
    } catch (error) {
      console.error("Failed to update company:", error?.message || error);
      toast.error("Failed to update company");
      return null;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.deleteRecord("company_c", {
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
          console.error(`Failed to delete company: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Failed to delete company:", error?.message || error);
      toast.error("Failed to delete company");
      return false;
    }
  },

  async getCompanyContacts(companyId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords("contact_c", {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "name_c" } },
          { field: { Name: "email_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "company_id_c" } }
        ],
        where: [
          {
            FieldName: "company_id_c",
            Operator: "EqualTo",
            Values: [parseInt(companyId)]
          }
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Failed to load company contacts:", error?.message || error);
      return [];
    }
  },

  async getCompanyDeals(companyId) {
    try {
      const contacts = await this.getCompanyContacts(companyId);
      const contactIds = contacts.map(c => c.Id);

      if (contactIds.length === 0) {
        return [];
      }

      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords("deal_c", {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "name_c" } },
          { field: { Name: "value_c" } },
          { field: { Name: "stage_c" } },
          { field: { Name: "contact_id_c" } }
        ],
        whereGroups: [
          {
            operator: "OR",
            subGroups: contactIds.map(contactId => ({
              conditions: [
                {
                  fieldName: "contact_id_c",
                  operator: "EqualTo",
                  values: [contactId]
                }
              ]
            }))
          }
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Failed to load company deals:", error?.message || error);
      return [];
    }
  },

  async getCompanyStats(companyId) {
    const contacts = await this.getCompanyContacts(companyId);
    const deals = await this.getCompanyDeals(companyId);
    
    const totalDealValue = deals.reduce((sum, deal) => sum + (deal.value_c || 0), 0);
    const activeDeals = deals.filter(deal => deal.stage_c !== 'Lost' && deal.stage_c !== 'Closed Won');
    const wonDeals = deals.filter(deal => deal.stage_c === 'Closed Won');
    
    return {
      contactCount: contacts.length,
      dealCount: deals.length,
      totalDealValue,
      activeDealCount: activeDeals.length,
      wonDealCount: wonDeals.length,
      wonDealValue: wonDeals.reduce((sum, deal) => sum + (deal.value_c || 0), 0)
    };
  }
};

export { companyService };