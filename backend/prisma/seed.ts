import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@financehub.com' },
    update: {},
    create: {
      email: 'admin@financehub.com',
      name: 'Admin User',
      password: hashedPassword,
      timezone: 'UTC',
      currency: 'USD',
    },
  });

  console.log('✅ User created:', user.email);

  // Create default accounts
  const checkingAccount = await prisma.account.upsert({
    where: { id: 'checking-account' },
    update: {},
    create: {
      id: 'checking-account',
      userId: user.id,
      name: 'Checking Account',
      type: 'CHECKING',
      balance: 500000, // $5000 in cents
      currency: 'USD',
    },
  });

  const savingsAccount = await prisma.account.upsert({
    where: { id: 'savings-account' },
    update: {},
    create: {
      id: 'savings-account',
      userId: user.id,
      name: 'Savings Account',
      type: 'SAVINGS',
      balance: 1500000, // $15000 in cents
      currency: 'USD',
    },
  });

  const creditCard = await prisma.account.upsert({
    where: { id: 'credit-card' },
    update: {},
    create: {
      id: 'credit-card',
      userId: user.id,
      name: 'Credit Card',
      type: 'CREDIT',
      balance: -250000, // -$2500 in cents
      currency: 'USD',
    },
  });

  console.log('✅ Accounts created');

  // Create default categories
  const incomeCategory = await prisma.category.upsert({
    where: { id: 'income-category' },
    update: {},
    create: {
      id: 'income-category',
      userId: user.id,
      name: 'Income',
      color: '#10B981',
      type: 'INCOME',
    },
  });

  const foodCategory = await prisma.category.upsert({
    where: { id: 'food-category' },
    update: {},
    create: {
      id: 'food-category',
      userId: user.id,
      name: 'Food',
      color: '#F59E0B',
      type: 'EXPENSE',
    },
  });

  const transportCategory = await prisma.category.upsert({
    where: { id: 'transport-category' },
    update: {},
    create: {
      id: 'transport-category',
      userId: user.id,
      name: 'Transport',
      color: '#3B82F6',
      type: 'EXPENSE',
    },
  });

  const housingCategory = await prisma.category.upsert({
    where: { id: 'housing-category' },
    update: {},
    create: {
      id: 'housing-category',
      userId: user.id,
      name: 'Housing',
      color: '#8B5CF6',
      type: 'EXPENSE',
    },
  });

  const entertainmentCategory = await prisma.category.upsert({
    where: { id: 'entertainment-category' },
    update: {},
    create: {
      id: 'entertainment-category',
      userId: user.id,
      name: 'Entertainment',
      color: '#EC4899',
      type: 'EXPENSE',
    },
  });

  console.log('✅ Categories created');

  // Create sample transactions
  const transactions = [
    {
      userId: user.id,
      accountId: checkingAccount.id,
      categoryId: incomeCategory.id,
      description: 'Salary',
      amount: 500000, // $5000
      date: new Date('2024-01-15'),
      type: 'INCOME' as const,
      cleared: true,
    },
    {
      userId: user.id,
      accountId: checkingAccount.id,
      categoryId: incomeCategory.id,
      description: 'Freelance Payment',
      amount: 120000, // $1200
      date: new Date('2024-01-14'),
      type: 'INCOME' as const,
      cleared: true,
    },
    {
      userId: user.id,
      accountId: creditCard.id,
      categoryId: foodCategory.id,
      description: 'Grocery Store',
      amount: -8550, // -$85.50
      date: new Date('2024-01-13'),
      type: 'EXPENSE' as const,
      cleared: false,
    },
    {
      userId: user.id,
      accountId: creditCard.id,
      categoryId: transportCategory.id,
      description: 'Gas Station',
      amount: -4500, // -$45
      date: new Date('2024-01-12'),
      type: 'EXPENSE' as const,
      cleared: false,
    },
    {
      userId: user.id,
      accountId: checkingAccount.id,
      categoryId: housingCategory.id,
      description: 'Rent Payment',
      amount: -120000, // -$1200
      date: new Date('2024-01-01'),
      type: 'EXPENSE' as const,
      cleared: true,
    },
  ];

  for (const transaction of transactions) {
    await prisma.transaction.create({
      data: transaction,
    });
  }

  console.log('✅ Sample transactions created');

  // Create savings goals
  const emergencyFund = await prisma.savingsGoal.create({
    data: {
      userId: user.id,
      name: 'Emergency Fund',
      target: 1000000, // $10000
      current: 750000, // $7500
      color: '#10B981',
      targetDate: new Date('2024-12-31'),
    },
  });

  const vacation = await prisma.savingsGoal.create({
    data: {
      userId: user.id,
      name: 'Vacation',
      target: 500000, // $5000
      current: 320000, // $3200
      color: '#3B82F6',
      targetDate: new Date('2024-06-01'),
    },
  });

  const newCar = await prisma.savingsGoal.create({
    data: {
      userId: user.id,
      name: 'New Car',
      target: 2500000, // $25000
      current: 1500000, // $15000
      color: '#8B5CF6',
      targetDate: new Date('2025-12-31'),
    },
  });

  console.log('✅ Savings goals created');

  // Create freelance projects
  const websiteProject = await prisma.freelanceProject.create({
    data: {
      userId: user.id,
      name: 'Website Redesign',
      client: 'Tech Corp',
      status: 'ACTIVE',
      hourlyRate: 7500, // $75/hour
      totalHours: 25,
      totalAmount: 187500, // $1875
    },
  });

  const mobileAppProject = await prisma.freelanceProject.create({
    data: {
      userId: user.id,
      name: 'Mobile App',
      client: 'Startup Inc',
      status: 'ACTIVE',
      hourlyRate: 8000, // $80/hour
      totalHours: 40,
      totalAmount: 320000, // $3200
    },
  });

  console.log('✅ Freelance projects created');

  // Create invoices
  await prisma.invoice.upsert({
    where: { invoiceNumber: 'INV-001' },
    update: {},
    create: {
      userId: user.id,
      projectId: websiteProject.id,
      amount: 187500, // $1875
      status: 'PAID',
      dueDate: new Date('2024-01-20'),
      invoiceNumber: 'INV-001',
    },
  });

  await prisma.invoice.upsert({
    where: { invoiceNumber: 'INV-002' },
    update: {},
    create: {
      userId: user.id,
      projectId: mobileAppProject.id,
      amount: 320000, // $3200
      status: 'SENT',
      dueDate: new Date('2024-02-15'),
      invoiceNumber: 'INV-002',
    },
  });

  console.log('✅ Invoices created');

  // Create salary configuration
  const salary = await prisma.salary.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      gross: 7500000, // $75000
      net: 4276200, // $42762
    },
  });

  // Create salary deductions
  const deductions = [
    { name: 'Federal Tax', amount: 1500000, type: 'TAX' as const },
    { name: 'State Tax', amount: 500000, type: 'TAX' as const },
    { name: 'Social Security', amount: 465000, type: 'TAX' as const },
    { name: 'Medicare', amount: 108800, type: 'TAX' as const },
    { name: '401k', amount: 750000, type: 'BENEFIT' as const },
  ];

  for (const deduction of deductions) {
    await prisma.salaryDeduction.create({
      data: {
        salaryId: salary.id,
        name: deduction.name,
        amount: deduction.amount,
        type: deduction.type,
      },
    });
  }

  console.log('✅ Salary configuration created');

  // Create recurring transactions (skip if they already exist)
  try {
    await prisma.recurringTransaction.create({
      data: {
        userId: user.id,
        accountId: checkingAccount.id,
        categoryId: housingCategory.id,
        description: 'Rent Payment',
        amount: -120000, // -$1200
        frequency: 'MONTHLY',
        nextDueDate: new Date('2024-02-01'),
      },
    });

    await prisma.recurringTransaction.create({
      data: {
        userId: user.id,
        accountId: checkingAccount.id,
        categoryId: incomeCategory.id,
        description: 'Salary',
        amount: 500000, // $5000
        frequency: 'MONTHLY',
        nextDueDate: new Date('2024-02-15'),
      },
    });
  } catch (error) {
    console.log('⚠️ Recurring transactions already exist, skipping...');
  }

  console.log('✅ Recurring transactions created');

  // Create sample operations data
  // Create inventory items
  const laptop = await prisma.item.create({
    data: {
      userId: user.id,
      name: 'MacBook Pro',
      description: '16-inch MacBook Pro for development',
      quantity: 5,
      unitCost: 250000, // $2500
      minStock: 2,
      maxStock: 10,
    },
  });

  const monitor = await prisma.item.create({
    data: {
      userId: user.id,
      name: '4K Monitor',
      description: '27-inch 4K monitor',
      quantity: 8,
      unitCost: 40000, // $400
      minStock: 3,
      maxStock: 15,
    },
  });

  const keyboard = await prisma.item.create({
    data: {
      userId: user.id,
      name: 'Mechanical Keyboard',
      description: 'Wireless mechanical keyboard',
      quantity: 2,
      unitCost: 15000, // $150
      minStock: 5,
      maxStock: 20,
    },
  });

  console.log('✅ Inventory items created');

  // Create orders
  const order1 = await prisma.order.create({
    data: {
      userId: user.id,
      orderNumber: 'ORD-001',
      status: 'UNPAID',
      amount: 500000, // $5000
      type: 'DELIVERY',
      dueDate: new Date('2024-02-15'),
      priority: 'NORMAL',
      description: 'Website development project',
      clientName: 'ABC Company',
      clientEmail: 'contact@abccompany.com',
      estimatedHours: 40,
    },
  });

  const order2 = await prisma.order.create({
    data: {
      userId: user.id,
      orderNumber: 'ORD-002',
      status: 'PAID',
      amount: 250000, // $2500
      type: 'PICKUP',
      dueDate: new Date('2024-01-30'),
      priority: 'URGENT',
      description: 'Mobile app consultation',
      clientName: 'XYZ Startup',
      clientEmail: 'hello@xyzstartup.com',
      estimatedHours: 20,
    },
  });

  console.log('✅ Orders created');

  // Create tasks
  const task1 = await prisma.task.create({
    data: {
      userId: user.id,
      title: 'Design homepage layout',
      description: 'Create wireframes and mockups for the homepage',
      status: 'PENDING',
      priority: 'NORMAL',
      dueDate: new Date('2024-02-10'),
      assignedTo: 'John Doe',
      orderId: order1.id,
      estimatedHours: 8,
      position: 0,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      userId: user.id,
      title: 'Implement user authentication',
      description: 'Set up login and registration system',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      dueDate: new Date('2024-02-05'),
      assignedTo: 'Jane Smith',
      orderId: order1.id,
      estimatedHours: 12,
      actualHours: 6,
      position: 0,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      userId: user.id,
      title: 'Database optimization',
      description: 'Optimize database queries and add indexes',
      status: 'COMPLETED',
      priority: 'LOW',
      dueDate: new Date('2024-01-25'),
      assignedTo: 'Mike Johnson',
      orderId: order2.id,
      estimatedHours: 6,
      actualHours: 5,
      position: 0,
    },
  });

  const task4 = await prisma.task.create({
    data: {
      userId: user.id,
      title: 'API documentation',
      description: 'Write comprehensive API documentation',
      status: 'PENDING',
      priority: 'NORMAL',
      dueDate: new Date('2024-02-20'),
      assignedTo: 'Sarah Wilson',
      estimatedHours: 4,
      position: 1,
    },
  });

  console.log('✅ Tasks created');

  // Create workshops
  const workshop1 = await prisma.workshop.create({
    data: {
      userId: user.id,
      title: 'React Development Workshop',
      client: 'Tech Academy',
      organization: 'Tech Academy Inc',
      date: new Date('2024-02-15'),
      location: 'Conference Room A',
      notes: 'Beginner to intermediate level workshop',
      orderId: order1.id,
    },
  });

  const workshop2 = await prisma.workshop.create({
    data: {
      userId: user.id,
      title: 'Database Design Best Practices',
      client: 'Data Corp',
      organization: 'Data Corporation',
      date: new Date('2024-02-28'),
      location: 'Online',
      notes: 'Advanced database design concepts',
    },
  });

  console.log('✅ Workshops created');

  // Create task costs
  await prisma.taskCost.create({
    data: {
      taskId: task1.id,
      description: 'Design software license',
      amount: 5000, // $50
    },
  });

  await prisma.taskCost.create({
    data: {
      taskId: task2.id,
      description: 'Development tools',
      amount: 10000, // $100
      itemId: laptop.id,
    },
  });

  console.log('✅ Task costs created');

  // Create workshop costs
  await prisma.workshopCost.create({
    data: {
      workshopId: workshop1.id,
      description: 'Presentation materials',
      amount: 2500, // $25
    },
  });

  await prisma.workshopCost.create({
    data: {
      workshopId: workshop1.id,
      description: 'Equipment rental',
      amount: 15000, // $150
      itemId: monitor.id,
    },
  });

  console.log('✅ Workshop costs created');

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
