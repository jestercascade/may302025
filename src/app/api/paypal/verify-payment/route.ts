import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { success } = await request.json();

    if (success) {
      const response = NextResponse.json(
        { message: "Success" },
        { status: 200 }
      );
      response.cookies.set("payment_success", "true", {
        path: "/",
        maxAge: 300,
        httpOnly: true,
        sameSite: "strict",
      });
      return response;
    }

    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  } catch {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
}
