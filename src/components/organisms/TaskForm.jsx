import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Modal from "@/components/molecules/Modal";
import { taskService } from "@/services/api/taskService";
import { contactService } from "@/services/api/contactService";
import { leadService } from "@/services/api/leadService";

function TaskForm({ isOpen, onClose, task = null, onSuccess, prefilledEntity = null }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    entityType: "",
    entityId: ""
  });
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [entityOptions, setEntityOptions] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadEntities();
      
      if (task) {
        // Editing existing task
        setFormData({
          title: task.title,
          description: task.description || "",
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : "",
          priority: task.priority,
          entityType: task.entityType || "",
          entityId: task.entityId?.toString() || ""
        });
      } else if (prefilledEntity) {
        // Creating new task with prefilled entity
        setFormData({
          title: "",
          description: "",
          dueDate: "",
          priority: "medium",
          entityType: prefilledEntity.type,
          entityId: prefilledEntity.id.toString()
        });
      } else {
        // Creating new task without prefill
        setFormData({
          title: "",
          description: "",
          dueDate: "",
          priority: "medium",
          entityType: "",
          entityId: ""
        });
      }
    }
  }, [isOpen, task, prefilledEntity]);

  async function loadEntities() {
    try {
      const [contactsData, leadsData] = await Promise.all([
        contactService.getAll(),
        leadService.getAll()
      ]);
      setContacts(contactsData);
      setLeads(leadsData);
    } catch (error) {
      toast.error("Failed to load contacts and leads");
    }
  }

  useEffect(() => {
    // Update entity options when entityType changes
    if (formData.entityType === "contact") {
      setEntityOptions(
        contacts.map(c => ({ value: c.Id.toString(), label: c.name }))
      );
    } else if (formData.entityType === "lead") {
      setEntityOptions(
        leads.map(l => ({ value: l.Id.toString(), label: l.companyName }))
      );
    } else {
      setEntityOptions([]);
    }
  }, [formData.entityType, contacts, leads]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset entityId when entityType changes
    if (name === "entityType") {
      setFormData(prev => ({
        ...prev,
        entityId: ""
      }));
    }
  }

  function validateForm() {
    if (!formData.title.trim()) {
      toast.error("Task title is required");
      return false;
    }
    if (!formData.dueDate) {
      toast.error("Due date is required");
      return false;
    }
    if (formData.entityType && !formData.entityId) {
      toast.error("Please select a contact or lead");
      return false;
    }
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        dueDate: new Date(formData.dueDate).toISOString(),
        priority: formData.priority,
        entityType: formData.entityType || null,
        entityId: formData.entityId ? parseInt(formData.entityId, 10) : null,
        entityName: formData.entityId ? getEntityName() : null
      };

      if (task) {
        await taskService.update(task.Id, taskData);
        toast.success("Task updated successfully");
      } else {
        await taskService.create(taskData);
        toast.success("Task created successfully");
      }

      onSuccess();
      handleClose();
    } catch (error) {
      toast.error(task ? "Failed to update task" : "Failed to create task");
    } finally {
      setLoading(false);
    }
  }

  function getEntityName() {
    if (!formData.entityId) return null;
    
    if (formData.entityType === "contact") {
      const contact = contacts.find(c => c.Id.toString() === formData.entityId);
      return contact ? contact.name : null;
    } else if (formData.entityType === "lead") {
      const lead = leads.find(l => l.Id.toString() === formData.entityId);
      return lead ? lead.companyName : null;
    }
    return null;
  }

  function handleClose() {
    setFormData({
      title: "",
      description: "",
      dueDate: "",
      priority: "medium",
      entityType: "",
      entityId: ""
    });
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={task ? "Edit Task" : "Create New Task"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter task title"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter task description (optional)"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Due Date"
            name="dueDate"
            type="datetime-local"
            value={formData.dueDate}
            onChange={handleChange}
            required
          />

          <Select
            label="Priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" }
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Related To"
            name="entityType"
            value={formData.entityType}
            onChange={handleChange}
            options={[
              { value: "", label: "None" },
              { value: "contact", label: "Contact" },
              { value: "lead", label: "Lead" }
            ]}
            disabled={!!prefilledEntity}
          />

          {formData.entityType && (
            <Select
              label={formData.entityType === "contact" ? "Select Contact" : "Select Lead"}
              name="entityId"
              value={formData.entityId}
              onChange={handleChange}
              options={entityOptions}
              disabled={!!prefilledEntity}
            />
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {task ? "Update Task" : "Create Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default TaskForm;