import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const type = searchParams.get('type') || 'summary';
  const startDate = searchParams.get('startDate') || new Date(new Date().setMonth(new Date().getMonth() - 12)).toISOString().split('T')[0];
  const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];
  const limit = parseInt(searchParams.get('limit') || '5');

  const supabase = createRouteHandlerClient({ cookies });

  try {
    // Get user profile to check role and organization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile including role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Make sure user is a manager
    if (profile.role !== 'manager') {
      return NextResponse.json({ error: 'Forbidden: Only managers can access analytics' }, { status: 403 });
    }

    const organizationId = profile.organization_id;

    // Different data based on the requested type
    let data = {};

    switch (type) {
      case 'summary':
        // Get policy and commission summary using secure functions
        const { data: policySummary, error: policyError } = await supabase
          .rpc('get_analytics_policy_summary', { org_uuid: organizationId });

        const { data: commissionSummary, error: commissionError } = await supabase
          .rpc('get_analytics_commission_summary', { org_uuid: organizationId });

        if (policyError || commissionError) {
          console.error('Policy error:', policyError);
          console.error('Commission error:', commissionError);
          return NextResponse.json({ error: 'Error fetching summary data' }, { status: 500 });
        }

        // Calculate totals for summary cards
        const totalPolicies = policySummary.reduce((sum, item) => sum + parseInt(item.total_policies), 0);
        const totalPremium = policySummary.reduce((sum, item) => sum + parseFloat(item.total_premium), 0);
        const totalCommissions = commissionSummary.reduce((sum, item) => sum + parseFloat(item.total_commissions || 0), 0);
        const approvalRate = totalPolicies > 0 
          ? policySummary.reduce((sum, item) => sum + parseInt(item.approved_policies), 0) / totalPolicies * 100 
          : 0;

        data = {
          summary: {
            totalPolicies,
            totalPremium,
            totalCommissions,
            approvalRate
          },
          policySummary,
          commissionSummary
        };
        break;

      case 'monthly':
        // Get monthly stats using the function
        const { data: monthlyStats, error: monthlyError } = await supabase
          .rpc('get_monthly_policy_stats', {
            org_uuid: organizationId,
            start_date: startDate,
            end_date: endDate
          });

        if (monthlyError) {
          console.error('Monthly stats error:', monthlyError);
          return NextResponse.json({ error: 'Error fetching monthly data' }, { status: 500 });
        }

        data = { monthlyStats };
        break;

      case 'carriers':
        // Get carrier performance using secure function
        const { data: carriers, error: carriersError } = await supabase
          .rpc('get_analytics_carrier_performance', { org_uuid: organizationId });

        if (carriersError) {
          console.error('Carriers error:', carriersError);
          return NextResponse.json({ error: 'Error fetching carrier data' }, { status: 500 });
        }

        // Sort carriers by total premium
        data = { carriers: carriers.sort((a, b) => parseFloat(b.total_premium) - parseFloat(a.total_premium)) };
        break;

      case 'agents':
        // Get top agents using secure function
        const { data: agents, error: agentsError } = await supabase
          .rpc('get_analytics_agent_performance', { org_uuid: organizationId });

        if (agentsError) {
          console.error('Agents error:', agentsError);
          return NextResponse.json({ error: 'Error fetching agent data' }, { status: 500 });
        }

        // Sort agents by total premium and limit results
        data = { 
          agents: agents
            .sort((a, b) => parseFloat(b.total_premium) - parseFloat(a.total_premium))
            .slice(0, limit)
        };
        break;

      case 'policies':
        // Get recent policies with status
        const { data: recentPolicies, error: policiesError } = await supabase
          .from('policies')
          .select(`
            id, 
            policy_number, 
            premium, 
            status, 
            submission_date, 
            effective_date,
            clients(first_name, last_name),
            products(name, carrier_id),
            carriers:products(name)
          `)
          .eq('organization_id', organizationId)
          .order('submission_date', { ascending: false })
          .limit(20);

        if (policiesError) {
          console.error('Policies error:', policiesError);
          return NextResponse.json({ error: 'Error fetching policy data' }, { status: 500 });
        }

        data = { recentPolicies };
        break;

      default:
        return NextResponse.json({ error: 'Invalid analytics type requested' }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 