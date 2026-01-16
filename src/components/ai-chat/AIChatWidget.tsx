'use client';

import { useChat } from '@/lib/ai-chat/ChatContext';
import { chatWithAI } from '@/lib/ai-chat/chatWithAI';
import { ChatBar } from './ChatBar';
import { ChatModal } from './ChatModal';
import type { ContextualPill } from '@/lib/ai-chat/generateContextualPills';

interface AIChatWidgetProps {
  contextualPills?: ContextualPill[];
}

/**
 * AIChatWidget - Complete chat widget combining ChatBar and ChatModal
 *
 * Connects to ChatContext for state management.
 * Shows collapsed ChatBar by default, expands to ChatModal on click.
 */
export function AIChatWidget({
  contextualPills,
}: AIChatWidgetProps): React.JSX.Element {
  const {
    isExpanded,
    messages,
    inputValue,
    isLoading,
    expand,
    collapse,
    setInputValue,
    prefillInput,
    addMessage,
    setLoading,
  } = useChat();

  // Handle sending a message
  const handleSendMessage = async (content: string): Promise<void> => {
    // Add user message
    addMessage('user', content);
    setLoading(true);

    try {
      // Call the AI chat API
      const result = await chatWithAI(content);

      if (result.error) {
        addMessage(
          'assistant',
          `I'm sorry, I encountered an error: ${result.error}. Please try again.`
        );
      } else {
        addMessage('assistant', result.response);
      }
    } catch {
      addMessage(
        'assistant',
        'Sorry, something went wrong. Please check your API key is set and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle pill click - prefill input and expand
  const handlePillClick = (question: string): void => {
    prefillInput(question);
  };

  return (
    <>
      {/* Collapsed state */}
      <ChatBar
        onExpand={expand}
        onPillClick={handlePillClick}
        contextualPills={contextualPills}
      />

      {/* Expanded state */}
      <ChatModal
        isOpen={isExpanded}
        onClose={collapse}
        messages={messages}
        onSendMessage={handleSendMessage}
        inputValue={inputValue}
        onInputChange={setInputValue}
        isLoading={isLoading}
      />
    </>
  );
}

export default AIChatWidget;
