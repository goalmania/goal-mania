import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Video from '@/lib/models/Video';
import { getServerSession } from 'next-auth';

// GET - Fetch single video
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await context.params;
    
    const video = await Video.findById(id);
    
    if (!video) {
      return NextResponse.json(
        { success: false, message: 'Video not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, video }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching video:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch video', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update video (admin only)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const { id } = await context.params;
    
    const body = await request.json();
    const { title, videoUrl, thumbnail, category, order, isActive } = body;
    
    const video = await Video.findByIdAndUpdate(
      id,
      {
        title,
        videoUrl,
        thumbnail,
        category,
        order,
        isActive,
      },
      { new: true, runValidators: true }
    );
    
    if (!video) {
      return NextResponse.json(
        { success: false, message: 'Video not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Video updated successfully', video },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating video:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update video', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete video (admin only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const { id } = await context.params;
    
    const video = await Video.findByIdAndDelete(id);
    
    if (!video) {
      return NextResponse.json(
        { success: false, message: 'Video not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Video deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting video:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete video', error: error.message },
      { status: 500 }
    );
  }
}
