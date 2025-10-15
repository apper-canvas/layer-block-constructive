import contactsData from "@/services/mockData/contacts.json";

let contacts = [...contactsData].map(c => ({ ...c, activities: c.activities || [], companyId: c.companyId || null }));

export const contactService = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...contacts];
  },

  getById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const contact = contacts.find(c => c.Id === parseInt(id));
    return contact ? { ...contact, activities: contact.activities || [] } : null;
  },

  create: async (contactData) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const highestId = Math.max(...contacts.map(c => c.Id), 0);
    const newContact = {
      Id: highestId + 1,
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone,
      companyId: contactData.companyId ? parseInt(contactData.companyId) : null,
      type: contactData.type || 'Customer',
      status: contactData.status || 'Active',
      source: contactData.source || 'Direct',
      jobTitle: contactData.jobTitle || '',
      address: contactData.address || { street: "", city: "", state: "", zip: "" },
      notes: contactData.notes || '',
      activities: contactData.activities || [],
      createdAt: new Date().toISOString()
    };
    contacts.push(newContact);
    return { ...newContact };
  },

  update: async (id, contactData) => {
    await new Promise(resolve => setTimeout(resolve, 400));
const index = contacts.findIndex(c => c.Id === parseInt(id));
    if (index === -1) return null;
    contacts[index] = { 
      ...contacts[index], 
...contactData,
      companyId: contactData.companyId ? parseInt(contactData.companyId) : null,
      jobTitle: contactData.jobTitle || contacts[index].jobTitle || "",
      address: contactData.address || contacts[index].address || { street: "", city: "", state: "", zip: "" },
      notes: contactData.notes || contacts[index].notes || "",
      activities: contactData.activities || contacts[index].activities || []
    };
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