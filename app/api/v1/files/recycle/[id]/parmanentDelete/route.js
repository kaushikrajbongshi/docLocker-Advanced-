import db from "@/utils/db";
import Document from "@/model/Document";
import Folder from "@/model/Folder";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  console.log("hit");
  await db();
  const Params = await params;
  const id = Params.id;
  try {
    let updateDoc = await Document.findByIdAndDelete(id);

    if (!updateDoc) {
      updateDoc = await Folder.findByIdAndDelete(id);
    }

    if (!updateDoc) {
      return NextResponse.json({
        status: 404,
        message: "Document or Folder not found",
      });
    }

    return NextResponse.json({
      status: 200,
      message: "Deleted successfully",
      updateDoc,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Something is wrong!" },
      { status: 400 }
    );
  }
}
