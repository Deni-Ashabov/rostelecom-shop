import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { errorResponse, getDbAndReqBody } from '@/lib/utils/api-routes'
import { corsHeaders } from '@/constants/corsHeaders'
import { idGenerator } from '@/lib/utils/common'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { db, reqBody } = await getDbAndReqBody(clientPromise, req)
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(reqBody.password, salt)
    let image = null

    const user = await db.collection('users').findOne({ email: reqBody.email })

    if (user) {
      return errorResponse('Пользователь с таким emil уже существует')
    }

    if (reqBody.image) {
      image = {
        ...reqBody.image,
        imgId: idGenerator(),
      }

      await db.collection('images').insertOne(image)
    }

    const newUser = {
      ...reqBody,
      image: {
        url: image
          ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}?id=${image.imgId}`
          : '',
        desc: image ? reqBody.name : '',
      },
      password: hash,
    }

    const { insertedId } = await db.collection('users').insertOne(newUser)

    return NextResponse.json(
      {
        status: 201,
        newUser: { id: insertedId, ...newUser },
      },
      corsHeaders
    )
  } catch (error) {
    throw new Error((error as Error).message)
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
    status: 204,
  })
}
