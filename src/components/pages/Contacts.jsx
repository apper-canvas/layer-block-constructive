import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { contactService } from "@/services/api/contactService";
import ContactCard from "@/components/molecules/ContactCard";
import ContactForm from "@/components/organisms/ContactForm";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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
    const filtered = contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredContacts(filtered);
  }, [searchTerm, contacts]);

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setIsFormOpen(true);
  };

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
    setEditingContact(null);
  };

  const handleFormSuccess = () => {
    loadContacts();
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadContacts} />;

  return (
    <div className="p-6">
      {/* Search and Filters */}
      <div className="mb-6">
        <div className="max-w-md">
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Contacts Grid */}
      {filteredContacts.length === 0 && searchTerm === "" ? (
        <Empty
          title="No contacts yet"
          description="Start building your contact list by adding your first contact"
          actionText="Add Contact"
          onAction={() => setIsFormOpen(true)}
          icon="Users"
        />
      ) : filteredContacts.length === 0 && searchTerm !== "" ? (
        <Empty
          title="No contacts found"
          description={`No contacts match "${searchTerm}". Try a different search term.`}
          icon="Search"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact) => (
            <ContactCard
              key={contact.Id}
              contact={contact}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Contact Form Modal */}
      <ContactForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        contact={editingContact}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default Contacts;