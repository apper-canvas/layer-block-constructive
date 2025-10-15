import React, { useState, useEffect } from "react";
import Modal from "@/components/molecules/Modal";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import ApperIcon from "@/components/ApperIcon";
import { emailTemplateService } from "@/services/api/emailTemplateService";

const EmailComposer = ({ isOpen, onClose, onSend, recipientEmail, recipientName }) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const data = await emailTemplateService.getAll();
        setTemplates(data);
      } catch (error) {
        console.error("Failed to load email templates:", error);
      }
    };
    
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const handleTemplateChange = async (templateId) => {
    setSelectedTemplate(templateId);
    if (templateId) {
      try {
        const template = await emailTemplateService.getById(parseInt(templateId));
        if (template) {
          setSubject(template.subject);
          setMessage(template.body.replace("[Contact Name]", recipientName || "there"));
        }
      } catch (error) {
        console.error("Failed to load template:", error);
      }
    } else {
      setSubject("");
      setMessage("");
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onSend({ subject, message });
      setSubject("");
      setMessage("");
      setSelectedTemplate("");
    } catch (error) {
      console.error("Failed to send email:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubject("");
    setMessage("");
    setSelectedTemplate("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Compose Email" size="lg">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To
          </label>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">
            <ApperIcon name="User" size={16} className="text-gray-500" />
            <span className="text-sm text-gray-700">{recipientName}</span>
            <span className="text-sm text-gray-500">({recipientEmail})</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Template (Optional)
          </label>
          <Select
            value={selectedTemplate}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="w-full"
          >
            <option value="">Select a template...</option>
            {templates.map((template) => (
              <option key={template.Id} value={template.Id}>
                {template.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message..."
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={loading || !subject.trim() || !message.trim()}
            icon={loading ? undefined : "Send"}
          >
            {loading ? "Sending..." : "Send Email"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EmailComposer;