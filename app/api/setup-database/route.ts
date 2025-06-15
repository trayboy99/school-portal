import { setupDatabase } from "../../../scripts/setup-database"

export async function POST() {
  try {
    await setupDatabase()
    return Response.json({
      success: true,
      message: "Database tables created successfully!",
    })
  } catch (error) {
    console.error("Database setup error:", error)
    return Response.json(
      {
        success: false,
        error: "Failed to create database tables",
      },
      { status: 500 },
    )
  }
}
