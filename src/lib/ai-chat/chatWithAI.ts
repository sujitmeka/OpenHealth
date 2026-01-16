/**
 * Chat with AI - Client-side function to send messages to the health AI
 *
 * Sends message to /api/chat endpoint which calls Anthropic Claude API
 * with the user's biomarker data as context.
 */

export interface ChatResponse {
  response: string;
  error?: string;
}

/**
 * Send a message to the health AI and get a response
 *
 * @param message - The user's message/question
 * @returns Promise with the AI's response or error
 */
export async function chatWithAI(message: string): Promise<ChatResponse> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      return {
        response: '',
        error:
          errorData.error ||
          `Request failed with status ${response.status}`,
      };
    }

    const data = (await response.json()) as { response: string };
    return { response: data.response };
  } catch (error) {
    // Network or parsing error
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to connect to AI';
    return {
      response: '',
      error: errorMessage,
    };
  }
}

/**
 * Stream a chat response from the AI
 *
 * Note: Current API doesn't support streaming, but this is here
 * for future implementation when streaming is added to the API.
 */
export async function* streamChatWithAI(
  message: string
): AsyncGenerator<string, void, unknown> {
  // For now, just get the full response and yield it
  const result = await chatWithAI(message);

  if (result.error) {
    yield `Error: ${result.error}`;
    return;
  }

  yield result.response;
}

export default chatWithAI;
