import { NextResponse } from "next/server"
import client from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Check database connection
    await client.db("admin").command({ ping: 1 })

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        api: "ok",
        database: "ok",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        services: {
          api: "ok",
          database: "error",
        },
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    )
  }
}
