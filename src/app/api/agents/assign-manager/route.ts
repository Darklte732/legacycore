import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const { agentEmail, managerEmail } = await req.json();
    
    if (!agentEmail || !managerEmail) {
      return NextResponse.json(
        { error: 'Agent email and manager email are required' },
        { status: 400 }
      );
    }
    
    // Create Supabase client
    const supabase = createClient();
    
    // Get manager ID
    const { data: managerData, error: managerError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', managerEmail)
      .eq('role', 'manager')
      .single();
    
    if (managerError || !managerData) {
      return NextResponse.json(
        { error: `Manager not found: ${managerError?.message || 'Not found'}` },
        { status: 404 }
      );
    }
    
    // Update agent's manager_id
    const { data, error } = await supabase
      .from('profiles')
      .update({ manager_id: managerData.id })
      .eq('email', agentEmail)
      .eq('role', 'agent');
    
    if (error) {
      return NextResponse.json(
        { error: `Failed to update agent: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `Agent ${agentEmail} is now managed by ${managerEmail}`
    });
    
  } catch (error) {
    console.error('Error in assign-manager API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 