// Task service handles task CRUD operations with mock data storage
// Tasks can be associated with contacts or leads for follow-up reminders

import tasksData from '../mockData/tasks.json';

let tasks = [...tasksData];
let nextId = Math.max(...tasks.map(t => t.Id), 0) + 1;

// Get all tasks
export function getAll() {
  return Promise.resolve([...tasks]);
}

// Get task by ID
export function getById(id) {
  const taskId = parseInt(id, 10);
  if (isNaN(taskId)) {
    return Promise.reject(new Error('Invalid task ID'));
  }
  
  const task = tasks.find(t => t.Id === taskId);
  if (!task) {
    return Promise.reject(new Error('Task not found'));
  }
  
  return Promise.resolve({ ...task });
}

// Get tasks by entity (contact or lead)
export function getByEntity(entityType, entityId) {
  const id = parseInt(entityId, 10);
  if (isNaN(id)) {
    return Promise.reject(new Error('Invalid entity ID'));
  }
  
  const entityTasks = tasks.filter(
    t => t.entityType === entityType && t.entityId === id
  );
  
  return Promise.resolve([...entityTasks]);
}

// Get overdue tasks
export function getOverdue() {
  const now = new Date();
  const overdueTasks = tasks.filter(
    t => !t.completed && new Date(t.dueDate) < now
  );
  
  return Promise.resolve([...overdueTasks]);
}

// Get pending tasks
export function getPending() {
  const pendingTasks = tasks.filter(t => !t.completed);
  return Promise.resolve([...pendingTasks]);
}

// Get completed tasks
export function getCompleted() {
  const completedTasks = tasks.filter(t => t.completed);
  return Promise.resolve([...completedTasks]);
}

// Create new task
export function create(taskData) {
  // Ignore any provided Id
  const newTask = {
    Id: nextId++,
    title: taskData.title,
    description: taskData.description || '',
    dueDate: taskData.dueDate,
    priority: taskData.priority || 'medium',
    completed: false,
    entityType: taskData.entityType || null,
    entityId: taskData.entityId ? parseInt(taskData.entityId, 10) : null,
    entityName: taskData.entityName || null,
    createdAt: new Date().toISOString()
  };
  
  tasks.push(newTask);
  return Promise.resolve({ ...newTask });
}

// Update existing task
export function update(id, taskData) {
  const taskId = parseInt(id, 10);
  if (isNaN(taskId)) {
    return Promise.reject(new Error('Invalid task ID'));
  }
  
  const index = tasks.findIndex(t => t.Id === taskId);
  if (index === -1) {
    return Promise.reject(new Error('Task not found'));
  }
  
  tasks[index] = {
    ...tasks[index],
    title: taskData.title ?? tasks[index].title,
    description: taskData.description ?? tasks[index].description,
    dueDate: taskData.dueDate ?? tasks[index].dueDate,
    priority: taskData.priority ?? tasks[index].priority,
    completed: taskData.completed ?? tasks[index].completed,
    entityType: taskData.entityType ?? tasks[index].entityType,
    entityId: taskData.entityId ? parseInt(taskData.entityId, 10) : tasks[index].entityId,
    entityName: taskData.entityName ?? tasks[index].entityName
  };
  
  return Promise.resolve({ ...tasks[index] });
}

// Mark task as complete
export function markComplete(id) {
  const taskId = parseInt(id, 10);
  if (isNaN(taskId)) {
    return Promise.reject(new Error('Invalid task ID'));
  }
  
  const index = tasks.findIndex(t => t.Id === taskId);
  if (index === -1) {
    return Promise.reject(new Error('Task not found'));
  }
  
  tasks[index].completed = true;
  tasks[index].completedAt = new Date().toISOString();
  
  return Promise.resolve({ ...tasks[index] });
}

// Delete task
export function deleteTask(id) {
  const taskId = parseInt(id, 10);
  if (isNaN(taskId)) {
    return Promise.reject(new Error('Invalid task ID'));
  }
  
  const index = tasks.findIndex(t => t.Id === taskId);
  if (index === -1) {
    return Promise.reject(new Error('Task not found'));
  }
  
  tasks.splice(index, 1);
  return Promise.resolve({ success: true });
}

export const taskService = {
  getAll,
  getById,
  getByEntity,
  getOverdue,
  getPending,
  getCompleted,
  create,
  update,
  markComplete,
  delete: deleteTask
};