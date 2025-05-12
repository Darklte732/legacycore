import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  try {
    // Get the application ID from the request body
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Application ID is required' },
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
    
    // Delete the application from the database
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting application:', error);
      return NextResponse.json(
        { error: 'Failed to delete application' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Application deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error when deleting application:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 