export interface ShoppingItem {
  id: string
  title: string
  quantity?: string
  unit?: string
  purchased: boolean
  category?: string
  dueDate?: string
  createdAt?: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: 'active' | 'done'
  priority: 'low' | 'medium' | 'high'
  dueDate: string
  dueTime?: string
  shoppingItems?: ShoppingItem[]
  createdAt: string
  aiSuggested?: boolean
}

export interface Stats {
  total: number
  completed: number
  inProgress: number
  aiGenerated: number
}

export interface TaskFormData {
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  dueDate: string
  dueTime?: string
  shoppingItems?: ShoppingItem[]
  reminderMinutes?: number
}

export interface ShoppingItemFormData {
  title: string
  category: string
  quantity?: string
  unit?: string
  dueDate: string
}
