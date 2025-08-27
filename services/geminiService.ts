import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import type { Lead, VerificationResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


/**
 * A generic helper function to handle streaming responses from the Gemini API.
 * It parses incoming text chunks as individual JSON objects, resiliently handling
 * variations in formatting by tracking JSON structure.
 */
async function executeStreamQuery(
    prompt: string,
    config: any,
    onData: (data: any) => void,
    onComplete: () => void,
    onError: (error: Error) => void
) {
    try {
        const responseStream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: config,
        });

        let buffer = '';
        try {
            for await (const chunk of responseStream) {
                buffer += chunk.text;

                // Attempt to find and parse complete JSON objects in the buffer
                let jsonStart = buffer.indexOf('{');
                while (jsonStart !== -1) {
                    let braceLevel = 0;
                    let jsonEnd = -1;

                    // Find the corresponding closing brace for the object
                    for (let i = jsonStart; i < buffer.length; i++) {
                        if (buffer[i] === '{') {
                            braceLevel++;
                        } else if (buffer[i] === '}') {
                            braceLevel--;
                        }
                        if (braceLevel === 0 && i > jsonStart) {
                            jsonEnd = i;
                            break;
                        }
                    }

                    if (jsonEnd !== -1) {
                        // A complete object is found
                        const jsonString = buffer.substring(jsonStart, jsonEnd + 1);
                        try {
                            const parsed = JSON.parse(jsonString);
                            onData(parsed);
                        } catch (e) {
                            console.warn('Failed to parse a JSON object from stream:', jsonString);
                        }
                        // Remove the processed object from the buffer and look for the next one
                        buffer = buffer.substring(jsonEnd + 1);
                        jsonStart = buffer.indexOf('{');
                    } else {
                        // The object is incomplete, wait for more chunks
                        break;
                    }
                }
            }
        } catch (error) {
            console.error("Error consuming Gemini stream:", error);
            onError(new Error("An error occurred while reading the AI response."));
        }
    } catch (error) {
        console.error("Error in Gemini stream:", error);
        onError(new Error("An error occurred during the AI stream."));
    } finally {
        onComplete();
    }
}


const streamPromptInstructions = `
  **Crucial Instructions:**
  1.  **Verification is Key:** You MUST ONLY include businesses for which you can find BOTH a valid email address AND a valid phone number. Discard any leads missing either of these.
  2.  **Streaming JSON Output:** Return each result as a separate, single, minified JSON object. Do not wrap them in an array, a parent JSON object, or use markdown formatting like \`\`\`json.
  3.  **JSON Structure:** Each JSON object must have these exact keys: "company", "website", "email", "phone", "location", "social", "priority".
`;

export function generateLeadsStream(
  query: string,
  count: number,
  onLeadReceived: (lead: Lead) => void,
  onComplete: () => void,
  onError: (error: Error) => void
) {
  const prompt = `
    As a lead generation expert, find up to ${count} business leads for the query: "${query}".
    Use the Google Search tool to find current information.

    For each lead, gather the following details:
    - Company Name
    - Website URL
    - A valid contact email address
    - A valid phone number
    - The physical address or location
    - Social media profile links (e.g., LinkedIn, Twitter). If none are found, use an empty array.
    - A business priority ("High", "Medium", "Low") based on their potential as a sales opportunity.

    ${streamPromptInstructions}
  `;
  
  executeStreamQuery(
    prompt,
    { tools: [{ googleSearch: {} }], temperature: 0.2 },
    (lead) => onLeadReceived(lead as Lead),
    onComplete,
    onError
  );
}

export function generateStartupsStream(
  query: string,
  count: number,
  onStartupReceived: (startup: Lead) => void,
  onComplete: () => void,
  onError: (error: Error) => void
) {
  const prompt = `
    As an expert market researcher, your task is to identify up to ${count} startups and new local businesses based on the query: "${query}".
    You must ONLY return companies that are genuine startups, innovative ventures, or newly opened local businesses. Exclude established corporations.

    Use the Google Search tool extensively to find and verify this information. Look for signals that indicate a company is a startup, such as:
    - Founded within the last 5 years.
    - Mentions on tech news sites (e.g., TechCrunch), funding announcements, or product launch platforms (e.g., Product Hunt).
    - Company websites that describe themselves as innovative, disruptive, or a startup.

    For each business, gather the following details:
    - Company Name
    - Website URL
    - A valid contact email address (must be verified).
    - A valid phone number (must be verified).
    - The physical address or location.
    - Social media profile links (e.g., LinkedIn, Twitter). If none are found, use an empty array.
    - A business priority ("High", "Medium", "Low") based on their potential as a sales or investment opportunity.

    ${streamPromptInstructions}
  `;
  
  executeStreamQuery(
    prompt,
    { tools: [{ googleSearch: {} }], temperature: 0.2 },
    (startup) => onStartupReceived(startup as Lead),
    onComplete,
    onError
  );
}


export function generateLatestStartupsStream(
  onStartupReceived: (startup: Lead) => void,
  onComplete: () => void,
  onError: (error: Error) => void
) {
  const prompt = `
    As a market analyst, find 15 of the latest, most interesting, or trending startups from around the world across various sectors.
    Use the Google Search tool to find recent information. Prioritize companies that have recently launched, received funding, or are generating buzz.

    For each business, gather the following details:
    - Company Name
    - Website URL
    - A valid contact email address (must be verified).
    - A valid phone number (must be verified).
    - The physical address or location.
    - Social media profile links (e.g., LinkedIn, Twitter). If none are found, use an empty array.
    - A business priority ("High", "Medium", "Low") based on their investment potential or recent momentum.

    ${streamPromptInstructions}
  `;
  
  executeStreamQuery(
    prompt,
    { tools: [{ googleSearch: {} }], temperature: 0.5 },
    (startup) => onStartupReceived(startup as Lead),
    onComplete,
    onError
  );
}



