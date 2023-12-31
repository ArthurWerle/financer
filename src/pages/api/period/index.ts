// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const periods = await prisma.period.findFirst({
    where: {
      endDate: null,
    },
    include: {
      register: true
    }
  })

  res.status(200).json(periods)
}
