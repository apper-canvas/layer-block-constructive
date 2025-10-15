import companiesData from '../mockData/companies.json';
import { contactService } from './contactService';
import { dealService } from './dealService';

let companies = [...companiesData];

const companyService = {
  getAll() {
    return Promise.resolve(companies.map(c => ({ ...c })));
  },

  getById(id) {
    const company = companies.find(c => c.Id === parseInt(id));
    return Promise.resolve(company ? { ...company } : null);
  },

  async create(companyData) {
    const newCompany = {
      Id: companies.length > 0 ? Math.max(...companies.map(c => c.Id)) + 1 : 1,
      name: companyData.name,
      industry: companyData.industry,
      website: companyData.website || '',
      phone: companyData.phone || '',
      email: companyData.email || '',
      address: companyData.address || '',
      city: companyData.city || '',
      state: companyData.state || '',
      zipCode: companyData.zipCode || '',
      country: companyData.country || 'USA',
      employeeCount: companyData.employeeCount || 0,
      annualRevenue: companyData.annualRevenue || 0,
      notes: companyData.notes || '',
      createdAt: new Date().toISOString()
    };
    companies.push(newCompany);
    return Promise.resolve({ ...newCompany });
  },

  async update(id, companyData) {
    const index = companies.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      return Promise.reject(new Error('Company not found'));
    }
    companies[index] = {
      ...companies[index],
      ...companyData,
      Id: companies[index].Id
    };
    return Promise.resolve({ ...companies[index] });
  },

  async delete(id) {
    const index = companies.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      return Promise.reject(new Error('Company not found'));
    }
    companies.splice(index, 1);
    return Promise.resolve({ success: true });
  },

  async getCompanyContacts(companyId) {
    const allContacts = await contactService.getAll();
    return allContacts.filter(contact => contact.companyId === parseInt(companyId));
  },

  async getCompanyDeals(companyId) {
    const allDeals = await dealService.getAll();
    const companyContacts = await this.getCompanyContacts(companyId);
    const contactIds = companyContacts.map(c => c.Id);
    return allDeals.filter(deal => contactIds.includes(deal.contactId));
  },

  async getCompanyStats(companyId) {
    const contacts = await this.getCompanyContacts(companyId);
    const deals = await this.getCompanyDeals(companyId);
    
    const totalDealValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    const activeDeals = deals.filter(deal => deal.status !== 'Lost' && deal.status !== 'Won');
    const wonDeals = deals.filter(deal => deal.status === 'Won');
    
    return {
      contactCount: contacts.length,
      dealCount: deals.length,
      totalDealValue,
      activeDealCount: activeDeals.length,
      wonDealCount: wonDeals.length,
      wonDealValue: wonDeals.reduce((sum, deal) => sum + (deal.value || 0), 0)
    };
  }
};

export { companyService };