// --- NON-STREAMING FUNCTIONS ---
const getGeminiError = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unknown error occurred.';
}

export async function generateAnalytics(query: string): Promise<string> {
    const prompt = `
    Provide a brief market analysis for a user looking for leads from the query "${query}".
    The tone should be encouraging and insightful for a salesperson.
    Structure the output as a single paragraph. Include insights on:
    - The general availability of public contact data.
    - The potential for a new business to "grab" clients (market saturation).
    - Common weaknesses these businesses might have (e.g., outdated websites).
    - A concluding sentence about the overall opportunity.
    Keep the entire response under 120 words.
  `;
   try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API for analytics:", error);
    throw new Error(getGeminiError(error));
  }
}

export async function generateStartupAnalytics(query: string): Promise<string> {
    const prompt = `
    Provide a brief market analysis for a user searching for startups in the "${query}" sector.
    The tone should be encouraging and insightful for an investor or entrepreneur.
    Structure the output as a single paragraph. Include insights on:
    - The current investment trend or "hype" in this sector.
    - The potential for market disruption by new, innovative players.
    - Common challenges these specific startups might face (e.g., funding, competition, scaling).
    - A concluding sentence about the overall investment or market opportunity in this niche.
    Keep the entire response under 120 words.
  `;
   try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API for startup analytics:", error);
    throw new Error(getGeminiError(error));
  }
}

export async function generateLeadAnalysis(lead: Lead): Promise<string> {
  const prompt = `
    Act as a sales development strategist. Analyze the following business lead and provide actionable insights for a sales team.
    Business Name: ${lead.company}
    Website: ${lead.website}
    Location: ${lead.location}

    Based on this information, provide the following, using markdown for formatting (e.g., **Headings** and lists):

    **Potential Opportunity:**
    A brief, sharp insight into how their business could be improved (e.g., "Their website lacks a clear call-to-action, making it hard for potential customers to convert.").

    **Email Subject Line:**
    A compelling, non-spammy subject line for a cold outreach email.

    **Short Email Draft:**
    A concise, personalized email (around 100 words). It should reference the opportunity you identified, introduce a relevant service, and end with a clear, low-friction call to action (like asking a simple question).
  `;
   try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API for lead analysis:", error);
    throw new Error(getGeminiError(error));
  }
}


export async function generateSearchSuggestions(
    query: string,
    context: 'leads' | 'startups'
): Promise<string[]> {
  if (query.length < 3) {
    return [];
  }
  
  const leadPrompt = `Based on the user's partial search for business leads: "${query}", generate up to 5 relevant autocompletion suggestions. The suggestions should follow the pattern of "industry in location".`;
  
  const startupPrompt = `Based on the user's partial search for startups or new businesses: "${query}", generate up to 5 relevant autocompletion suggestions. Suggestions should be creative and specific, like 'AI startups in SF', 'new cafes in Brooklyn', or 'fintech startups in London'.`;

  const prompt = context === 'startups' ? startupPrompt : leadPrompt;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["suggestions"],
        },
        temperature: 0.5,
        thinkingConfig: { thinkingBudget: 0 } 
      },
    });

    const responseText = response.text.trim();
    if (!responseText) return [];
    
    const parsed = JSON.parse(responseText);
    return parsed.suggestions || [];
  } catch (error) {
    console.error("Error generating search suggestions:", error);
    return []; // Return empty on error to not break the UI
  }
}

export async function verifyEmails(emails: string[]): Promise<VerificationResult[]> {
  const prompt = `
    As an email verification expert, analyze the following list of email addresses.
    For each email, determine its validity and classify its type.

    - **Status**: Mark as "Valid" if the email syntax is correct and the domain appears to be a legitimate, operational domain (not a known disposable email provider). Use Google Search to help verify domains if needed. Otherwise, mark as "Invalid".
    - **Type**: Classify as "Business" (a corporate or professional email), "Support" (generic, role-based emails like info@, contact@, support@), "Personal" (from public providers like gmail.com, yahoo.com), or "Unknown".
    - **Reason**: Provide a brief, one-sentence explanation for your status and type classification.

    List of emails to verify:
    ${emails.join('\n')}
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            results: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  email: { type: Type.STRING },
                  status: { type: Type.STRING },
                  type: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ["email", "status", "type", "reason"],
              },
            },
          },
          required: ["results"],
        },
      },
    });

    const responseText = response.text.trim();
    if (!responseText) return [];

    const parsed = JSON.parse(responseText);
    // Ensure the response matches the expected structure
    const verifiedResults = parsed.results.map((item: any) => ({
        ...item,
        status: ['Valid', 'Invalid'].includes(item.status) ? item.status : 'Invalid',
        type: ['Business', 'Support', 'Personal', 'Unknown'].includes(item.type) ? item.type : 'Unknown',
    }));
    return verifiedResults;

  } catch (error) {
    console.error("Error calling Gemini API for email verification:", error);
    throw new Error(getGeminiError(error));
  }
}