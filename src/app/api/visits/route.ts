import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('visited_stores')
      .select('store_id');
      
    if (error) {
      throw error;
    }
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching visited stores:', error);
    return NextResponse.json({ error: 'Failed to fetch visited stores' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId, action } = body;

    if (!storeId || (action !== 'add' && action !== 'remove')) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    if (action === 'remove') {
      const { error } = await supabase.from('visited_stores').delete().eq('store_id', storeId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('visited_stores').insert([{ store_id: storeId }]);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error modifying visited stores:', error);
    return NextResponse.json({ error: 'Failed to modifiy store' }, { status: 500 });
  }
}
