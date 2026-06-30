// app/api/files/route.js
import Folder from "@/model/Folder";
import db from "@/utils/db";
import Document from "@/model/Document";
import { NextResponse } from "next/server";
import { parse } from "cookie";
import jwt from "jsonwebtoken";

/**
 * @swagger
 * /api/files:
 *   get:
 *     summary: Get all files
 *     description: Returns all uploaded files of the logged-in user.
 *     responses:
 *       200:
 *         description: Successfully fetched files.
 *       401:
 *         description: Unauthorized.
 */

export async function GET(req) {
  try {
    await db();

    //for pagination
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;

    const skip = (page - 1) * limit;

    // Get user from cookie
    const cookieHeader = req.headers.get("cookie") || "";
    const cookiesObj = parse(cookieHeader);
    const token = cookiesObj.authToken;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Fetch root folders and documents (parentFolderId/folderId = null)
    const folders = await Folder.find({
      parentFolderId: null,
      userId: userId,
    }).lean();

    const documents = await Document.find({
      folderId: null,
      userId: userId,
      status: "active",
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

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
        : "",
      size: doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : "",
      url: doc.fileUrl,
    }));

    const totalDocuments = await Document.countDocuments({
      folderId: null,
      userId: userId,
      status: "active",
    });

    const totalPages = Math.ceil(totalDocuments / limit);

    return NextResponse.json({
      folders: transformedFolders,
      documents: transformedDocuments,

      pagination: {
        currentPage: page,
        totalPages,
        totalDocuments,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });

  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
