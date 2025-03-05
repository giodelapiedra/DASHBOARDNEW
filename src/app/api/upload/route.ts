import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getUploadsDir } from '@/lib/fileSystem';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Process the form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not supported. Please upload an image file (JPEG, PNG, GIF, WEBP)' },
        { status: 400 }
      );
    }
    
    // Get file extension
    const fileExtension = file.name.split('.').pop() || '';
    
    // Create unique filename
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    
    // Get uploads directory
    const uploadsDir = getUploadsDir();
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Write file to disk
    const filePath = path.join(uploadsDir, uniqueFilename);
    await writeFile(filePath, buffer);
    
    // Return the file URL
    const fileUrl = `/uploads/${uniqueFilename}`;
    
    return NextResponse.json({ 
      success: true, 
      fileUrl 
    });
    
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Set the maximum file size (10MB)
export const config = {
  api: {
    bodyParser: false,
    responseLimit: '10mb',
  },
}; 