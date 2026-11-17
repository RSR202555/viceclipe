export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const userId = searchParams.get('userId') || '4c81a4f5-1af3-46b7-9040-138a0f33e4c7';
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!supabaseAdmin) {
      return NextResponse.json({ jobs: [], segments: [] });
    }

    // If specific jobId requested, fetch its segments and details
    if (jobId) {
      const { data: job } = await supabaseAdmin
        .from('clip_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      const { data: segments, error: segError } = await supabaseAdmin
        .from('clip_segments')
        .select('*')
        .eq('job_id', jobId)
        .order('viral_score', { ascending: false });

      if (segError) {
        console.warn('[Get Segments Error]:', segError.message);
      }

      return NextResponse.json({
        job: job || null,
        segments: segments || [],
      });
    }

    // Otherwise list recent jobs
    const { data: jobs, error } = await supabaseAdmin
      .from('clip_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('[Get Jobs Supabase Error]:', error.message);
      return NextResponse.json({ jobs: [] });
    }

    return NextResponse.json({ jobs: jobs || [] });
  } catch (err: any) {
    console.error('[Get Jobs Error]:', err);
    return NextResponse.json({ jobs: [] }, { status: 500 });
  }
}
