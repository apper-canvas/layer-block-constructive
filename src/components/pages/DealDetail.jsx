import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { dealService } from "@/services/api/dealService";
import { contactService } from "@/services/api/contactService";
import { companyService } from "@/services/api/companyService";
import { activityService } from "@/services/api/activityService";
import { getAll, getById, update } from "@/services/api/taskService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Input from "@/components/atoms/Input";
import ActivityLog from "@/components/molecules/ActivityLog";
import StatusBadge from "@/components/molecules/StatusBadge";
import ActivityForm from "@/components/organisms/ActivityForm";

const DealDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(null);
const [contact, setContact] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDeal, setEditedDeal] = useState(null);
  const [isActivityFormOpen, setIsActivityFormOpen] = useState(false);

  useEffect(() => {
    loadDeal();
    loadActivities();
    loadContacts();
  }, [id]);

  useEffect(() => {
    if (deal?.contactId) {
      loadContact(deal.contactId);
}
  }, [deal?.contactId]);

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    try {
      const companiesData = await companyService.getAll();
      setCompanies(companiesData);
    } catch (err) {
      console.error('Failed to load companies:', err);
    }
  }

  async function loadDeal() {
    try {
      setLoading(true);
      setError(null);
      const data = await dealService.getById(id);
      if (!data) {
        setError("Deal not found");
        return;
      }
      setDeal(data);
      setEditedDeal(data);
    } catch (err) {
      setError(err.message || "Failed to load deal");
      toast.error("Failed to load deal");
    } finally {
      setLoading(false);
    }
  }

  async function loadContact(contactId) {
    try {
      const data = await contactService.getById(contactId);
      setContact(data);
    } catch (err) {
      console.error("Failed to load contact:", err);
    }
  }

async function loadContacts() {
    try {
      const data = await contactService.getAll();
      setContacts(data);
    } catch (err) {
      console.error("Failed to load contacts:", err);
    }
  }

  async function loadActivities() {
    try {
      const data = await activityService.getAll();
      const dealActivities = data.filter(a => a.relatedTo === "deal" && a.relatedId === parseInt(id));
      setActivities(dealActivities);
    } catch (err) {
      console.error("Failed to load activities:", err);
    }
  }

  function handleActivitySuccess() {
    loadActivities();
    setIsActivityFormOpen(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setEditedDeal(prev => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSave() {
    try {
      const updatedData = {
        ...editedDeal,
value: parseFloat(editedDeal.value),
        contactId: parseInt(editedDeal.contactId)
      };
      await dealService.update(id, updatedData);
      setDeal(editedDeal);
      setIsEditing(false);
      toast.success("Deal updated successfully");
      if (editedDeal.contactId !== deal.contactId) {
        loadContact(editedDeal.contactId);
      }
    } catch (err) {
      toast.error("Failed to update deal");
    }
  }

  function handleCancel() {
    setEditedDeal(deal);
    setIsEditing(false);
  }

  function handleAddActivity() {
    setIsActivityFormOpen(true);
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="p-6">
        <Error message={error} onRetry={loadDeal} />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="p-6">
        <Error message="Deal not found" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            icon="ArrowLeft"
            onClick={() => navigate("/deals")}
            className="h-10 w-10 p-0"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{deal.name}</h1>
            <p className="text-gray-600 mt-1">Deal Details</p>
          </div>
        </div>
        {!isEditing && (
          <Button
            icon="Edit2"
            onClick={() => setIsEditing(true)}
          >
            Edit Deal
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Deal Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <StatusBadge status={isEditing ? editedDeal.stage : deal.stage} />
                <span className="text-3xl font-bold text-primary">
                  {formatCurrency(isEditing ? editedDeal.value : deal.value)}
                </span>
              </div>

              {isEditing ? (
                <>
                  <Input
                    label="Deal Name"
                    name="name"
                    value={editedDeal.name}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    label="Deal Value"
                    name="value"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editedDeal.value}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    label="Close Date"
                    name="closeDate"
                    type="date"
                    value={editedDeal.closeDate}
                    onChange={handleChange}
                    required
                  />

                  <Select
                    label="Stage"
                    name="stage"
                    value={editedDeal.stage}
                    onChange={handleChange}
                    required
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Closed Won">Closed Won</option>
                    <option value="Closed Lost">Closed Lost</option>
                  </Select>

                  <Select
                    label="Associated Contact"
                    name="contactId"
                    value={editedDeal.contactId}
                    onChange={handleChange}
required
                  >
                    {contacts.map(c => {
                      const company = companies.find(comp => comp.Id === c.companyId);
                      return (
                        <option key={c.Id} value={c.Id}>
                          {c.name} - {company?.name || 'No Company'}
                        </option>
                      );
                    })}
                  </Select>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={editedDeal.notes}
                      onChange={handleChange}
                      rows={4}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSave} className="flex-1">
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Close Date</p>
                      <p className="font-medium text-gray-900">{formatDate(deal.closeDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Created</p>
                      <p className="font-medium text-gray-900">{formatDate(deal.createdAt)}</p>
                    </div>
                  </div>

                  {deal.notes && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Notes</p>
                      <p className="text-gray-900 whitespace-pre-wrap">{deal.notes}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Activity Log</h2>
              <Button
                size="sm"
                icon="Plus"
                onClick={handleAddActivity}
              >
                Add Activity
              </Button>
            </div>
            <ActivityLog activities={activities} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Associated Contact</h3>
            {contact ? (
              <div 
                onClick={() => navigate(`/contacts/${contact.Id}`)}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary cursor-pointer transition-colors"
              >
                <p className="font-medium text-gray-900 mb-1">{contact.name}</p>
                <p className="text-sm text-gray-600 mb-2">{contact.company}</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ApperIcon name="Mail" size={14} />
                    <span>{contact.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ApperIcon name="Phone" size={14} />
                    <span>{contact.phone}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No contact associated</p>
            )}
</div>
        </div>
      </div>

      <ActivityForm
        isOpen={isActivityFormOpen}
        onClose={() => setIsActivityFormOpen(false)}
        relatedTo="deal"
        relatedId={parseInt(id)}
        onSuccess={handleActivitySuccess}
      />
    </div>
  );
};

export default DealDetail;