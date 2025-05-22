// Fetch applications created by or assigned to this manager
async function fetchManagerApplications() {
  setLoading(true);
      
  try {
    // Get the user's role
    const { data: { user } } = await supabase.auth.getUser();
          
    if (!user) {
      throw new Error("User not authenticated");
    }
          
    // Get current manager ID
    const managerId = user.id;
          
    console.log(`Fetching applications for manager ID: ${managerId}`);
          
    // Try a simpler approach first - get all applications
    // This will help identify if the issue is with the query filters
    const { data, error } = await supabase
      .from('applications')
      .select('*');
          
    if (error) {
      console.error("Error fetching all applications:", error);
      throw error;
    }
          
    console.log(`Loaded ${data?.length || 0} total applications`);
          
    // Filter applications for this manager client-side
    const managerApplications = data?.filter(app => 
      app.manager_id === managerId || app.created_by === managerId
    );
          
    console.log(`Found ${managerApplications?.length || 0} applications for this manager`);
          
    // Add calculated fields
    const processedApplications = managerApplications?.map((app) => {
      // Calculate policy_health based on status
      let policyHealth = "Healthy";
      
      // Status mappings from policy values to user-friendly status
      if (app.status === 'Approved' || app.status === 'Live' || app.status === '1st Month Paid') {
        policyHealth = "Healthy";
      } else if (app.status === 'Pending' || app.status === 'In Progress' || app.status === 'Submitted') {
        policyHealth = "In Process";
      } else if (app.status === 'Needs Attention' || app.status === 'Incomplete' || app.status === 'Not Taken' || app.status === 'Lapsed') {
        policyHealth = "Needs Attention";
      } else if (app.status === 'Cancelled' || app.status === 'Declined') {
        policyHealth = "Cancelled";
      }
      
      // Special handling for pending status
      if (app.paid_status === 'Pending First Payment') {
        policyHealth = "Pending First Payment";
      }
      
      // Calculate annual premium if not already set
      let annualPremium = app.ap || null;
      
      if (!annualPremium && app.monthly_premium) {
        // Otherwise calculate it based on monthly premium
        let monthlyPremium = 0;
        
        if (app.monthly_premium) {
          monthlyPremium = typeof app.monthly_premium === 'number' ? 
            app.monthly_premium : 
            parseFloat(app.monthly_premium);
          annualPremium = monthlyPremium * 12;
        }
      }
      
      // Calculate commission if not set
      const calculatedCommission = app.commission_amount || 0;
      
      // Format created_at and other date fields consistently
      const createdAt = app.created_at ? new Date(app.created_at).toISOString() : null;
      
      return {
        ...app,
        policy_health: policyHealth, 
        ap: annualPremium,
        commission_amount: calculatedCommission,
        created_at: createdAt
      };
    }) || [];
    
    setApplications(processedApplications);
    console.log('All loaded applications:', processedApplications);
  } catch (err) {
    console.error('Error fetching applications:', err);
    toast({
      title: "Error",
      description: "Failed to load applications",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
} 