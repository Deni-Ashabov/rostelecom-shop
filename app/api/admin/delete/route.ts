import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { deleteOne } from '@/lib/utils/admin-routes'

export async function DELETE(req: Request) {
  try {
    return deleteOne(clientPromise, req)
  } catch (error) {
    throw new Error((error as Error).message)
  }
}

export const dynamic = 'force-dynamic'

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
