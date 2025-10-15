import contactsData from "@/services/mockData/contacts.json";

let contacts = [...contactsData];

export const contactService = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...contacts];
  },

  getById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const contact = contacts.find(c => c.Id === parseInt(id));
    return contact ? { ...contact } : null;
  },

  create: async (contactData) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const highestId = Math.max(...contacts.map(c => c.Id), 0);
    const newContact = {
      Id: highestId + 1,
      ...contactData,
      createdAt: new Date().toISOString()
    };
    contacts.push(newContact);
    return { ...newContact };
  },

  update: async (id, contactData) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = contacts.findIndex(c => c.Id === parseInt(id));
    if (index === -1) return null;
    
    contacts[index] = { ...contacts[index], ...contactData };
    return { ...contacts[index] };
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = contacts.findIndex(c => c.Id === parseInt(id));
    if (index === -1) return false;
    
    contacts.splice(index, 1);
    return true;
  }
};