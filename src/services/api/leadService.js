import leadsData from "@/services/mockData/leads.json";

let leads = [...leadsData];

export const leadService = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...leads];
  },

  getById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const lead = leads.find(l => l.Id === parseInt(id));
    return lead ? { ...lead } : null;
  },

  create: async (leadData) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const highestId = Math.max(...leads.map(l => l.Id), 0);
    const newLead = {
      Id: highestId + 1,
      ...leadData,
      createdAt: new Date().toISOString()
    };
    leads.push(newLead);
    return { ...newLead };
  },

  update: async (id, leadData) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = leads.findIndex(l => l.Id === parseInt(id));
    if (index === -1) return null;
    
    leads[index] = { ...leads[index], ...leadData };
    return { ...leads[index] };
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = leads.findIndex(l => l.Id === parseInt(id));
    if (index === -1) return false;
    
    leads.splice(index, 1);
    return true;
  }
};