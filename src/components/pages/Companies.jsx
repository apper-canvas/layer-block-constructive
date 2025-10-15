import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { companyService } from '@/services/api/companyService';
import { contactService } from '@/services/api/contactService';
import { dealService } from '@/services/api/dealService';
import CompanyCard from '@/components/molecules/CompanyCard';
import CompanyForm from '@/components/organisms/CompanyForm';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import MetricCard from '@/components/molecules/MetricCard';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    window.addEventListener('addButtonClick', handleAddClick);
    return () => window.removeEventListener('addButtonClick', handleAddClick);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [companiesData, contactsData, dealsData] = await Promise.all([
        companyService.getAll(),
        contactService.getAll(),
        dealService.getAll()
      ]);
      setCompanies(companiesData);
      setContacts(contactsData);
      setDeals(dealsData);
    } catch (err) {
      setError('Failed to load companies');
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    loadData();
    setIsFormOpen(false);
    toast.success('Company created successfully');
  };

  const handleCompanyClick = (companyId) => {
    navigate(`/companies/${companyId}`);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  const industries = ['all', ...new Set(companies.map(c => c.industry))];

  let filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.city && company.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (industryFilter !== 'all') {
    filteredCompanies = filteredCompanies.filter(company => company.industry === industryFilter);
  }

  filteredCompanies.sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'industry') {
      return a.industry.localeCompare(b.industry);
    } else if (sortBy === 'employees') {
      return (b.employeeCount || 0) - (a.employeeCount || 0);
    } else if (sortBy === 'revenue') {
      return (b.annualRevenue || 0) - (a.annualRevenue || 0);
    }
    return 0;
  });

  const getCompanyContactCount = (companyId) => {
    return contacts.filter(c => c.companyId === companyId).length;
  };

  const getCompanyDealValue = (companyId) => {
    const companyContactIds = contacts.filter(c => c.companyId === companyId).map(c => c.Id);
    const companyDeals = deals.filter(d => companyContactIds.includes(d.contactId));
    return companyDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  };

  const totalContactCount = contacts.length;
  const totalDealValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Companies</h1>
        <p className="text-gray-600">Manage your company profiles and relationships</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          label="Total Companies"
          value={companies.length}
          icon="Building2"
        />
        <MetricCard
          label="Total Contacts"
          value={totalContactCount}
          icon="Users"
        />
        <MetricCard
          label="Total Deal Value"
          value={`$${(totalDealValue / 1000).toFixed(0)}K`}
          icon="DollarSign"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
          >
            <option value="all">All Industries</option>
            {industries.filter(i => i !== 'all').map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </Select>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="industry">Sort by Industry</option>
            <option value="employees">Sort by Employees</option>
            <option value="revenue">Sort by Revenue</option>
          </Select>
        </div>
      </div>

      {filteredCompanies.length === 0 ? (
        <Empty
          message="No companies found"
          description="Try adjusting your search or filters"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map(company => (
            <CompanyCard
              key={company.Id}
              company={company}
              contactCount={getCompanyContactCount(company.Id)}
              dealValue={getCompanyDealValue(company.Id)}
              onClick={() => handleCompanyClick(company.Id)}
            />
          ))}
        </div>
      )}

      <CompanyForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default Companies;