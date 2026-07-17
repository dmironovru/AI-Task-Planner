'use client'

import { useState, useEffect, useCallback } from 'react'
import { ShoppingItem, ShoppingItemFormData } from '@/types'

const STORAGE_KEY = 'ai-task-planner-shopping'

const defaultCategories = [
  { value: 'vegetables', label: '🥬 Овощи', color: 'bg-emerald-500/20 text-emerald-300' },
  { value: 'fruits', label: '🍎 Фрукты', color: 'bg-red-500/20 text-red-300' },
  { value: 'dairy', label: '🥛 Молочные', color: 'bg-blue-500/20 text-blue-300' },
  { value: 'bakery', label: '🍞 Выпечка', color: 'bg-amber-500/20 text-amber-300' },
  { value: 'meat', label: '🍗 Мясо', color: 'bg-rose-500/20 text-rose-300' },
  { value: 'drinks', label: '🥤 Напитки', color: 'bg-cyan-500/20 text-cyan-300' },
  { value: 'snacks', label: '🍿 Снеки и десерты', color: 'bg-orange-500/20 text-orange-300' },
  { value: 'household', label: '🧼 Бытовая химия', color: 'bg-purple-500/20 text-purple-300' },
  { value: 'groceries', label: '🌾 Бакалея', color: 'bg-yellow-500/20 text-yellow-300' },
  { value: 'other', label: '📦 Другое', color: 'bg-gray-500/20 text-gray-300' },
]

export function useShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Загрузка — ТОЛЬКО ОДИН РАЗ
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setItems(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse shopping list:', e)
      }
    }
    setIsLoaded(true)
  }, [])

  // Сохранение — ТОЛЬКО когда items меняется
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, isLoaded])

  const addItem = useCallback((data: ShoppingItemFormData) => {
    const newItem: ShoppingItem = {
      id: crypto.randomUUID(),
      ...data,
      purchased: false,
      createdAt: new Date().toISOString(),
    }
    setItems(prev => [newItem, ...prev])
    return newItem
  }, [])

  const togglePurchased = useCallback((id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, purchased: !item.purchased } : item
    ))
  }, [])

  const deleteItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }, [])

  const updateItem = useCallback((id: string, data: Partial<ShoppingItem>) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...data } : item
    ))
  }, [])

  const stats = {
    total: items.length,
    purchased: items.filter(i => i.purchased).length,
    remaining: items.filter(i => !i.purchased).length,
  }

  const itemsByCategory = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, ShoppingItem[]>)

  return {
    items,
    isLoaded,
    addItem,
    togglePurchased,
    deleteItem,
    updateItem,
    stats,
    itemsByCategory,
    categories: defaultCategories,
  }
}
