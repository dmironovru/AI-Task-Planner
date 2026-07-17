// AI Service — ИСПРАВЛЕННЫЕ ДАТЫ (локальное время, не UTC)

const OLLAMA_API = 'http://localhost:11434'
const MODEL = 'llama3.2:latest'

export interface AITaskParse {
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  dueTime?: string
  reminderHours?: number
  category?: 'task' | 'reminder' | 'shopping'
}

export interface ParsedShoppingItem {
  title: string
  quantity?: string
  unit?: string
  category: string
}

export interface ShoppingItem {
  id: string
  title: string
  quantity?: string
  unit?: string
  purchased: boolean
}

export async function checkOllamaAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_API}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    })
    return response.ok
  } catch {
    return false
  }
}

export function getShoppingCategory(title: string): string {
  const lower = title.toLowerCase()
  if (lower.match(/помидор|огурец|картофел|картошк|лук|морков|капуст|перец|овощ|чеснок|зелень|свёкл|свекл|редис|тыкв/)) return 'vegetables'
  if (lower.match(/яблок|банан|апельсин|груш|виноград|фрукт|киви|персик|лимон|мандарин/)) return 'fruits'
  if (lower.match(/молок|сыр|йогурт|кефир|сметан|творог|сливк|масло/)) return 'dairy'
  if (lower.match(/хлеб|булк|батон|круассан|лаваш|выпечк/)) return 'bakery'
  if (lower.match(/куриц|говядин|свинин|фарш|сосиск|колбас|мяс|рыб|сало/)) return 'meat'
  if (lower.match(/вод|сок|газировк|чай|коф|напиток/)) return 'drinks'
  if (lower.match(/чипс|печень|орех|шоколад|конфет|снек|морожен|торт/)) return 'snacks'
  if (lower.match(/шампун|мыл|стиральн|порошок|средство|туалет|бумаг/)) return 'household'
  if (lower.match(/сахар|мука|соль|крупа|рис|гречк|макарон/)) return 'groceries'
  return 'other'
}

export function isShoppingList(text: string): boolean {
  const lower = text.toLowerCase()
  const hasCommas = text.split(',').length >= 2
  const hasProducts = lower.match(/молок|хлеб|батон|картофел|картошк|масло|сыр|колбас|куриц|мяс|рыб|овощ|фрукт|сахар|мука|рис|гречк|макарон|чай|коф|сок|вод|печень|шоколад|капуст|морков|лук|свёкл|свекл|помидор|огурец|конфет|кофе/)
  return hasCommas && hasProducts
}

// === ИСПРАВЛЕННАЯ ФУНКЦИЯ — ЛОКАЛЬНАЯ ДАТА БЕЗ UTC ===
export function getTodayDate(): string {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const monthNames = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  const month = monthNames[now.getMonth()]
  return `${day} ${month}`
}

export function getTomorrowDate(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const day = String(tomorrow.getDate()).padStart(2, '0')
  const monthNames = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  const month = monthNames[tomorrow.getMonth()]
  return `${day} ${month}`
}

export function getFutureDate(daysAhead: number): string {
  const future = new Date()
  future.setDate(future.getDate() + daysAhead)
  const day = String(future.getDate()).padStart(2, '0')
  const monthNames = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  const month = monthNames[future.getMonth()]
  return `${day} ${month}`
}

export function parseSimpleDate(text: string): string | undefined {
  const months: Record<string, string> = {
    'янв': 'янв', 'января': 'янв', 'январь': 'янв',
    'фев': 'фев', 'февраля': 'фев', 'февраль': 'фев',
    'мар': 'мар', 'марта': 'мар', 'март': 'мар',
    'апр': 'апр', 'апреля': 'апр', 'апрель': 'апр',
    'май': 'май', 'мая': 'май',
    'июн': 'июн', 'июня': 'июн', 'июнь': 'июн',
    'июл': 'июл', 'июля': 'июл', 'июль': 'июл',
    'авг': 'авг', 'августа': 'авг', 'август': 'авг',
    'сен': 'сен', 'сентября': 'сен', 'сентябрь': 'сен',
    'окт': 'окт', 'октября': 'окт', 'октябрь': 'окт',
    'ноя': 'ноя', 'ноября': 'ноя', 'ноябрь': 'ноя',
    'дек': 'дек', 'декабря': 'дек', 'декабрь': 'дек',
  }
  
  const match = text.toLowerCase().match(/(\d{1,2})\s*(янв|фев|мар|апр|май|июн|июл|авг|сен|окт|ноя|дек)/i)
  if (match) {
    const day = String(parseInt(match[1])).padStart(2, '0')
    return `${day} ${months[match[2].toLowerCase()]}`
  }
  
  const lower = text.toLowerCase()
  if (lower.includes('завтра')) return getTomorrowDate()
  if (lower.includes('сегодня')) return getTodayDate()
  
  return undefined
}

