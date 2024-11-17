import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { errorResponse, getDbAndReqBody } from '@/lib/utils/api-routes'
import { corsHeaders } from '@/constants/corsHeaders'
import { idGenerator } from '@/lib/utils/common'
import { ObjectId } from 'mongodb'

export async function PATCH(req: Request) {
  try {
    const { db, reqBody } = await getDbAndReqBody(clientPromise, req)
    const isValidId = ObjectId.isValid(reqBody.id as string)
    let newImages = []
    const oldImages = reqBody.oldImages

    if (!isValidId) {
      return errorResponse('Wrong product id')
    }

    const product = await db
      .collection(reqBody.category as string)
      .findOne({ _id: new ObjectId(reqBody.id as string) })

    if (!product) {
      return errorResponse('Not found')
    }

    if (reqBody.newImages.length) {
      newImages = reqBody.newImages.map(
        (img: { dataUrl: string; title: string }) => ({
          ...img,
          imgId: idGenerator(),
        })
      )

      await db.collection('images').insertMany(newImages)
    }

    if (oldImages.length) {
      const oldImagesUrls = oldImages.map((image: { url: string }) => image.url)

      const deletedImages = product.images.filter(
        (image: { url: string }) => !oldImagesUrls.includes(image.url)
      )

      if (deletedImages.length) {
        await db.collection('images').deleteMany({
          url: {
            $in: deletedImages.map((image: { url: string }) => image.url),
          },
        })
      }
    }

    delete reqBody.newImages
    delete reqBody.oldImages
    delete reqBody._id

    await db.collection(reqBody.category).updateOne(
      { _id: new ObjectId(reqBody.id) },
      {
        $set: {
          ...reqBody,
          images: [
            ...oldImages,
            ...newImages.map((img: { title: string; imgId: string }) => ({
              url: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}?id=${img.imgId}`,
              desc: reqBody.name,
            })),
          ],
        },
      }
    )

    const updatedProduct = await db
      .collection(reqBody.category as string)
      .findOne({ _id: new ObjectId(reqBody.id as string) })

    return NextResponse.json(
      {
        status: 201,
        newItem: updatedProduct,
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS, DELETE, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
    status: 204,
  })
}
