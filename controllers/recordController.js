import { getPrismaClient } from '../config/db.js';

export const createRecord = async (req, res) => {
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
    console.error('Create record error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getRecords = async (req, res) => {
  try {
    const prisma = getPrismaClient();
    const { type, category } = req.query; 

    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;

    const records = await prisma.financialRecord.findMany({
      where: filter,
      orderBy: { date: 'desc' } 
    });

    res.status(200).json(records);
  } catch (error) {
    console.error('Get records error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateRecord = async (req, res) => {
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
    console.error('Update record error:', error);
    res.status(500).json({ message: 'Failed to update record (check if ID exists)' });
  }
};

export const deleteRecord = async (req, res) => {
  try {
    const prisma = getPrismaClient();
    const { id } = req.params;

    await prisma.financialRecord.delete({
      where: { id }
    });

    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Delete record error:', error);
    res.status(500).json({ message: 'Failed to delete record' });
  }
};