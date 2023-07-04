// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { periodId } = req.query

  try {
    if (req.method === 'GET') {
      const incomes = await prisma.income.findMany({
        where: {
          periodId: Number(periodId),
        }
      })
    
      res.status(200).json(incomes)
      return
    }

    if (req.method === 'POST') {
      const { amount, description, recursiveFor } = req.body

      const result = await prisma.income.create({
        data: {
          periodId: Number(periodId), 
          amount: parseFloat(amount),
          description,
          date: new Date(),
          recursiveFor: Number(recursiveFor)
        }
      })
    
      return res.status(200).json(result)
    }
  } catch (e) {
    const errorResponse = {
      message: 'Error on income.tsx',
      error: `Error: ${e}`,
      hasError: true
    }

    res.status(500).json(errorResponse)
  }

}