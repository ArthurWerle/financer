// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { periodId, type } = req.query

  try {
    if (req.method === 'GET') {
      const incomes = await prisma.register.findMany({
        where: {
          periodId: Number(periodId),
          type: type as string
        }
      })
    
      res.status(200).json(incomes)
      return
    }

    if (req.method === 'POST') {
      const { amount, description, recursiveFor } = req.body

      const result = await prisma.register.create({
        data: {
          periodId: Number(periodId), 
          amount: parseFloat(amount),
          description,
          date: new Date(),
          type: type as string,
          recursiveFor: Number(recursiveFor)
        }
      })
    
      return res.status(200).json(result)
    }

    if (req.method === 'PUT') {
      const { amount, description, recursiveFor, id } = req.body

      const result = await prisma.register.update({
        where: {
          id: Number(id),
        },
        data: {
          periodId: Number(periodId), 
          amount: parseFloat(amount),
          description,
          date: new Date(),
          recursiveFor: Number(recursiveFor)
        },
      })
    
      return res.status(200).json({
        register: result,
        hasError: false,
      })
    }

    throw Error('Method not allowed')
  } catch (e) {
    const errorResponse = {
      message: 'Error on [periodId]/index.ts',
      error: `Error: ${e}`,
      hasError: true
    }

    res.status(500).json(errorResponse)
  }

}