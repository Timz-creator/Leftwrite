import Anthropic from "@anthropic-ai/sdk";

// Initialize the Anthropic client with your API key
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
  dangerouslyAllowBrowser: true, // We'll handle this in the manifest
});

export interface ProcessedMessage {
  analysis: {
    contentAnalysis: {
      titleAndStructure: string;
      flowAndLogic: string;
      clarityImprovements: string[];
    };
    styleGuidance: {
      consistencyNotes: string;
      voiceAlignment: string;
      vocabularySuggestions: string[];
    };
    readabilityFeedback: {
      overallAssessment: string;
      structuralAdvice: string[];
      complexityReduction: string[];
    };
    actionableSteps: string[];
  };
}

export async function processUserText(
  userText: string
): Promise<ProcessedMessage | undefined> {
  try {
    console.log("Processing text with Anthropic:", userText);
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      temperature: 0.7,
      system: `
      You are a writing assistant that provides actionable advice to help writers improve their drafts. Your key tasks include:

      Content Analysis
      Review the title, subheadings, and main content for alignment, consistency, and logical flow.
      Offer specific suggestions to improve clarity and readability.

      Style Adaptation
      Analyze the writer's preferred style, including structure and vocabulary, and provide guidance on maintaining consistency.
      Tailor your advice to align with the writer's unique voice.

      Feedback for Writers
      Assess readability and flow, offering insights on how to make the text easier to understand from a reader's perspective.
      Provide advice on improving the structure, logical progression, and emphasis of ideas.
      Suggest simpler ways to phrase complex ideas without altering meaning.

      Guidance without Editing
      Focus solely on providing advice and actionable feedback.
      Respect the writer's creative intent and unique style by offering suggestions rather than returning an edited version of their draft.

      Your primary goal is to empower writers by offering clear and concise advice that enhances their ability to improve their own work.

      Return your response in this JSON format:
      {
        "analysis": {
          "contentAnalysis": {
            "titleAndStructure": "assessment of title and structure",
            "flowAndLogic": "assessment of flow and logic",
            "clarityImprovements": ["improvement 1", "improvement 2", "improvement 3"]
          },
          "styleGuidance": {
            "consistencyNotes": "notes about style consistency",
            "voiceAlignment": "assessment of voice alignment",
            "vocabularySuggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
          },
          "readabilityFeedback": {
            "overallAssessment": "overall readability assessment",
            "structuralAdvice": ["advice 1", "advice 2", "advice 3"],
            "complexityReduction": ["simplification 1", "simplification 2", "simplification 3"]
          },
          "actionableSteps": ["step 1", "step 2", "step 3", "step 4"]
        }
      }
      `,
      messages: [
        {
          role: "user",
          content: userText,
        },
      ],
    });
    console.log("Raw Anthropic response:", msg);

    // Safe way to extract content
    const responseContent = msg.content[0];
    console.log("Response content:", responseContent);

    const responseText =
      (responseContent as any).text ||
      (responseContent as any).value ||
      (responseContent as any).toString();
    console.log("Extracted response text:", responseText);

    if (!responseText) {
      throw new Error("No content found in the response");
    }

    try {
      // Clean the response text
      const cleanedText = responseText
        .replace(/[\n\r]/g, " ") // Replace newlines with spaces
        .replace(/\s+/g, " ") // Normalize spaces
        .replace(/[\u0000-\u001F]/g, ""); // Remove control characters

      // Parse the cleaned JSON
      const parsedResponse = JSON.parse(cleanedText) as ProcessedMessage;

      // Validate the response structure
      if (!parsedResponse.analysis) {
        throw new Error("Invalid response structure");
      }

      return parsedResponse;
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.log("Raw response:", responseText);
      return undefined;
    }
  } catch (error) {
    console.error("Error in processUserText:", error);
    return undefined;
  }
}
