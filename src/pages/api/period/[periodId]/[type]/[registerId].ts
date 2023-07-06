// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { registerId } = req.query

  try {
    if (req.method === 'DELETE') {

      const result = await prisma.register.delete({
        where: {
          id: Number(registerId)
        }
      })
    
      return res.status(200).json(result)
    }

    throw Error('Method not allowed')
  } catch (e) {
    const errorResponse = {
      message: 'Error on [registerId].ts',
      error: `Error: ${e}`,
      hasError: true
    }

    res.status(500).json(errorResponse)
  }

}