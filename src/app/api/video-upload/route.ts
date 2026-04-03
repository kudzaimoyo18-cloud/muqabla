import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(`videos/${Date.now()}_${file.name}`, file, {
        contentType: file.type
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get public URL
    const { data: publicUrl } = supabase.storage
      .from('videos')
      .getPublicUrl(data.path)

    return NextResponse.json({
      success: true,
      videoUrl: publicUrl
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}