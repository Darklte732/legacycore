import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Parse the incoming request body
    const body = await request.json();
    console.log('Chat proxy received:', body);
    
    // Ensure sessionId is included in logging
    if (body.sessionId) {
      console.log('Session ID:', body.sessionId);
    } else {
      console.log('No session ID provided');
      // Add a generated sessionId if not provided
      body.sessionId = `fallback_${Date.now()}`;
    }
    
    // Log if agent ID is present
    if (body.agentId) {
      console.log('Agent ID:', body.agentId);
    }
    
    try {
      // Forward the request to n8n webhook with proper error handling
      const n8nResponse = await fetch('https://n8n-mybh5-u38603.vm.elestio.app/webhook/AICHAT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      console.log('N8n status:', n8nResponse.status);
      
      // If webhook returns error status, handle it
      if (!n8nResponse.ok) {
        const errorText = await n8nResponse.text().catch(() => 'Unknown error');
        console.error(`N8n webhook error (${n8nResponse.status}):`, errorText);
        
        // Return a user-friendly error message
        return NextResponse.json({
          response: `I'm sorry, I'm having trouble processing your request right now. Please try again later. (Error: ${n8nResponse.status})`,
          error: true,
          sessionId: body.sessionId
        }, { status: 200 }); // Return 200 to client with error message rather than failing
      }
      
      // Get the response from n8n
      let responseData;
      
      // Get raw text response
      const text = await n8nResponse.text();
      console.log('Raw n8n response:', text);
      
      if (!text || !text.trim()) {
        // Empty response
        responseData = { 
          response: "I've received your message and am processing it." 
        };
      } else {
        // Try to parse as JSON
        try {
          const jsonData = JSON.parse(text);
          console.log('Parsed as JSON:', jsonData);
          
          // Check if it has a response field, if not, create one
          if (typeof jsonData === 'object' && jsonData !== null) {
            if (jsonData.response) {
              responseData = jsonData;
            } else if (jsonData.text || jsonData.message || jsonData.content) {
              // Try to find the response in common fields
              responseData = { 
                response: jsonData.text || jsonData.message || jsonData.content 
              };
            } else {
              // If it's an object without expected fields, stringify it
              responseData = { 
                response: `Response: ${JSON.stringify(jsonData)}`
              };
            }
          } else if (typeof jsonData === 'string') {
            // If it parsed to a string, use it directly
            responseData = { response: jsonData };
          } else {
            // Fallback for other types
            responseData = { 
              response: `Received: ${JSON.stringify(jsonData)}`
            };
          }
        } catch (e) {
          // If parsing fails, use the raw text
          console.log('Failed to parse as JSON, using raw text');
          responseData = { response: text };
        }
      }
      
      // Add sessionId back to the response for continuity
      if (body.sessionId && typeof responseData === 'object') {
        responseData.sessionId = body.sessionId;
      }
      
      console.log('Sending response to client:', responseData);
      
      // Return the response
      return NextResponse.json(responseData);
    } catch (fetchError) {
      console.error('Error connecting to n8n webhook:', fetchError);
      
      // Return a network error message
      return NextResponse.json({
        response: "I'm sorry, I couldn't connect to my knowledge service. Please check your network connection and try again.",
        error: true,
        sessionId: body.sessionId
      }, { status: 200 }); // Return 200 to client with error message rather than failing
    }
  } catch (error) {
    console.error('Error in chat proxy:', error);
    return NextResponse.json(
      { error: 'Failed to process request', response: "Sorry, I encountered an error processing your request." },
      { status: 200 } // Return 200 to client with error message rather than failing
    );
  }
}

// Also handle GET requests for health checks
export async function GET() {
  return NextResponse.json({ status: 'Chat API ready' });
} 