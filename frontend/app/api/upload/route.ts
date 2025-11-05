import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    // Log the incoming request for debugging
    console.log('Upload request received');
    
    // Get the form data
    const formData = await request.formData();
    
    // Get the file from form data
    const fileEntry = formData.get('image');
    const file = fileEntry && typeof fileEntry !== 'string' ? fileEntry as File : null;
    
    console.log('File from form data:', file ? {
      name: file.name,
      type: file.type,
      size: file.size
    } : 'No valid file found in form data');
    console.log('File from form data:', file ? {
      name: file.name,
      type: file.type,
      size: file.size
    } : 'No file found');

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded or file field is missing' }, 
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'products');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${timestamp}-${randomString}.${extension}`;
    const filepath = join(uploadsDir, filename);

    // Write file
    await writeFile(filepath, buffer);

    // Return the URL
    const imageUrl = `/uploads/products/${filename}`;
    
    return NextResponse.json({ 
      url: imageUrl,
      filename: filename 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
