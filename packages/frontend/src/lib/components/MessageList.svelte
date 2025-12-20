<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import { messages, isLoading } from '../stores/chat';
  import MessageBubble from './MessageBubble.svelte';

  let messagesContainer: HTMLDivElement;
  let shouldAutoScroll = true;

  // Check if user is near bottom
  function handleScroll() {
    if (!messagesContainer) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
    shouldAutoScroll = scrollHeight - scrollTop - clientHeight < 100;
  }

  // Scroll to bottom when new messages arrive
  afterUpdate(() => {
    if (shouldAutoScroll && messagesContainer) {
      messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  });
</script>

<div 
  class="messages-container" 
  bind:this={messagesContainer}
  on:scroll={handleScroll}
>
  {#each $messages as message (message.id)}
    <MessageBubble {message} />
  {/each}

  {#if $isLoading}
    <div class="typing-indicator">
      <div class="typing-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <div class="typing-bubble">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .messages-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
    overflow-y: auto;
    padding-right: 8px;
  }

  /* Typing Indicator */
  .typing-indicator {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    animation: fadeIn 0.3s ease-out;
  }

  .typing-avatar {
    width: 32px;
    height: 32px;
    background: var(--bg-tertiary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .typing-avatar svg {
    width: 16px;
    height: 16px;
    color: var(--text-muted);
  }

  .typing-bubble {
    background: var(--ai-bubble);
    border: 1px solid var(--ai-bubble-border);
    border-radius: var(--radius-lg);
    border-bottom-left-radius: 4px;
    padding: 16px 20px;
  }

  .typing-dots {
    display: flex;
    gap: 4px;
  }

  .typing-dots span {
    width: 8px;
    height: 8px;
    background: var(--text-muted);
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out;
  }

  .typing-dots span:nth-child(1) {
    animation-delay: 0s;
  }

  .typing-dots span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-dots span:nth-child(3) {
    animation-delay: 0.4s;
  }
</style>
