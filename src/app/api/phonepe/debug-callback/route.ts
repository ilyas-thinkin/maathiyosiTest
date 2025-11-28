// app/api/phonepe/debug-callback/route.ts
// Debug endpoint to see what PhonePe actually sends
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const allParams = Object.fromEntries(searchParams.entries());

  console.log("=== DEBUG CALLBACK ===");
  console.log("Full URL:", req.url);
  console.log("All query parameters:", allParams);
  console.log("===================");

  // Return HTML page showing all params
  return new NextResponse(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>PhonePe Callback Debug</title>
      <style>
        body { font-family: monospace; padding: 20px; }
        pre { background: #f4f4f4; padding: 15px; border-radius: 5px; }
      </style>
    </head>
    <body>
      <h1>PhonePe Callback Debug</h1>
      <h2>Full URL:</h2>
      <pre>${req.url}</pre>
      <h2>Query Parameters:</h2>
      <pre>${JSON.stringify(allParams, null, 2)}</pre>
      <h2>Headers:</h2>
      <pre>${JSON.stringify(Object.fromEntries(req.headers.entries()), null, 2)}</pre>
    </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("=== DEBUG CALLBACK POST ===");
    console.log("Body:", JSON.stringify(body, null, 2));
    console.log("Headers:", Object.fromEntries(req.headers.entries()));
    console.log("========================");

    return NextResponse.json({
      message: "Debug POST received",
      body: body,
      headers: Object.fromEntries(req.headers.entries())
    });
  } catch (error) {
    const text = await req.text();
    console.log("=== DEBUG CALLBACK POST (text) ===");
    console.log("Body:", text);
    console.log("===============================");

    return NextResponse.json({
      message: "Debug POST received (text)",
      body: text
    });
  }
}
