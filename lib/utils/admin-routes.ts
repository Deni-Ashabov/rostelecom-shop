import { NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'
import { corsHeaders } from '@/constants/corsHeaders'
import { getDbAndReqBody } from './api-routes'

export const getFilteredCollection = async (
  collection: string,
  clientPromise: Promise<MongoClient>,
  req: Request
) => {
  const { db } = await getDbAndReqBody(clientPromise, null)
  const url = new URL(req.url)
  const rangeParam = url.searchParams.get('range') || JSON.stringify([0, 4])
  const sortParam =
    url.searchParams.get('sort') || JSON.stringify(['name', 'ASC'])
  const range = JSON.parse(rangeParam)
  const sort = JSON.parse(sortParam)

  const goods = await db
    .collection(collection)
    .find()
    .sort({
      [sort[0] === 'id' ? '_id' : sort[0]]: sort[1] === 'ASC' ? 1 : -1,
    })
    .toArray()

  return NextResponse.json(
    {
      count: goods.length,
      items: goods
        .slice(range[0], range[1])
        .map((item) => ({ ...item, id: item._id })),
    },
    corsHeaders
  )
}

export const deleteOne = async (
  clientPromise: Promise<MongoClient>,
  req: Request
) => {
  const { db } = await getDbAndReqBody(clientPromise, null)
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  const category = url.searchParams.get('category')

  await db
    .collection(category as string)
    .deleteOne({ _id: new ObjectId(id as string) })

  return NextResponse.json(
    {
      status: 204,
    },
    corsHeaders
  )
}
