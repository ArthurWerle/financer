// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { periodId } = req.query

  const incomes = await prisma.outcome.findMany({
    where: {
      periodId: Number(periodId),
    }
  })
  res.status(200).json(incomes)
}