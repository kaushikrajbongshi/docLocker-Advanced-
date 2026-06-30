// app/api/files/[id]/content/route.js
import Folder from "@/model/Folder";
import db from "@/utils/db";
import Document from "@/model/Document";
import { NextResponse } from "next/server";
import { parse } from "cookie";
import jwt from "jsonwebtoken";

export async function GET(req, { params }) {
  try {
    await db();

    // Get user from cookie
    const cookieHeader = req.headers.get("cookie") || "";
    const cookiesObj = parse(cookieHeader);
    const token = cookiesObj.authToken;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const Params = await params;
    const id = Params.id;

    // Fetch folders and documents where parent is this folder ID
    const folders = await Folder.find({
      parentFolderId: id,
      userId: userId,
      status: "active",
    }).lean();

    const documents = await Document.find({
      folderId: id,
      userId: userId,
      status: "active",
    }).lean();

    // Transform the data to match frontend expectations
    const transformedFolders = folders.map((folder) => ({
      _id: folder._id,
      id: folder._id,
      name: folder.name,
      type: "folder",
      owner: "me",
      modified: folder.createdAt
        ? new Date(folder.createdAt).toLocaleDateString()
        : "N/A",
      size: "-",
    }));

    const transformedDocuments = documents.map((doc) => ({
      _id: doc._id,
      id: doc._id,
      name: doc.name,
      type: doc.type,
      owner: "me",
      modified: doc.createdAt
        ? new Date(doc.createdAt).toLocaleDateString()
        : "N/A",
      size: doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : "N/A",
      url: doc.fileUrl,
    }));

    return NextResponse.json({
      success: true,
      data: {
        folder: transformedFolders,
        document: transformedDocuments,
      },
    });
  } catch (error) {
    console.error("Error fetching folder contents:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
