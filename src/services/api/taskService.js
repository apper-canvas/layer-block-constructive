import { getApperClient } from "@/services/apperClient";
// Task service handles task CRUD operations with ApperClient
// Tasks can be associated with contacts or leads for follow-up reminders

// Utility function for realistic delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Table name from database schema
const TABLE_NAME = 'task_c';

// Get all tasks
export async function getAllTasks() {
  try {
    await delay(300);
    
    const apperClient = getApperClient();
    if (!apperClient) {
      console.error('ApperClient not initialized');
      return [];
    }

    const params = {
      fields: [
        { field: { Name: "Id" } },
        { field: { Name: "title_c" } },
        { field: { Name: "description_c" } },
        { field: { Name: "priority_c" } },
        { field: { Name: "due_date_c" } },
        { field: { Name: "entity_type_c" } },
        { field: { Name: "entity_id_c" } },
        { field: { Name: "entity_name_c" } },
        { field: { Name: "completed_c" } },
        { field: { Name: "completed_at_c" } }
      ],
      pagingInfo: {
        limit: 100,
        offset: 0
      }
    };

    const response = await apperClient.fetchRecords(TABLE_NAME, params);

    if (!response.success) {
      console.error('Error fetching tasks:', response.message);
      return [];
    }

    return response.data || [];
  } catch (error) {
    console.error('Error in getAllTasks:', error?.response?.data?.message || error.message);
    return [];
  }
}

// Get task by ID
export async function getTaskById(id) {
  try {
    await delay(200);
    
    const apperClient = getApperClient();
    if (!apperClient) {
      console.error('ApperClient not initialized');
      return null;
    }

    const params = {
      fields: [
        { field: { Name: "Id" } },
        { field: { Name: "title_c" } },
        { field: { Name: "description_c" } },
        { field: { Name: "priority_c" } },
        { field: { Name: "due_date_c" } },
        { field: { Name: "entity_type_c" } },
        { field: { Name: "entity_id_c" } },
        { field: { Name: "entity_name_c" } },
        { field: { Name: "completed_c" } },
        { field: { Name: "completed_at_c" } }
      ]
    };

    const response = await apperClient.getRecordById(TABLE_NAME, id, params);

    if (!response.success) {
      console.error(`Error fetching task ${id}:`, response.message);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`Error in getTaskById(${id}):`, error?.response?.data?.message || error.message);
    return null;
  }
}

// Create new task
export async function createTask(taskData) {
  try {
    await delay(400);
    
    const apperClient = getApperClient();
    if (!apperClient) {
      console.error('ApperClient not initialized');
      return null;
    }

    // Only include Updateable fields
    const params = {
      records: [{
        title_c: taskData.title_c || taskData.title,
        description_c: taskData.description_c || taskData.description || '',
        priority_c: taskData.priority_c || taskData.priority || 'medium',
        due_date_c: taskData.due_date_c || taskData.dueDate || taskData.due_date,
        entity_type_c: taskData.entity_type_c || taskData.entityType || '',
        entity_id_c: taskData.entity_id_c || taskData.entityId || null,
        entity_name_c: taskData.entity_name_c || taskData.entityName || '',
        completed_c: taskData.completed_c !== undefined ? taskData.completed_c : (taskData.completed || false)
      }]
    };

    const response = await apperClient.createRecord(TABLE_NAME, params);

    if (!response.success) {
      console.error('Error creating task:', response.message);
      return null;
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        return result.data;
      } else {
        console.error('Task creation failed:', result.message);
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error('Error in createTask:', error?.response?.data?.message || error.message);
    return null;
  }
}

// Update task
export async function updateTask(id, taskData) {
  try {
    await delay(400);
    
    const apperClient = getApperClient();
    if (!apperClient) {
      console.error('ApperClient not initialized');
      return null;
    }

    // Only include Updateable fields that are provided
    const updateFields = {
      Id: parseInt(id)
    };

    if (taskData.title_c !== undefined || taskData.title !== undefined) {
      updateFields.title_c = taskData.title_c || taskData.title;
    }
    if (taskData.description_c !== undefined || taskData.description !== undefined) {
      updateFields.description_c = taskData.description_c || taskData.description;
    }
    if (taskData.priority_c !== undefined || taskData.priority !== undefined) {
      updateFields.priority_c = taskData.priority_c || taskData.priority;
    }
    if (taskData.due_date_c !== undefined || taskData.dueDate !== undefined || taskData.due_date !== undefined) {
      updateFields.due_date_c = taskData.due_date_c || taskData.dueDate || taskData.due_date;
    }
    if (taskData.entity_type_c !== undefined || taskData.entityType !== undefined) {
      updateFields.entity_type_c = taskData.entity_type_c || taskData.entityType;
    }
    if (taskData.entity_id_c !== undefined || taskData.entityId !== undefined) {
      updateFields.entity_id_c = taskData.entity_id_c || taskData.entityId;
    }
    if (taskData.entity_name_c !== undefined || taskData.entityName !== undefined) {
      updateFields.entity_name_c = taskData.entity_name_c || taskData.entityName;
    }
    if (taskData.completed_c !== undefined || taskData.completed !== undefined) {
      updateFields.completed_c = taskData.completed_c !== undefined ? taskData.completed_c : taskData.completed;
      if (updateFields.completed_c) {
        updateFields.completed_at_c = new Date().toISOString();
      }
    }

    const params = {
      records: [updateFields]
    };

    const response = await apperClient.updateRecord(TABLE_NAME, params);

    if (!response.success) {
      console.error(`Error updating task ${id}:`, response.message);
      return null;
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        return result.data;
      } else {
        console.error('Task update failed:', result.message);
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error(`Error in updateTask(${id}):`, error?.response?.data?.message || error.message);
    return null;
  }
}

// Delete task
export async function deleteTask(id) {
  try {
    await delay(300);
    
    const apperClient = getApperClient();
    if (!apperClient) {
      console.error('ApperClient not initialized');
      return false;
    }

    const params = {
      RecordIds: [parseInt(id)]
    };

    const response = await apperClient.deleteRecord(TABLE_NAME, params);

    if (!response.success) {
      console.error(`Error deleting task ${id}:`, response.message);
      return false;
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      return result.success;
    }

    return false;
  } catch (error) {
    console.error(`Error in deleteTask(${id}):`, error?.response?.data?.message || error.message);
    return false;
  }
}

export const taskService = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};