// Script to check if specified users have profiles with roles
const { createClient } = require('@supabase/supabase-js');

async function checkUserRoles() {
  // Supabase credentials
  const supabaseUrl = 'https://iufyuzmigirugcufrtvt.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Znl1em1pZ2lydWdjdWZydHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQyMDQ1MjcsImV4cCI6MjAyOTc4MDUyN30.JeEcCdOJ3ZUSDOFVZowkYaXs32rX2V9E9BErJUTkUeg';
  
  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Emails to check
  const emails = [
    'santos.joseph1998@gmail.com',
    'booklovers159@gmail.com'
  ];
  
  console.log('Checking user roles for:', emails.join(', '));
  
  for (const email of emails) {
    try {
      // Query profiles table for matching email
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email);
      
      if (error) {
        console.error(`Error querying profiles for ${email}:`, error.message);
        continue;
      }
      
      if (!data || data.length === 0) {
        console.log(`❌ No profile found for ${email}`);
      } else {
        const profile = data[0];
        console.log(`✅ Profile found for ${email}:`);
        console.log(`   ID: ${profile.id}`);
        console.log(`   Role: ${profile.role || 'No role assigned'}`);
        
        // If no role, we should assign one
        if (!profile.role) {
          console.log(`   ⚠️ This user has no role assigned! Should be set to 'agent'`);
        }
      }
    } catch (err) {
      console.error(`Error processing ${email}:`, err.message);
    }
  }
}

// Run the function
checkUserRoles()
  .then(() => console.log('Profile check completed'))
  .catch(err => console.error('Error running profile check:', err)); 