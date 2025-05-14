// Script to create or update user profiles with roles
const { createClient } = require('@supabase/supabase-js');

async function createUserProfiles() {
  // Supabase credentials
  const supabaseUrl = 'https://iufyuzmigirugcufrtvt.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Znl1em1pZ2lydWdjdWZydHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQyMDQ1MjcsImV4cCI6MjAyOTc4MDUyN30.JeEcCdOJ3ZUSDOFVZowkYaXs32rX2V9E9BErJUTkUeg';
  
  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Emails to process
  const emails = [
    'santos.joseph1998@gmail.com',
    'booklovers159@gmail.com'
  ];
  
  console.log('Ensuring user profiles for:', emails.join(', '));
  
  for (const email of emails) {
    try {
      // Step 1: Get user auth data by looking at existing users
      // Note: This part depends on having the auth user already created via sign-up or magic link
      
      // First check if profile already exists
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email);
      
      if (profileError) {
        console.error(`Error checking profile for ${email}:`, profileError.message);
        continue;
      }
      
      if (profileData && profileData.length > 0) {
        const profile = profileData[0];
        
        if (profile.role) {
          console.log(`✅ Profile for ${email} already exists with role: ${profile.role}`);
        } else {
          // Update existing profile with agent role
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              role: 'agent',
              updated_at: new Date().toISOString() 
            })
            .eq('id', profile.id);
          
          if (updateError) {
            console.error(`Error updating role for ${email}:`, updateError.message);
          } else {
            console.log(`✅ Updated profile for ${email} with role: agent`);
          }
        }
      } else {
        console.log(`ℹ️ No profile found for ${email}, need to create one.`);
        
        // To create a profile, we need the user's auth ID
        // Since we can't use admin functions, we'll try to get it another way
        // This approach is limited - in a real scenario, you'd use Supabase Admin API
        
        // For this demo, we'll try to find auth user by email from an existing auth session
        // NOTE: In a production environment, you should use proper admin APIs
        
        console.log(`⚠️ Cannot create profile for ${email} without admin access.`);
        console.log(`   Please ensure the user completes the signup or magic link flow.`);
        console.log(`   This will automatically create their profile.`);
      }
    } catch (err) {
      console.error(`Error processing ${email}:`, err);
    }
  }
}

// Run the function
createUserProfiles()
  .then(() => console.log('Profile creation/update completed'))
  .catch(err => console.error('Error running profile creation:', err)); 