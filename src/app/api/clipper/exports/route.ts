export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '4c81a4f5-1af3-46b7-9040-138a0f33e4c7';
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (!supabaseAdmin) {
      return NextResponse.json({ exports: [] });
    }

    const { data: exportsList, error } = await supabaseAdmin
      .from('clip_exports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('[Get Exports Error]:', error.message);
      return NextResponse.json({ exports: [] });
    }

    return NextResponse.json({ exports: exportsList || [] });
  } catch (err: any) {
    console.error('[Get Exports Error]:', err);
    return NextResponse.json({ exports: [] }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !supabaseAdmin) {
      return NextResponse.json({ error: 'ID inválido ou Supabase indisponível' }, { status: 400 });
    }

    // Get output_url to remove file from disk
    const { data: exportItem } = await supabaseAdmin
      .from('clip_exports')
      .select('output_url')
      .eq('id', id)
      .single();

    if (exportItem?.output_url) {
      const cleanPath = exportItem.output_url.replace(/^\//, '');
      const fullPath = path.join(process.cwd(), 'public', cleanPath);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (e) {
          console.warn('[Delete file warning]:', e);
        }
      }
    }

    const { error } = await supabaseAdmin
      .from('clip_exports')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error('[Delete Export Error]:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
