import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  try {
    // Get the application IDs from the request body
    const { ids } = await request.json();
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Valid application IDs array is required' },
        { status: 400 }
      );
    }
    
    // Check if the user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check user role - only managers and admins can bulk delete
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
      
    if (!profile || (profile.role !== 'manager' && profile.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized: Only managers and admins can perform bulk operations' },
        { status: 403 }
      );
    }
    
    // Delete all the specified applications
    const { error } = await supabase
      .from('applications')
      .delete()
      .in('id', ids);
      
    if (error) {
      console.error('Error bulk deleting applications:', error);
      return NextResponse.json(
        { error: 'Failed to delete applications' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: `Successfully deleted ${ids.length} applications`,
        count: ids.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error during bulk delete:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 