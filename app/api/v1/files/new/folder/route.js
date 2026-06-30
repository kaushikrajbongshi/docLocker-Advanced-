import Folder from "@/model/Folder";
import db from "@/utils/db";
import { parse } from "cookie";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await db();
    const cookieHeader = req.headers.get("cookie") || "";
    const cookiesObj = parse(cookieHeader);
    const token = cookiesObj.authToken;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const { name, parentFolderId } = await req.json();

    if (!name || !name.trim()) {
      return new Response(
        JSON.stringify({ error: "Folder name is required" }),
        { status: 400 }
      );
    }

    const newFolder = await Folder.create({
      name,
      userId,
      parentFolderId: parentFolderId === "null" ? null : parentFolderId,
    });

    return new Response(JSON.stringify(newFolder), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
