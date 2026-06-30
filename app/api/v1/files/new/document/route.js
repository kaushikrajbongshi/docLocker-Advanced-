import { NextResponse } from "next/server";
import db from "@/utils/db";
import Document from "@/model/Document";
import { parse } from "cookie";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await db();

    // Get user from cookie
    const cookieHeader = req.headers.get("cookie") || "";
    const cookiesObj = parse(cookieHeader);
    const token = cookiesObj.authToken;
    
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Parse FormData
    const formData = await req.formData();
    const folderId = formData.get("folderId");
    const files = formData.getAll("documents");

    if (!files || files.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "No files provided" 
      }, { status: 400 });
    }

    const uploadedDocuments = [];

    for (const fileMeta of files) {
      // Here, `fileMeta` is expected to be a JSON string containing { name, url }
      const { name, url } = JSON.parse(fileMeta);

      if (!name || !url) {
        return NextResponse.json({ 
          success: false, 
          message: "Invalid file metadata format." 
        }, { status: 400 });
      }

      // Determine file type based on extension
      const fileExtension = name.split('.').pop().toLowerCase();
      let fileType;
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
        fileType = 'image';
      } else if (fileExtension === 'pdf') {
        fileType = 'pdf';
      } else {
        fileType = 'document';
      }

      // Save metadata to DB
      const document = await Document.create({
        name: name,
        fileUrl: url,
        size: null, // Size could be passed from frontend optionally
        type: fileType,
        folderId: (folderId === "null" || !folderId) ? null : folderId,
        userId: userId,
      });

      uploadedDocuments.push(document);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully registered ${uploadedDocuments.length} file(s)`,
      data: uploadedDocuments 
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Upload failed" 
    }, { status: 500 });
  }
};
