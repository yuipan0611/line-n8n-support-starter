import { NextResponse } from "next/server";
import { getCatalogData } from "@/lib/catalog-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const catalog = await getCatalogData();
    return NextResponse.json(catalog);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load catalog";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
