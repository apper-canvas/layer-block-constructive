import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { contactService } from "@/services/api/contactService";
import { useNavigate } from "react-router-dom";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Input from "@/components/atoms/Input";
import ContactCard from "@/components/molecules/ContactCard";
import ContactForm from "@/components/organisms/ContactForm";
const Contacts = () => {
const navigate = useNavigate();
const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const typeOptions = [
    { value: "All", label: "All Types" },
    { value: "Lead", label: "Lead" },
    { value: "Customer", label: "Customer" },
    { value: "Partner", label: "Partner" }
  ];
  const loadContacts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await contactService.getAll();
      setContacts(data);
      setFilteredContacts(data);
    } catch (err) {
      setError("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    const handleAddButtonClick = () => {
      setIsFormOpen(true);
    };

    window.addEventListener("addButtonClick", handleAddButtonClick);
    return () => window.removeEventListener("addButtonClick", handleAddButtonClick);
}, []);

  useEffect(() => {
let filtered = contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (typeFilter !== "All") {
      filtered = filtered.filter(contact => contact.type === typeFilter);
    }

    setFilteredContacts(filtered);
  }, [searchTerm, typeFilter, contacts]);


  const handleDelete = async (contactId) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) {
      return;
    }

    try {
      await contactService.delete(contactId);
      toast.success("Contact deleted successfully!");
      loadContacts();
    } catch (error) {
      toast.error("Failed to delete contact");
    }
  };

const handleFormClose = () => {
    setIsFormOpen(false);
  };

  const handleFormSuccess = () => {
    loadContacts();
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadContacts} />;

return (
    <div className="p-6">
      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {typeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Contacts Grid */}
{filteredContacts.length === 0 && searchTerm === "" && typeFilter === "All" ? (
        <Empty
          title="No contacts yet"
          description="Start building your contact list by adding your first contact"
          actionText="Add Contact"
          onAction={() => setIsFormOpen(true)}
          icon="Users"
        />
      ) : filteredContacts.length === 0 ? (
        <Empty
          title="No contacts found"
          description="No contacts match your current filters. Try adjusting your search or filter criteria."
          icon="Search"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact) => (
            <ContactCard
              key={contact.Id}
              contact={contact}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

{/* Contact Form Modal */}
      <ContactForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default Contacts;