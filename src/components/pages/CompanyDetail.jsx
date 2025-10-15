import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { companyService } from '@/services/api/companyService';
import { contactService } from '@/services/api/contactService';
import { dealService } from '@/services/api/dealService';
import CompanyForm from '@/components/organisms/CompanyForm';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import StatusBadge from '@/components/molecules/StatusBadge';
import { format } from 'date-fns';

const CompanyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [companyData, contactsData, dealsData] = await Promise.all([
        companyService.getById(id),
        companyService.getCompanyContacts(id),
        companyService.getCompanyDeals(id)
      ]);

      if (!companyData) {
        setError('Company not found');
        return;
      }

      setCompany(companyData);
      setContacts(contactsData);
      setDeals(dealsData);

      const allActivities = contactsData.flatMap(contact =>
        (contact.activities || []).map(activity => ({
          ...activity,
          contactName: contact.name,
          contactId: contact.Id
        }))
      );
      allActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
      setActivities(allActivities);
    } catch (err) {
      setError('Failed to load company details');
      toast.error('Failed to load company details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      return;
    }

    try {
      await companyService.delete(id);
      toast.success('Company deleted successfully');
      navigate('/companies');
    } catch (err) {
      toast.error('Failed to delete company');
    }
  };

  const handleEditSuccess = () => {
    loadData();
    setIsEditFormOpen(false);
    toast.success('Company updated successfully');
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!company) return <Error message="Company not found" />;

  const totalDealValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  const activeDeals = deals.filter(deal => deal.status !== 'Won' && deal.status !== 'Lost');
  const wonDeals = deals.filter(deal => deal.status === 'Won');

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/companies')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ApperIcon name="ArrowLeft" size={20} />
          <span className="ml-2">Back to Companies</span>
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.name}</h1>
            <p className="text-gray-600">{company.industry}</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setIsEditFormOpen(true)}
              variant="outline"
            >
              <ApperIcon name="Edit" size={16} />
              <span className="ml-2">Edit</span>
            </Button>
            <Button
              onClick={handleDelete}
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <ApperIcon name="Trash2" size={16} />
              <span className="ml-2">Delete</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Industry</label>
                <p className="text-gray-900">{company.industry}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Employees</label>
                <p className="text-gray-900">{company.employeeCount?.toLocaleString() || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Annual Revenue</label>
                <p className="text-gray-900">
                  {company.annualRevenue ? `$${(company.annualRevenue / 1000000).toFixed(1)}M` : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Website</label>
                {company.website ? (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {company.website}
                  </a>
                ) : (
                  <p className="text-gray-900">N/A</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-900">{company.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{company.email || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500">Address</label>
                <p className="text-gray-900">
                  {company.address ? (
                    <>
                      {company.address}<br />
                      {company.city}, {company.state} {company.zipCode}<br />
                      {company.country}
                    </>
                  ) : (
                    'N/A'
                  )}
                </p>
              </div>
              {company.notes && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <p className="text-gray-900">{company.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Contacts ({contacts.length})</h2>
            {contacts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No contacts associated with this company</p>
            ) : (
              <div className="space-y-3">
                {contacts.map(contact => (
                  <div
                    key={contact.Id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/contacts/${contact.Id}`)}
                  >
                    <div>
                      <p className="font-medium text-gray-900">{contact.name}</p>
                      <p className="text-sm text-gray-500">{contact.email}</p>
                    </div>
                    <ApperIcon name="ChevronRight" size={20} className="text-gray-400" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Deal History ({deals.length})</h2>
            {deals.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No deals associated with this company</p>
            ) : (
              <div className="space-y-3">
                {deals.map(deal => (
                  <div
                    key={deal.Id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/deals/${deal.Id}`)}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{deal.title}</p>
                      <p className="text-sm text-gray-500">${deal.value?.toLocaleString() || 0}</p>
                    </div>
                    <StatusBadge status={deal.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Total Contacts</label>
                <p className="text-2xl font-bold text-gray-900">{contacts.length}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Total Deals</label>
                <p className="text-2xl font-bold text-gray-900">{deals.length}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Total Deal Value</label>
                <p className="text-2xl font-bold text-gray-900">
                  ${(totalDealValue / 1000).toFixed(0)}K
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Active Deals</label>
                <p className="text-2xl font-bold text-gray-900">{activeDeals.length}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Won Deals</label>
                <p className="text-2xl font-bold text-gray-900">{wonDeals.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            {activities.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {activities.slice(0, 10).map((activity, index) => (
                  <div key={index} className="border-l-2 border-primary pl-4">
                    <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.contactName} - {format(new Date(activity.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CompanyForm
        isOpen={isEditFormOpen}
        onClose={() => setIsEditFormOpen(false)}
        onSuccess={handleEditSuccess}
        company={company}
      />
    </div>
  );
};

export default CompanyDetail;