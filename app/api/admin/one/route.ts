/* eslint-disable prettier/prettier */
import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'
import { corsHeaders } from '@/constants/corsHeaders'
import clientPromise from '@/lib/mongodb'
import { getDbAndReqBody } from '@/lib/utils/api-routes'

export async function GET(req: Request) {
  try {
    const { db } = await getDbAndReqBody(clientPromise, null)
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    const category = url.searchParams.get('category')
    const isValidId = ObjectId.isValid(id as string)

    if (!isValidId) {
      return NextResponse.json(
        {
          message: 'Wrong product id',
          status: 404,
        },
        corsHeaders
      )
    }

    const item = await db
      .collection(category as string)
      .findOne({ _id: new ObjectId(id as string) })

    return NextResponse.json(
      category === 'users'
        ? {
          ...Object.fromEntries(
            Object.entries(item || {}).filter((item) => item[0] != 'password')
          ),
          id: item?._id,
        }
        : {
          ...item,
          id: item?._id,
        },
      corsHeaders
    )
  } catch (error) {
    throw new Error((error as Error).message)
  }
}

export const dynamic = 'force-dynamic'
