import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { dealService } from "@/services/api/dealService";
import DealCard from "@/components/molecules/DealCard";
import KanbanColumn from "@/components/molecules/KanbanColumn";
import KanbanCard from "@/components/molecules/KanbanCard";
import DealForm from "@/components/organisms/DealForm";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
const Deals = () => {
const [deals, setDeals] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [draggedDeal, setDraggedDeal] = useState(null);
  useEffect(() => {
    loadDeals();
    
    const handleAddButton = () => {
      setSelectedDeal(null);
      setIsFormOpen(true);
    };
    
    window.addEventListener("addButtonClick", handleAddButton);
    return () => window.removeEventListener("addButtonClick", handleAddButton);
  }, []);

  useEffect(() => {
    let filtered = [...deals];
    
    if (searchTerm) {
      filtered = filtered.filter(deal =>
        deal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (stageFilter !== "all") {
      filtered = filtered.filter(deal => deal.stage === stageFilter);
    }
    
    setFilteredDeals(filtered);
  }, [deals, searchTerm, stageFilter]);

  async function loadDeals() {
    try {
      setLoading(true);
      setError(null);
      const data = await dealService.getAll();
      setDeals(data);
      setFilteredDeals(data);
    } catch (err) {
      setError(err.message || "Failed to load deals");
      toast.error("Failed to load deals");
    } finally {
      setLoading(false);
    }
  }

function handleEdit(deal) {
    setSelectedDeal(deal);
    setIsFormOpen(true);
  }

  async function handleDelete(dealId) {
    if (!confirm("Are you sure you want to delete this deal?")) return;
    
    try {
      await dealService.delete(dealId);
      setDeals(prev => prev.filter(d => d.Id !== dealId));
      toast.success("Deal deleted successfully");
    } catch (err) {
      toast.error("Failed to delete deal");
    }
  }

  async function handleDragDrop(dealId, newStage) {
    try {
      const deal = deals.find(d => d.Id === dealId);
      if (!deal || deal.stage === newStage) return;
      
      await dealService.update(dealId, { stage: newStage });
      setDeals(prev => prev.map(d => 
        d.Id === dealId ? { ...d, stage: newStage } : d
      ));
      toast.success(`Deal moved to ${newStage}`);
    } catch (err) {
      toast.error("Failed to update deal stage");
    }
  }

  function handleFormClose() {
    setIsFormOpen(false);
    setSelectedDeal(null);
  }

  function handleFormSuccess() {
    loadDeals();
    handleFormClose();
  }

  const stages = ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
  
  function getStageDeals(stage) {
    return filteredDeals.filter(deal => deal.stage === stage);
  }
  
  function getStageTotalValue(stage) {
    return getStageDeals(stage).reduce((sum, deal) => sum + (deal.value || 0), 0);
  }

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadDeals} />;
  }

return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Deals</h1>
          <p className="text-gray-600">Track and manage your sales opportunities</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
            className="flex items-center gap-2"
          >
            <ApperIcon name="List" size={16} />
            List
          </Button>
          <Button
            variant={viewMode === "pipeline" ? "default" : "outline"}
            onClick={() => setViewMode("pipeline")}
            className="flex items-center gap-2"
          >
            <ApperIcon name="LayoutGrid" size={16} />
            Pipeline
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search deals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        {viewMode === "list" && (
          <div className="w-full sm:w-48">
            <Select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
            >
              <option value="all">All Stages</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Proposal">Proposal</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Closed Won">Closed Won</option>
              <option value="Closed Lost">Closed Lost</option>
            </Select>
          </div>
        )}
      </div>

      {viewMode === "list" ? (
        filteredDeals.length === 0 ? (
          deals.length === 0 ? (
            <Empty
              title="No deals yet"
              description="Start tracking your sales opportunities by adding your first deal"
              actionText="Add Deal"
              onAction={() => setIsFormOpen(true)}
              icon="Briefcase"
            />
          ) : (
            <Empty
              title="No deals found"
              description="Try adjusting your search or filter criteria"
              icon="Search"
            />
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeals.map(deal => (
              <DealCard
                key={deal.Id}
                deal={deal}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {stages.map(stage => (
              <KanbanColumn
                key={stage}
                stage={stage}
                deals={getStageDeals(stage)}
                totalValue={getStageTotalValue(stage)}
                onDrop={(dealId) => handleDragDrop(dealId, stage)}
                onDragOver={(e) => e.preventDefault()}
              >
                {getStageDeals(stage).map(deal => (
                  <KanbanCard
                    key={deal.Id}
                    deal={deal}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDragStart={() => setDraggedDeal(deal)}
                    onDragEnd={() => setDraggedDeal(null)}
                  />
                ))}
              </KanbanColumn>
            ))}
          </div>
        </div>
      )}

      <DealForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        deal={selectedDeal}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default Deals;