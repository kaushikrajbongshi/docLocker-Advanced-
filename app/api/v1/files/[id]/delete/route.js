import db from "@/utils/db";
import Document from "@/model/Document";
import Folder from "@/model/Folder";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  console.log("hit");
  await db();
  const Params = await params;
  const id = Params.id;
  const status = "deleted";
  try {
    let updateDoc = await Document.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updateDoc) {
      updateDoc = await Folder.findByIdAndUpdate(id, { status }, { new: true });
    }

    if (!updateDoc) {
      return NextResponse.json({
        status: 404,
        message: "Document or Folder not found",
      });
    }

    return NextResponse.json({
      status: 200,
      message: "Updated successfully",
      updateDoc,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Something is wrong!" },
      { status: 400 }
    );
  }
}
