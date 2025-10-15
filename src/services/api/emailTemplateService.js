import emailTemplatesData from "@/services/mockData/emailTemplates.json";

let emailTemplates = [...emailTemplatesData];

export const emailTemplateService = {
  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...emailTemplates];
  },

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const template = emailTemplates.find(t => t.Id === parseInt(id));
    return template ? { ...template } : null;
  },

  async create(templateData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newId = Math.max(...emailTemplates.map(t => t.Id), 0) + 1;
    const newTemplate = {
      Id: newId,
      name: templateData.name,
      subject: templateData.subject,
      body: templateData.body,
      category: templateData.category || "general"
    };
    emailTemplates.push(newTemplate);
    return { ...newTemplate };
  },

  async update(id, templateData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = emailTemplates.findIndex(t => t.Id === parseInt(id));
    if (index === -1) return null;
    emailTemplates[index] = {
      ...emailTemplates[index],
      ...templateData
    };
    return { ...emailTemplates[index] };
  },

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = emailTemplates.findIndex(t => t.Id === parseInt(id));
    if (index === -1) return false;
    emailTemplates.splice(index, 1);
    return true;
  }
};