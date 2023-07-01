// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { periodId } = req.query

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
    await prisma.income.create({
      data: req.body
    })
  
    res.status(200).json('ok')
    return
  }

}