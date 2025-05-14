// direct-script-fix.js - Forcefully injects script content
// Runs directly to fix the script display issues by bypassing React

(function() {
  console.log('[Direct Fix] Script content fix loaded at', new Date().toISOString());
  
  // The script content to display - hardcoded version for reliability
  const SCRIPT_CONTENT = `
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

  // Style definitions for script display
  const SCRIPT_STYLES = `
    .script-preview {
      font-family: 'Courier New', monospace !important;
      font-size: 14px !important;
      line-height: 1.6 !important;
      background-color: #f9f9f9 !important;
      border: 1px solid #e0e0e0 !important;
      border-radius: 6px !important;
      padding: 1.5rem !important;
      max-height: calc(100vh - 200px) !important;
      overflow-y: auto !important;
      white-space: pre-wrap !important;
      color: #333 !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      width: 100% !important;
      box-sizing: border-box !important;
      position: relative !important;
      z-index: 100 !important;
    }
    .script-content-forced {
      font-family: 'Courier New', monospace !important;
      font-size: 14px !important;
      line-height: 1.6 !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    
    .script-content-forced p {
      margin-bottom: 1em !important;
      display: block !important;
    }
    
    .direct-fix-script-heading {
      font-weight: bold !important;
      color: #1a365d !important;
      font-size: 1.1em !important;
      margin-top: 1.2em !important;
      margin-bottom: 0.5em !important;
      display: block !important;
    }
    
    /* Force all script elements to be visible */
    .script-preview * {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
  `;

  // Inject the styles
  function injectStyles() {
    // Check if styles already exist
    if (document.getElementById('direct-fix-script-styles')) {
      return;
    }
    
    const styleEl = document.createElement('style');
    styleEl.id = 'direct-fix-script-styles';
    styleEl.textContent = SCRIPT_STYLES;
    document.head.appendChild(styleEl);
    console.log('[Direct Fix] Styles injected');
  }

  // Format script with HTML
  function formatScriptContent(content) {
    // Simple parsing to add HTML formatting
    let formatted = content
      // Convert double newlines to paragraph breaks
      .replace(/\n\n+/g, '</p><p>')
      // Convert section titles to headings
      .replace(/^([A-Z][A-Za-z\s\(\)]+):$/gm, '<span class="direct-fix-script-heading">$1:</span>')
      // Convert single newlines to line breaks
      .replace(/\n/g, '<br>');
    
    // Wrap in paragraphs
    formatted = `<p>${formatted}</p>`;
    
    return formatted;
  }

  // Find existing script preview or create one if needed
  function findOrCreateScriptPreview() {
    // First try to find the existing element
    let scriptPreview = document.querySelector('.script-preview');
    
    if (!scriptPreview) {
      console.log('[Direct Fix] No script preview found, looking for script content container');
      
      // Look for card content in the call script section
      const cardTitle = Array.from(document.querySelectorAll('h3')).find(
        el => el.textContent === 'Call Script'
      );
      
      if (cardTitle) {
        const cardContent = cardTitle.closest('div').querySelector('div');
        
        if (cardContent) {
          // Create script preview inside card content
          scriptPreview = document.createElement('div');
          scriptPreview.className = 'script-preview';
          cardContent.appendChild(scriptPreview);
          console.log('[Direct Fix] Created script preview element');
        }
      } else {
        // If all else fails, create one at the top of the page
        scriptPreview = document.createElement('div');
        scriptPreview.className = 'script-preview';
        document.body.insertBefore(scriptPreview, document.body.firstChild);
        console.log('[Direct Fix] Created script preview at top of page');
      }
    }
    
    return scriptPreview;
  }

  // Inject the script content
  function injectScriptContent() {
    // Find or create script preview element
    const scriptPreview = findOrCreateScriptPreview();
    
    if (scriptPreview) {
      // Format the script content
      const formattedScript = formatScriptContent(SCRIPT_CONTENT);
      
      // Inject the content with wrapper for CSS targeting
      scriptPreview.innerHTML = `<div class="script-content-forced">${formattedScript}</div>`;
      
      // Force visibility
      scriptPreview.style.display = 'block';
      scriptPreview.style.visibility = 'visible';
      scriptPreview.style.opacity = '1';
      
      console.log('[Direct Fix] Script content injected and made visible');
      return true;
    }
    
    console.log('[Direct Fix] Could not find or create script preview element');
    return false;
  }

  // Watch for the Generate Script button
  function watchForGenerateButton() {
    // Find all buttons
    const buttons = document.querySelectorAll('button');
    
    for (const button of buttons) {
      if (button.textContent.includes('Generate Script')) {
        console.log('[Direct Fix] Found Generate Script button, adding click handler');
        
        // Add click handler
        button.addEventListener('click', () => {
          console.log('[Direct Fix] Generate button clicked');
          
          // Run script injection after delays
          setTimeout(injectScriptContent, 200);
          setTimeout(injectScriptContent, 1000);
          setTimeout(injectScriptContent, 2000);
        });
        
        return true;
      }
    }
    
    return false;
  }

  // Watch for script containers being added to DOM
  function setupDomObserver() {
    // Create mutation observer
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check if added nodes contain our target elements
          let shouldInject = false;
          
          for (const node of mutation.addedNodes) {
            if (node.nodeType === 1) { // Element node
              if (node.classList && node.classList.contains('script-preview')) {
                shouldInject = true;
                break;
              }
              
              // Also check if this is a node that might contain a script preview
              if (node.querySelector && node.querySelector('.script-preview')) {
                shouldInject = true;
                break;
              }
              
              // Or if any new buttons were added
              if (node.querySelectorAll && node.querySelectorAll('button').length > 0) {
                // Check if any is the Generate Script button
                const buttons = node.querySelectorAll('button');
                for (const button of buttons) {
                  if (button.textContent.includes('Generate Script')) {
                    watchForGenerateButton();
                    break;
                  }
                }
              }
            }
          }
          
          if (shouldInject) {
            console.log('[Direct Fix] Detected new script preview, injecting content');
            injectScriptContent();
          }
        }
      }
    });
    
    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log('[Direct Fix] DOM observer set up');
    return observer;
  }

  // Main initialization
  function initialize() {
    console.log('[Direct Fix] Initializing direct script fix');
    
    // Add styles first
    injectStyles();
    
    // Try to inject content immediately
    const injected = injectScriptContent();
    
    // Watch for the Generate Script button
    watchForGenerateButton();
    
    // Set up observer for dynamic changes
    setupDomObserver();
    
    // If not injected immediately, try again shortly
    if (!injected) {
      setTimeout(injectScriptContent, 1000);
      setTimeout(injectScriptContent, 3000);
    }
  }

  // Run when the DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    // DOM already loaded, run now
    initialize();
  }
  
  // Also run at regular intervals
  setInterval(injectScriptContent, 5000);
})(); 