import { useState, useEffect } from "react";
import { contactService } from "@/services/api/contactService";
import { leadService } from "@/services/api/leadService";
import MetricCard from "@/components/molecules/MetricCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";

const Dashboard = () => {
  const [contacts, setContacts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [contactsData, leadsData] = await Promise.all([
        contactService.getAll(),
        leadService.getAll()
      ]);
      
      setContacts(contactsData);
      setLeads(leadsData);
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  const leadStatusCounts = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome to CRM Pro</h1>
              <p className="text-blue-100">
                Manage your contacts and track your leads all in one place
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 rounded-xl p-4">
                <ApperIcon name="Building2" size={48} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          label="Total Contacts"
          value={contacts.length}
          icon="Users"
        />
        <MetricCard
          label="Total Leads"
          value={leads.length}
          icon="Target"
        />
        <MetricCard
          label="Qualified Leads"
          value={leadStatusCounts.Qualified || 0}
          icon="CheckCircle"
        />
        <MetricCard
          label="New Leads"
          value={leadStatusCounts.New || 0}
          icon="PlusCircle"
        />
      </div>

      {/* Lead Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Status Overview</h3>
          <div className="space-y-4">
            {Object.entries(leadStatusCounts).map(([status, count]) => {
              const percentage = leads.length > 0 ? (count / leads.length) * 100 : 0;
const statusColors = {
                "New": "bg-blue-500",
                "Qualified": "bg-green-500",
                "Proposal": "bg-purple-500",
                "Negotiation": "bg-orange-500",
                "Won": "bg-emerald-500",
                "Lost": "bg-gray-500"
              };
              
              return (
                <div key={status} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{status}</span>
                    <span className="font-medium">{count} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${statusColors[status]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-4">
<div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <ApperIcon name="TrendingUp" size={20} className="text-blue-600" />
                <span className="text-gray-700">Conversion Rate</span>
              </div>
              <span className="font-semibold text-blue-600">
                {leads.length > 0 ? (((leadStatusCounts.Qualified || 0) + (leadStatusCounts.Proposal || 0) + (leadStatusCounts.Negotiation || 0) + (leadStatusCounts.Won || 0)) / leads.length * 100).toFixed(0) : 0}%
              </span>
            </div>
            
<div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <ApperIcon name="FileText" size={20} className="text-purple-600" />
                <span className="text-gray-700">In Proposal</span>
              </div>
              <span className="font-semibold text-purple-600">
                {leadStatusCounts.Proposal || 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <ApperIcon name="Handshake" size={20} className="text-orange-600" />
                <span className="text-gray-700">Negotiating</span>
              </div>
              <span className="font-semibold text-orange-600">
                {leadStatusCounts.Negotiation || 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <ApperIcon name="Users" size={20} className="text-gray-600" />
                <span className="text-gray-700">Total Records</span>
              </div>
              <span className="font-semibold text-gray-600">
                {contacts.length + leads.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;