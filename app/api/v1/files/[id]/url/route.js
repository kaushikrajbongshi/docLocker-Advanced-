import { NextResponse } from "next/server";
import db from "@/utils/db";
import Document from "@/model/Document";

export async function GET(req, { params }) {
  const Params = await params;
  const id = Params.id;
  try {
    await db();

    const document = await Document.findById(id);

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.log(error);

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
