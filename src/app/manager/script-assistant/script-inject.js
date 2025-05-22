// Direct script-display fix with no dependencies
// This script can be loaded directly on the page to fix script display issues

(function() {
  console.log('[Direct Fix] Simple script display fix loaded');
  
  // Add essential styles for the script preview
  function addStyles() {
    const styles = document.createElement('style');
    styles.textContent = `
      .script-preview {
        font-family: 'Courier New', monospace !important;
        font-size: 14px !important;
        line-height: 1.6 !important;
        background-color: #f9f9f9 !important;
        border: 1px solid #e0e0e0 !important;
        border-radius: 6px !important;
        padding: 1.5rem !important;
        max-height: 100% !important;
        overflow-y: auto !important;
        white-space: pre-wrap !important;
        color: #333 !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
    `;
    document.head.appendChild(styles);
    console.log('[Direct Fix] Added styles');
  }
  
  // Initialize the script content with the provided script
  function initializeScriptContent() {
    const scriptPreview = document.querySelector('.script-preview');
    if (!scriptPreview) {
      console.log('[Direct Fix] No script preview element found');
      return;
    }
    
    // The script content we want to display (insurance script from the user)
    const scriptContent = `
Introduction:
Thank you for calling the life insurance department on a recorded line, this is ________.  Are you calling to set up a new life insurance policy or a final expense policy?


((if getting free vibes) The plans aren't free but they're made to be affordable for seniors on a fixed income. Is information on affordable life insurance/final expense coverage something you're looking for? 

(IF YES) Now, were you looking for anything specific or just wanting to see all your options?
And will this insurance policy be for yourself or a loved one as well?
And it looks like you're calling in from the state of ____, is that correct?
And who do I have the pleasure of speaking with, your first name and last name?
And what is your date of birth?
Do you have an active life insurance policy in place or is this your first time shopping for coverage?
(IF YES) Are you looking to leave a little more behind for the family or get a better rate on your current coverage?

SEND TEXT
Now, Do you accept texts at this number? Okay That's the number I'll be calling you back from incase we get disconnected and you can call me directly on that number as well. That way you don't have to keep calling the toll-free number and getting random agents, you can deal with me directly, okay? 


Let me go ahead and get started. In case you missed it, my name is agent name, the process here is pretty simple and easy, I'm a field underwriter for ALL 40 carriers in (STATE). So basically my job is just to go over your medical situation, see what you would be eligible for and then I'll be able to actually shop the rates across ALL the top carriers in (STATE) for you to see which one would give you the most affordable rate on coverage, does that make sense?



Health Questions:
Now I'm going to ask you the standard medical questions for all 40 carriers in the state. Have you ever been diagnosed or treated for any of the following medical conditions?
Any nicotine or tobacco usage?
Any lung disease, asthma, or COPD?
Heart attack, stroke, TIA, or stents?
Have you ever been diagnosed with congestive heart failure?
Blood clots?
Any cancers?
Diabetes or neuropathy or Amputation? (Pills and/or insulin?)
High blood pressure or high cholesterol?
Kidney or liver problems?
Thyroid disease?
Any treatment for anxiety, depression or bipolar?
Treatment needed for alcohol or drug abuse?
Walking or oxygen equipment?
Alzheimer's or dementia?
Any hospitalizations that resulted in a stay for over 24 hours within the past year?
Are you currently confined to a nursing home or skilled nursing facility?
Any other medications?
(If Applicable) Within the last 5 years have you had your license suspended or Revoked? DUI, DWI etc. or have had any felonies?
Current height & weight?
Confirm Bank or Direct Express
I want to double check and see if there may be any discounts available for you. For payment methods… Do you have a valid US bank account or just a direct express card? Is the bank an online one like Green Dot, Chime, or Cash App, or a local one like Wells Fargo, Chase, or a credit union?


The WHY (Negative Situation, Situation/Problem Awareness)
What has you looking around for life insurance… were you looking to cover funeral expenses or maybe leave some money behind for the family?  (Say this slow, and kind of confused, like you're trying to think of the words to use) 
(QUOTES/SHOPPING) Ok… most people when requesting this are usually looking to take care of the funeral expenses. Is it the same for you?
(IF FUNERAL) Burial or cremation?
Have you ever had to plan a funeral before?
Burial typically 10k-15k (Information from national funeral directors association)
Cremation 4k-8k (Information from national funeral directors association)
Who would be taking care of the funeral proceedings when you pass away?

Reiterate Their Why
Got it. Alright, just to make sure i'm understanding you correctly, you're wanting to take a look into a policy today that is going to protect (BENEFICIARY) so that when the time comes, he/she isn't financially burdened with any of your burial/cremation expenses, is that correct?


Presentation
Term VS Whole Life (**ONLY EXPLAIN IF PITCHING WHOLE)
When it comes to life insurance there's 2 different types of coverage: Term Life & Whole Life. 
Term Life Insurance: that's the one you see in those ads. Usually, you'll see things like $50K, $75K, or $100K of coverage for a cheaper monthly premium. But what they don't tell you in the ads is that it only lasts for a certain amount of time—sometimes 5 years, sometimes 10 years—and once that time is up, your coverage expires, and it doesn't refund the premiums or pay out the death benefit. That's why we don't recommend it.

Whole Life Insurance: lasts your whole entire life. All that means is it's 100% guaranteed to pay out to (BENEFICIARY) because it NEVER expires on you. On top of that, the coverage remains level for your entire life, meaning they can never make you pay more for the policy or reduce the coverage amount. 

Based on your situation we recommend Whole Life coverage. Do you agree?
Policy Options:
GIVE 3 OPTIONS. IF THEY'VE TOLD YOU AN AMOUNT OF COVERAGE THEY WERE INTERESTED IN, MAKE THAT ONE OF THE OPTIONS
Okay, so I've found the carrier that is coming in with the highest chance of approval at the lowest monthly premiums. Can you grab a pen and paper please?
Alright, so I have 3 options for you here
Option 1 (highest price)
Option 2 (middle price)
Option 3 (lowest price)

 (If Level)
All those options are immediate Day 1 coverage meaning when we get you qualified the coverage would pay out if you were to even pass the next day… god forbid!
 (If Graded or Modified or GI)
This coverage would increase in value over the first two years. Reaching its full potential at the end of year two. God forbid you passed away in the first two years your family would receive a refund of the premiums paid plus 10%. This is better than any savings account you could set up. Also if you were to pass due to an accident in the first 2 years the full payout would be sent to your family. 
Close Question
Now, I'm just the initial underwriter, I don't give the final decision. Ultimately that's up to (CARRIER). But if we can get you approved, which option would make the most sense for you?
Transition Into Application
MOVE INTO THE APPLICATION WITHOUT PAUSING ONCE THEY PICK AN OPTION THEY ARE COMFORTABLE WITH.
I'm going to try my best to get you approved. The application only takes a few minutes. What address should we mail your policy packet out to? (CONTINUE WITH APPLICATION)
`;
    
    // Format the script with proper HTML and styling
    const formattedScript = scriptContent
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .trim();
    
    // Set the content with proper HTML structure
    scriptPreview.innerHTML = `<p>${formattedScript}</p>`;
    
    // Force script preview to be visible with proper styling
    scriptPreview.style.display = 'block';
    scriptPreview.style.visibility = 'visible';
    scriptPreview.style.opacity = '1';
    
    console.log('[Direct Fix] Script content updated');
  }
  
  // Apply fixes when Generate Script button is clicked
  function setupButtonListener() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      if (button.textContent.includes('Generate Script')) {
        console.log('[Direct Fix] Found Generate Script button, adding listener');
        button.addEventListener('click', () => {
          console.log('[Direct Fix] Generate Script button clicked');
          // Wait for React to update DOM, then apply our fix
          setTimeout(initializeScriptContent, 500);
          setTimeout(initializeScriptContent, 1000);
          setTimeout(initializeScriptContent, 2000);
        });
      }
    });
  }
  
  // Initialize immediately
  function initialize() {
    console.log('[Direct Fix] Initializing');
    addStyles();
    initializeScriptContent();
    setupButtonListener();
  }
  
  // Set up to run when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    // DOM already loaded, run now
    initialize();
  }
  
  // Also run at regular intervals to catch dynamic React updates
  setTimeout(initialize, 500);
  setTimeout(initialize, 1500);
  setTimeout(initialize, 3000);
  
  // Set up a periodic check to ensure script is displayed
  const checkInterval = setInterval(initializeScriptContent, 5000);
  setTimeout(() => clearInterval(checkInterval), 300000); // Stop after 5 minutes
})(); 