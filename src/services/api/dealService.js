import dealsData from "@/services/mockData/deals.json";

let deals = [...dealsData];

export const dealService = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...deals];
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
      notes: dealData.notes || deals[index].notes || ""
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