import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { leadService } from "@/services/api/leadService";
import LeadCard from "@/components/molecules/LeadCard";
import LeadForm from "@/components/organisms/LeadForm";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

const statusOptions = [
    { value: "All", label: "All Status" },
    { value: "New", label: "New" },
    { value: "Qualified", label: "Qualified" },
    { value: "Proposal", label: "Proposal" },
    { value: "Negotiation", label: "Negotiation" },
    { value: "Won", label: "Won" },
    { value: "Lost", label: "Lost" }
  ];

  const loadLeads = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await leadService.getAll();
      setLeads(data);
      setFilteredLeads(data);
    } catch (err) {
      setError("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    const handleAddButtonClick = () => {
      setIsFormOpen(true);
    };

    window.addEventListener("addButtonClick", handleAddButtonClick);
    return () => window.removeEventListener("addButtonClick", handleAddButtonClick);
  }, []);

  useEffect(() => {
    let filtered = leads.filter(lead => 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (statusFilter !== "All") {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    setFilteredLeads(filtered);
  }, [searchTerm, statusFilter, leads]);

  const handleEdit = (lead) => {
    setEditingLead(lead);
    setIsFormOpen(true);
  };

  const handleDelete = async (leadId) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) {
      return;
    }

    try {
      await leadService.delete(leadId);
      toast.success("Lead deleted successfully!");
      loadLeads();
    } catch (error) {
      toast.error("Failed to delete lead");
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingLead(null);
  };

  const handleFormSuccess = () => {
    loadLeads();
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadLeads} />;

  return (
    <div className="p-6">
      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Leads Grid */}
      {filteredLeads.length === 0 && searchTerm === "" && statusFilter === "All" ? (
        <Empty
          title="No leads yet"
          description="Start tracking your potential customers by adding your first lead"
          actionText="Add Lead"
          onAction={() => setIsFormOpen(true)}
          icon="Target"
        />
      ) : filteredLeads.length === 0 ? (
        <Empty
          title="No leads found"
          description="No leads match your current filters. Try adjusting your search or filter criteria."
          icon="Search"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map((lead) => (
            <LeadCard
              key={lead.Id}
              lead={lead}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Lead Form Modal */}
      <LeadForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        lead={editingLead}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default Leads;