export function parseSimpleTime(text: string): string | undefined {
  const match = text.match(/в\s*(\d{1,2})[:.](\d{2})/i)
  if (match) {
    const hours = String(parseInt(match[1])).padStart(2, '0')
    return `${hours}:${match[2]}`
  }
  return undefined
}

export function parseShoppingListSimple(text: string): { items: ShoppingItem[], dueDate?: string } {
  const items: ShoppingItem[] = []
  let dueDate: string | undefined
  
  const dateMatch = text.match(/(\d{1,2})\s*(янв|фев|мар|апр|май|июн|июл|авг|сен|окт|ноя|дек)/i)
  if (dateMatch) {
    const months: Record<string, string> = {
      'янв': 'янв', 'фев': 'фев', 'мар': 'мар', 'апр': 'апр', 'май': 'май',
      'июн': 'июн', 'июл': 'июл', 'авг': 'авг', 'сен': 'сен', 'окт': 'окт', 'ноя': 'ноя', 'дек': 'дек',
    }
    const day = String(parseInt(dateMatch[1])).padStart(2, '0')
    dueDate = `${day} ${months[dateMatch[2].toLowerCase()]}`
  }
  
  const rawItems = text.split(',').map(i => i.trim()).filter(i => i)
  
  for (const rawItem of rawItems) {
    if (rawItem.match(/^\d{1,2}\s*(янв|фев|мар|апр|май|июн|июл|авг|сен|окт|ноя|дек)/i)) {
      continue
    }
    
    let title = rawItem
    let quantity: string | undefined
    let unit: string | undefined
    
    const qtyMatch = rawItem.match(/(\d+(?:\.\d+)?)\s*(кг|г|л|мл|шт|уп|пач|бан)/i)
    if (qtyMatch) {
      quantity = qtyMatch[1]
      unit = qtyMatch[2].toLowerCase()
      title = rawItem.replace(qtyMatch[0], '').trim()
    } else {
      const numMatch = rawItem.match(/(\d+(?:\.\d+)?)\s*$/)
      if (numMatch) {
        quantity = numMatch[1]
        unit = 'кг'
        title = rawItem.replace(numMatch[0], '').trim()
      }
    }
    
    title = title.replace(/[.,]$/, '').trim()
    title = title.replace(/купить|купи|возьми/i, '').trim()
    
    if (title) {
      items.push({
        id: crypto.randomUUID(),
        title: title.charAt(0).toUpperCase() + title.slice(1),
        quantity,
        unit,
        purchased: false,
      })
    }
  }
  
  return { items, dueDate }
}

export function parseTaskFallback(text: string): AITaskParse {
  const originalText = text.trim()
  const lowerText = originalText.toLowerCase()
  
  let category: 'task' | 'reminder' | 'shopping' = 'task'
  if (lowerText.includes('напомни')) category = 'reminder'
  if (lowerText.includes('купить') || lowerText.includes('купи')) category = 'shopping'
  
  let priority: 'low' | 'medium' | 'high' = 'medium'
  if (lowerText.match(/срочно|важно|критично/)) priority = 'high'
  if (lowerText.match(/не срочно|потом/)) priority = 'low'
  
  const dueDate = parseSimpleDate(originalText)
  const dueTime = parseSimpleTime(originalText)
  
  let title = originalText
  title = title.replace(/в\s*\d{1,2}[:.]\d{2}/gi, '')
  title = title.replace(/(\d{1,2})\s*(янв|фев|мар|апр|май|июн|июл|авг|сен|окт|ноя|дек)[а-я]*\s*/gi, '')
  title = title.replace(/завтра|послезавтра|сегодня/gi, '')
  title = title.replace(/срочно|важно|критично/gi, '')
  title = title.replace(/\s+/g, ' ').trim()
  title = title.replace(/^[,.\s]+|[,.\s]+$/g, '')
  
  if (!title) title = originalText
  if (title.length > 100) title = title.substring(0, 100)
  
  return {
    title: title.charAt(0).toUpperCase() + title.slice(1),
    description: undefined,
    priority,
    dueDate,
    dueTime,
    reminderHours: category === 'reminder' ? 24 : undefined,
    category,
  }
}

export async function generateTaskDescription(title: string): Promise<string> {
  return ''
}

export async function suggestPriority(title: string, description?: string): Promise<'low' | 'medium' | 'high'> {
  const text = `${title} ${description || ''}`.toLowerCase()
  if (text.match(/срочно|важно|критично/)) return 'high'
  if (text.match(/не срочно|потом/)) return 'low'
  return 'medium'
}
