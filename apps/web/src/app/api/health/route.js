import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    // Simple query to check connection
    const result = await sql`SELECT 1 as status`;

    return Response.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return Response.json(
      {
        status: "error",
        database: "disconnected",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
