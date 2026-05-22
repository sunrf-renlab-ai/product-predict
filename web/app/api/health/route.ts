import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "product-predict-web",
    version: "0.5.0",
    sim_pool_size: (process.env.PP_SIM_KEYS || "").split(/[,\n\s]+/).filter((k) => k.startsWith("sk-cp-")).length,
    deployed_via: "github-actions",
  });
}
