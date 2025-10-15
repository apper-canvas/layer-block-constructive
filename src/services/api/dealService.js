import dealsData from "@/services/mockData/deals.json";

let deals = [...dealsData];

export const dealService = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...deals];
  },

  getFiltered: async (filters) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    let filtered = [...deals];

    if (filters.dateRange?.start) {
      filtered = filtered.filter(deal => new Date(deal.createdAt) >= new Date(filters.dateRange.start));
    }
    if (filters.dateRange?.end) {
      filtered = filtered.filter(deal => new Date(deal.createdAt) <= new Date(filters.dateRange.end));
    }
    if (filters.valueRange?.min !== undefined) {
      filtered = filtered.filter(deal => deal.value >= filters.valueRange.min);
    }
    if (filters.valueRange?.max !== undefined) {
      filtered = filtered.filter(deal => deal.value <= filters.valueRange.max);
    }
    if (filters.lastContactDate) {
      filtered = filtered.filter(deal => deal.lastContactDate && new Date(deal.lastContactDate) >= new Date(filters.lastContactDate));
    }
    if (filters.customFields && Object.keys(filters.customFields).length > 0) {
      filtered = filtered.filter(deal => {
        return Object.entries(filters.customFields).every(([key, value]) => {
          return deal[key] && deal[key].toString().toLowerCase().includes(value.toLowerCase());
        });
      });
    }

    return filtered;
  },

  getById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const deal = deals.find(d => d.Id === parseInt(id));
    return deal ? { ...deal } : null;
  },

  create: async (dealData) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const highestId = Math.max(...deals.map(d => d.Id), 0);
    const newDeal = {
      Id: highestId + 1,
      ...dealData,
      notes: dealData.notes || "",
      createdAt: new Date().toISOString()
    };
    deals.push(newDeal);
    return { ...newDeal };
  },

update: async (id, dealData) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = deals.findIndex(d => d.Id === parseInt(id));
    if (index === -1) return null;
    
    deals[index] = {
      ...deals[index],
      ...dealData,
      notes: dealData.notes !== undefined ? dealData.notes : deals[index].notes || ""
    };
    
    return { ...deals[index] };
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = deals.findIndex(d => d.Id === parseInt(id));
    if (index === -1) return false;
    deals.splice(index, 1);
    return true;
  }
};