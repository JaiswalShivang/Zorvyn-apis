import { getPrismaClient } from '../config/db.js';
import redis from '../config/redis.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const prisma = getPrismaClient();
    const cacheKey = 'dashboard:summary';

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const [totalIncome, totalExpense, categoryTotals, recentTransactions] = await Promise.all([
      prisma.financialRecord.aggregate({
        where: { type: 'INCOME' },
        _sum: { amount: true }
      }),
      prisma.financialRecord.aggregate({
        where: { type: 'EXPENSE' },
        _sum: { amount: true }
      }),
      prisma.financialRecord.groupBy({
        by: ['category'],
        where: { type: 'EXPENSE' },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } }
      }),
      prisma.financialRecord.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      })
    ]);

    const incomeSum = Number(totalIncome._sum.amount ?? 0);
    const expenseSum = Number(totalExpense._sum.amount ?? 0);

    const result = {
      totalIncome: incomeSum,
      totalExpense: expenseSum,
      netBalance: incomeSum - expenseSum,
      categoryTotals: categoryTotals.map((entry) => ({
        category: entry.category,
        total: Number(entry._sum.amount ?? 0)
      })),
      recentTransactions
    };

    await redis.setex(cacheKey, 300, JSON.stringify(result));

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
