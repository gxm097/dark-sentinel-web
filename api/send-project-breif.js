export function GET() {
  return Response.json({
    success: true,
    message: "API route is working."
  });
}

export function POST() {
  return Response.json({
    success: true,
    message: "POST request received."
  });
}
