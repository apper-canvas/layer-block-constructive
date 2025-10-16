import { useState } from "react";
import Error from "@/components/ui/Error";
import TaskForm from "@/components/organisms/TaskForm";
// Activity service handles activity CRUD operations for contacts and leads
// Activities are stored within the parent entity (contact/lead) in mock data

const activityService = {
  // Get all activities for a specific entity (contact or lead)
  getActivitiesByEntityId: async (entityType, entityId) => {
    try {
      const service = entityType === 'contact' 
        ? (await import('./contactService')).contactService 
        : (await import('./leadService')).leadService;
      
      const entity = await service.getById(parseInt(entityId));
      return entity?.activities || [];
    } catch (error) {
      console.error(`Failed to load activities for ${entityType} ${entityId}:`, error);
      throw new Error(`Failed to load activities`);
    }
  },

  // Create a new activity for an entity
  create: async (entityType, entityId, activityData) => {
    try {
      const service = entityType === 'contact' 
        ? (await import('./contactService')).contactService 
        : (await import('./leadService')).leadService;
      
      const entity = await service.getById(parseInt(entityId));
      if (!entity) {
        throw new Error(`${entityType} not found`);
      }

      const activities = entity.activities || [];
      const highestId = activities.length > 0 
        ? Math.max(...activities.map(a => a.Id)) 
        : 0;

const newActivity = {
        Id: highestId + 1,
        type: activityData.type,
        date: activityData.date,
        notes: activityData.notes || "",
        contactId_c: activityData.contactId_c,
        dealId_c: activityData.dealId_c,
      };

      const updatedActivities = [...activities, newActivity];
      await service.update(parseInt(entityId), { activities: updatedActivities });

      return newActivity;
    } catch (error) {
      console.error(`Failed to create activity for ${entityType} ${entityId}:`, error);
      throw new Error(`Failed to create activity`);
    }
  },

  // Update an existing activity
  update: async (entityType, entityId, activityId, activityData) => {
    try {
      const service = entityType === 'contact' 
        ? (await import('./contactService')).contactService 
        : (await import('./leadService')).leadService;
      
      const entity = await service.getById(parseInt(entityId));
      if (!entity) {
        throw new Error(`${entityType} not found`);
      }

      const activities = entity.activities || [];
      const activityIndex = activities.findIndex(a => a.Id === parseInt(activityId));
      
      if (activityIndex === -1) {
        throw new Error('Activity not found');
      }

      activities[activityIndex] = {
        ...activities[activityIndex],
        ...activityData
      };

      await service.update(parseInt(entityId), { activities });
      return activities[activityIndex];
    } catch (error) {
      console.error(`Failed to update activity for ${entityType} ${entityId}:`, error);
      throw new Error(`Failed to update activity`);
    }
  },

  // Delete an activity
  delete: async (entityType, entityId, activityId) => {
    try {
      const service = entityType === 'contact' 
        ? (await import('./contactService')).contactService 
        : (await import('./leadService')).leadService;
      
      const entity = await service.getById(parseInt(entityId));
      if (!entity) {
        throw new Error(`${entityType} not found`);
      }

      const activities = entity.activities || [];
      const updatedActivities = activities.filter(a => a.Id !== parseInt(activityId));

      await service.update(parseInt(entityId), { activities: updatedActivities });
      return true;
    } catch (error) {
      console.error(`Failed to delete activity for ${entityType} ${entityId}:`, error);
      throw new Error(`Failed to delete activity`);
    }
  }
};

export { activityService };