import { getPrismaClient } from '../config/db.js';

export const createRecord = async (req, res, next) => {
  try {
    const prisma = getPrismaClient();
    const { amount, type, category, date: dateInput, notes } = req.body;
    const userId = req.user.userId;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }
    if (!type) {
      return res.status(400).json({ message: 'Type is required' });
    }
    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }
    let date = new Date();
    if (dateInput) {
      const parsedDate = Date.parse(dateInput);
      if (isNaN(parsedDate)) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
      date = new Date(parsedDate);
    }

    const record = await prisma.financialRecord.create({
      data: {
        amount: parseFloat(amount),
        type,
        category,
        date: date,
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

    const existingRecord = await prisma.financialRecord.findUnique({
      where: { id }
    });

    if (!existingRecord) {
      return res.status(404).json({ message: 'Record not found' });
    }

    const updateData = {};
    if (amount) {
      const parsed = parseFloat(amount);
      if (isNaN(parsed)) {
        return res.status(400).json({ message: 'Invalid amount' });
      }
      updateData.amount = parsed;
    }
    if (type) {
      if (!['INCOME', 'EXPENSE'].includes(type)) {
        return res.status(400).json({ message: 'Type must be INCOME or EXPENSE' });
      }
      updateData.type = type;
    }
    if (category) {
      updateData.category = category;
    }
    if (date) {
      const parsedDate = Date.parse(date);
      if (isNaN(parsedDate)) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
      updateData.date = new Date(parsedDate);
    }
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const updatedRecord = await prisma.financialRecord.update({
      where: { id },
      data: updateData
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

    const existingRecord = await prisma.financialRecord.findUnique({
      where: { id }
    });

    if (!existingRecord) {
      return res.status(404).json({ message: 'Record not found' });
    }

    await prisma.financialRecord.delete({
      where: { id }
    });

    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (error) {
    next(error);
  }
};