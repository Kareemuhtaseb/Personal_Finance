import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const generateOrderNumber = async (): Promise<string> => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  
  // Get count of orders created today
  const startOfDay = new Date(year, today.getMonth(), today.getDate())
  const endOfDay = new Date(year, today.getMonth(), today.getDate() + 1)
  
  const todayOrdersCount = await prisma.order.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lt: endOfDay
      }
    }
  })
  
  const sequence = String(todayOrdersCount + 1).padStart(4, '0')
  return `ORD-${year}${month}${day}-${sequence}`
}
