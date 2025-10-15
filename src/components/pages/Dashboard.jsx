import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { contactService } from "@/services/api/contactService";
import { leadService } from "@/services/api/leadService";
import { dealService } from "@/services/api/dealService";
import { companyService } from "@/services/api/companyService";
import { activityService } from "@/services/api/activityService";
import Chart from "react-apexcharts";
import { addDays, format, isAfter, isBefore, isPast } from "date-fns";
import { taskService } from "@/services/api/taskService";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Leads from "@/components/pages/Leads";
import Deals from "@/components/pages/Deals";
import MetricCard from "@/components/molecules/MetricCard";
const Dashboard = () => {
const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [leads, setLeads] = useState([]);
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [contactsData, companiesData, leadsData, dealsData, tasksData] = await Promise.all([
        contactService.getAll(),
        companyService.getAll(),
        leadService.getAll(),
        dealService.getAll(),
        taskService.getAll()
      ]);
      
      // Aggregate activities from contacts and leads
      const contactActivities = contactsData.flatMap(contact => 
        (contact.activities || []).map(activity => ({
          ...activity,
          entityType: 'contact',
          entityId: contact.Id,
          entityName: contact.name
        }))
      );
      
      const leadActivities = leadsData.flatMap(lead => 
        (lead.activities || []).map(activity => ({
          ...activity,
          entityType: 'lead',
          entityId: lead.Id,
          entityName: lead.name
        }))
      );
      
      const allActivities = [...contactActivities, ...leadActivities];
      
      setContacts(contactsData);
      setCompanies(companiesData);
      setLeads(leadsData);
      setDeals(dealsData);
      setActivities(allActivities);
      setTasks(tasksData);
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

  const totalDealValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  const activeDealValue = deals
    .filter(deal => deal.stage !== "Won" && deal.stage !== "Lost")
    .reduce((sum, deal) => sum + (deal.value || 0), 0);
  
  const dealStageCounts = deals.reduce((acc, deal) => {
    acc[deal.stage] = (acc[deal.stage] || 0) + 1;
    return acc;
  }, {});

  const recentActivities = activities
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const today = new Date();
  const upcomingFollowUps = activities
    .filter(activity => {
      const activityDate = new Date(activity.date);
      return isAfter(activityDate, today) && isBefore(activityDate, addDays(today, 7));
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
.slice(0, 5);

  // Get overdue tasks
  const overdueTasks = tasks
    .filter(task => !task.completed && isPast(new Date(task.dueDate)))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  async function handleMarkTaskComplete(taskId) {
    try {
      await taskService.markComplete(taskId);
      toast.success("Task marked as complete");
      loadData();
    } catch (error) {
      toast.error("Failed to complete task");
    }
  }

  const chartOptions = {
    chart: {
      type: "donut",
      toolbar: { show: false }
    },
    labels: Object.keys(leadStatusCounts),
    colors: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#10b981", "#6b7280"],
    legend: {
      position: "bottom",
      horizontalAlign: "center"
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Leads",
              fontSize: "16px",
              fontWeight: 600
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val) {
        return val.toFixed(0) + "%";
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 300
        },
        legend: {
          position: "bottom"
        }
      }
    }]
  };

  const chartSeries = Object.values(leadStatusCounts);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <MetricCard
          label="Total Companies"
          value={companies.length}
          icon="Building2"
        />
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
          label="Total Deal Value"
          value={`$${(totalDealValue / 1000).toFixed(0)}K`}
          icon="DollarSign"
        />
        <MetricCard
          label="Active Pipeline"
          value={`$${(activeDealValue / 1000).toFixed(0)}K`}
          icon="TrendingUp"
        />
      </div>
      {/* Charts and Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leads by Status</h3>
          {leads.length > 0 ? (
            <Chart
              options={chartOptions}
              series={chartSeries}
              type="donut"
              height={320}
            />
          ) : (
            <div className="h-[320px] flex items-center justify-center text-gray-400">
              No leads data available
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Deal Pipeline Progress</h3>
          <div className="space-y-4">
            {Object.entries(dealStageCounts).map(([stage, count]) => {
              const percentage = deals.length > 0 ? (count / deals.length) * 100 : 0;
              const stageColors = {
                "Prospecting": "from-blue-400 to-blue-600",
                "Qualification": "from-green-400 to-green-600",
                "Proposal": "from-purple-400 to-purple-600",
                "Negotiation": "from-orange-400 to-orange-600",
                "Won": "from-emerald-400 to-emerald-600",
                "Lost": "from-gray-400 to-gray-600"
              };
              
              return (
                <div key={stage} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 font-medium">{stage}</span>
                    <span className="font-semibold text-gray-900">{count} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-3 rounded-full bg-gradient-to-r ${stageColors[stage]} transition-all duration-500 ease-out`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activities & Upcoming Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
            <ApperIcon name="Activity" size={20} className="text-gray-400" />
          </div>
          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.Id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <ApperIcon 
                        name={activity.type === "Call" ? "Phone" : activity.type === "Email" ? "Mail" : "MessageSquare"} 
                        size={16} 
                        className="text-blue-600" 
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.type} • {format(new Date(activity.date), "MMM d, yyyy")}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No recent activities</p>
            )}
          </div>
        </div>

<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Overdue Tasks</h3>
            <button
              onClick={() => navigate("/tasks")}
              className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
            >
              View All
              <ApperIcon name="ArrowRight" size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {overdueTasks.length > 0 ? (
              overdueTasks.map((task) => (
                <div key={task.Id} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <button
                    onClick={() => handleMarkTaskComplete(task.Id)}
                    className="flex-shrink-0 w-5 h-5 rounded border-2 border-red-400 flex items-center justify-center transition-all mt-0.5 hover:bg-red-400 hover:border-red-500"
                  >
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-red-600 font-medium">
                        Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                      </p>
                      {task.entityName && (
                        <>
                          <span className="text-xs text-gray-400">•</span>
                          <p className="text-xs text-gray-600">{task.entityName}</p>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <ApperIcon name="CheckCircle2" size={48} className="text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">All caught up!</p>
                <p className="text-xs text-gray-400 mt-1">No overdue tasks</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Indicators</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <ApperIcon name="TrendingUp" size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                  <p className="text-xl font-bold text-blue-700">
                    {leads.length > 0 ? (((leadStatusCounts.Qualified || 0) + (leadStatusCounts.Proposal || 0) + (leadStatusCounts.Negotiation || 0) + (leadStatusCounts.Won || 0)) / leads.length * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <ApperIcon name="DollarSign" size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Deal Size</p>
                  <p className="text-xl font-bold text-green-700">
                    ${deals.length > 0 ? (totalDealValue / deals.length / 1000).toFixed(1) : 0}K
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                  <ApperIcon name="Target" size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Win Rate</p>
                  <p className="text-xl font-bold text-purple-700">
                    {deals.length > 0 ? ((dealStageCounts.Won || 0) / deals.length * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                  <ApperIcon name="Handshake" size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Deals</p>
                  <p className="text-xl font-bold text-orange-700">
                    {deals.filter(d => d.stage !== "Won" && d.stage !== "Lost").length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Quality Metrics</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Qualified Leads</span>
                <span className="font-semibold text-green-600">
                  {leadStatusCounts.Qualified || 0} ({leads.length > 0 ? ((leadStatusCounts.Qualified || 0) / leads.length * 100).toFixed(0) : 0}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                  style={{ width: `${leads.length > 0 ? ((leadStatusCounts.Qualified || 0) / leads.length * 100) : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">In Proposal</span>
                <span className="font-semibold text-purple-600">
                  {leadStatusCounts.Proposal || 0} ({leads.length > 0 ? ((leadStatusCounts.Proposal || 0) / leads.length * 100).toFixed(0) : 0}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-3 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-500"
                  style={{ width: `${leads.length > 0 ? ((leadStatusCounts.Proposal || 0) / leads.length * 100) : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Negotiating</span>
                <span className="font-semibold text-orange-600">
                  {leadStatusCounts.Negotiation || 0} ({leads.length > 0 ? ((leadStatusCounts.Negotiation || 0) / leads.length * 100).toFixed(0) : 0}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-3 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500"
                  style={{ width: `${leads.length > 0 ? ((leadStatusCounts.Negotiation || 0) / leads.length * 100) : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">New Leads</span>
                <span className="font-semibold text-blue-600">
                  {leadStatusCounts.New || 0} ({leads.length > 0 ? ((leadStatusCounts.New || 0) / leads.length * 100).toFixed(0) : 0}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                  style={{ width: `${leads.length > 0 ? ((leadStatusCounts.New || 0) / leads.length * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;