import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Video from '@/lib/models/Video';
import { getServerSession } from 'next-auth';

// GET - Fetch all videos or active videos only
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';
    
    const query = activeOnly ? { isActive: true } : {};
    const videos = await Video.find(query).sort({ order: 1, createdAt: -1 });
    
    return NextResponse.json({ success: true, videos }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch videos', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new video (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    const body = await request.json();
    const { title, videoUrl, thumbnail, category, order, isActive } = body;
    
    if (!title || !videoUrl || !thumbnail) {
      return NextResponse.json(
        { success: false, message: 'Title, video URL, and thumbnail are required' },
        { status: 400 }
      );
    }
    
    const video = await Video.create({
      title,
      videoUrl,
      thumbnail,
      category: category || 'general',
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
    });
    
    return NextResponse.json(
      { success: true, message: 'Video created successfully', video },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating video:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create video', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update video order (bulk update)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    const body = await request.json();
    const { videos } = body;
    
    if (!Array.isArray(videos)) {
      return NextResponse.json(
        { success: false, message: 'Videos array is required' },
        { status: 400 }
      );
    }
    
    // Update order for each video
    const updatePromises = videos.map((video: any) =>
      Video.findByIdAndUpdate(video._id, { order: video.order })
    );
    
    await Promise.all(updatePromises);
    
    return NextResponse.json(
      { success: true, message: 'Video order updated successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating video order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update video order', error: error.message },
      { status: 500 }
    );
  }
}
