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
  },

  exportContacts: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
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
  },

  importContacts: async (contactsData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const importedContacts = [];
    let highestId = Math.max(...contacts.map(c => c.Id), 0);
    
    for (const contactData of contactsData) {
      if (!contactData.name || !contactData.email) {
        throw new Error('Name and Email are required for all contacts');
      }
      
      highestId += 1;
      const newContact = {
        Id: highestId,
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
        activities: [],
        createdAt: new Date().toISOString()
      };
      
      contacts.push(newContact);
      importedContacts.push(newContact);
    }
    
    return importedContacts;
  }
};