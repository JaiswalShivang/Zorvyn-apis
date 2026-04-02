import { getPrismaClient } from '../config/db.js';

export const createRecord = async (req, res, next) => {
  try {
    const prisma = getPrismaClient();
    const { amount, type, category, date, notes } = req.body;
    const userId = req.user.userId;

    const record = await prisma.financialRecord.create({
      data: {
        amount: parseFloat(amount),
        type,
        category,
        date: new Date(date),
        notes,
        createdBy: userId
      }
    });

    res.status(201).json({ message: 'Record created successfully', record });
  } catch (error) {
    next(error);
  }
};

export const getRecords = async (req, res, next) => {
  try {
    const prisma = getPrismaClient();
    const { type, category, page = 1, limit = 10, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      ...(type && { type }),
      ...(category && { category }),
      ...(search && {
        OR: [
          { notes: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [records, total] = await Promise.all([
      prisma.financialRecord.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { date: 'desc' }
      }),
      prisma.financialRecord.count({ where })
    ]);

    res.status(200).json({
      records,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateRecord = async (req, res, next) => {
  try {
    const prisma = getPrismaClient();
    const { id } = req.params;
    const { amount, type, category, date, notes } = req.body;

    const updatedRecord = await prisma.financialRecord.update({
      where: { id },
      data: {
        ...(amount && { amount: parseFloat(amount) }),
        ...(type && { type }),
        ...(category && { category }),
        ...(date && { date: new Date(date) }),
        ...(notes && { notes })
      }
    });

    res.status(200).json({ message: 'Record updated', record: updatedRecord });
  } catch (error) {
    next(error);
  }
};

export const deleteRecord = async (req, res, next) => {
  try {
    const prisma = getPrismaClient();
    const { id } = req.params;

    await prisma.financialRecord.delete({
      where: { id }
    });

    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (error) {
    next(error);
  }
};
