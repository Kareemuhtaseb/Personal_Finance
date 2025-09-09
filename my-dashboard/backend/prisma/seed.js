"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
    const hashedPassword = await bcryptjs_1.default.hash('password123', 12);
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
    const checkingAccount = await prisma.account.upsert({
        where: { id: 'checking-account' },
        update: {},
        create: {
            id: 'checking-account',
            userId: user.id,
            name: 'Checking Account',
            type: 'CHECKING',
            balance: 500000,
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
            balance: 1500000,
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
            balance: -250000,
            currency: 'USD',
        },
    });
    console.log('✅ Accounts created');
    const incomeCategory = await prisma.category.upsert({
        where: { id: 'income-category' },
        update: {},
        create: {
            id: 'income-category',
            userId: user.id,
            name: 'Income',
            icon: '💰',
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
            icon: '🍽️',
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
            icon: '🚗',
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
            icon: '🏠',
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
            icon: '🎬',
            color: '#EC4899',
            type: 'EXPENSE',
        },
    });
    console.log('✅ Categories created');
    const transactions = [
        {
            userId: user.id,
            accountId: checkingAccount.id,
            categoryId: incomeCategory.id,
            description: 'Salary',
            amount: 500000,
            date: new Date('2024-01-15'),
            type: 'INCOME',
            cleared: true,
        },
        {
            userId: user.id,
            accountId: checkingAccount.id,
            categoryId: incomeCategory.id,
            description: 'Freelance Payment',
            amount: 120000,
            date: new Date('2024-01-14'),
            type: 'INCOME',
            cleared: true,
        },
        {
            userId: user.id,
            accountId: creditCard.id,
            categoryId: foodCategory.id,
            description: 'Grocery Store',
            amount: -8550,
            date: new Date('2024-01-13'),
            type: 'EXPENSE',
            cleared: false,
        },
        {
            userId: user.id,
            accountId: creditCard.id,
            categoryId: transportCategory.id,
            description: 'Gas Station',
            amount: -4500,
            date: new Date('2024-01-12'),
            type: 'EXPENSE',
            cleared: false,
        },
        {
            userId: user.id,
            accountId: checkingAccount.id,
            categoryId: housingCategory.id,
            description: 'Rent Payment',
            amount: -120000,
            date: new Date('2024-01-01'),
            type: 'EXPENSE',
            cleared: true,
        },
    ];
    for (const transaction of transactions) {
        await prisma.transaction.create({
            data: transaction,
        });
    }
    console.log('✅ Sample transactions created');
    const emergencyFund = await prisma.savingsGoal.create({
        data: {
            userId: user.id,
            name: 'Emergency Fund',
            target: 1000000,
            current: 750000,
            color: '#10B981',
            targetDate: new Date('2024-12-31'),
        },
    });
    const vacation = await prisma.savingsGoal.create({
        data: {
            userId: user.id,
            name: 'Vacation',
            target: 500000,
            current: 320000,
            color: '#3B82F6',
            targetDate: new Date('2024-06-01'),
        },
    });
    const newCar = await prisma.savingsGoal.create({
        data: {
            userId: user.id,
            name: 'New Car',
            target: 2500000,
            current: 1500000,
            color: '#8B5CF6',
            targetDate: new Date('2025-12-31'),
        },
    });
    console.log('✅ Savings goals created');
    const websiteProject = await prisma.freelanceProject.create({
        data: {
            userId: user.id,
            name: 'Website Redesign',
            client: 'Tech Corp',
            status: 'ACTIVE',
            hourlyRate: 7500,
            totalHours: 25,
            totalAmount: 187500,
        },
    });
    const mobileAppProject = await prisma.freelanceProject.create({
        data: {
            userId: user.id,
            name: 'Mobile App',
            client: 'Startup Inc',
            status: 'ACTIVE',
            hourlyRate: 8000,
            totalHours: 40,
            totalAmount: 320000,
        },
    });
    console.log('✅ Freelance projects created');
    await prisma.invoice.create({
        data: {
            userId: user.id,
            projectId: websiteProject.id,
            amount: 187500,
            status: 'PAID',
            dueDate: new Date('2024-01-20'),
            invoiceNumber: 'INV-001',
        },
    });
    await prisma.invoice.create({
        data: {
            userId: user.id,
            projectId: mobileAppProject.id,
            amount: 320000,
            status: 'SENT',
            dueDate: new Date('2024-02-15'),
            invoiceNumber: 'INV-002',
        },
    });
    console.log('✅ Invoices created');
    const salary = await prisma.salary.create({
        data: {
            userId: user.id,
            gross: 7500000,
            net: 4276200,
        },
    });
    const deductions = [
        { name: 'Federal Tax', amount: 1500000, type: 'TAX' },
        { name: 'State Tax', amount: 500000, type: 'TAX' },
        { name: 'Social Security', amount: 465000, type: 'TAX' },
        { name: 'Medicare', amount: 108800, type: 'TAX' },
        { name: '401k', amount: 750000, type: 'BENEFIT' },
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
    await prisma.recurringTransaction.create({
        data: {
            userId: user.id,
            accountId: checkingAccount.id,
            categoryId: housingCategory.id,
            description: 'Rent Payment',
            amount: -120000,
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
            amount: 500000,
            frequency: 'MONTHLY',
            nextDueDate: new Date('2024-02-15'),
        },
    });
    console.log('✅ Recurring transactions created');
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
//# sourceMappingURL=seed.js.map