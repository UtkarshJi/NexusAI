<script lang="ts">
  import type { ChatMessage } from '../stores/chat';

  export let message: ChatMessage;

  const isUser = message.sender === 'user';

  function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
</script>

<div class="message-row" class:user={isUser} class:ai={!isUser}>
  {#if !isUser}
    <div class="avatar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </div>
  {/if}
  
  <div class="message-content">
    <div class="bubble" class:error={message.isError}>
      <p>{message.text}</p>
    </div>
    <span class="timestamp">{formatTime(message.timestamp)}</span>
  </div>

  {#if isUser}
    <div class="avatar user-avatar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  {/if}
</div>

<style>
  .message-row {
    display: flex;
    gap: 8px;
    animation: fadeIn 0.3s ease-out;
  }

  .message-row.user {
    flex-direction: row-reverse;
  }

  .avatar {
    width: 32px;
    height: 32px;
    background: var(--bg-tertiary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    align-self: flex-end;
  }

  .avatar svg {
    width: 16px;
    height: 16px;
    color: var(--text-muted);
  }

  .user-avatar {
    background: var(--primary);
  }

  .user-avatar svg {
    color: white;
  }

  .message-content {
    max-width: 75%;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .user .message-content {
    align-items: flex-end;
  }

  .bubble {
    padding: 12px 16px;
    border-radius: var(--radius-lg);
    line-height: 1.5;
  }

  .ai .bubble {
    background: var(--ai-bubble);
    border: 1px solid var(--ai-bubble-border);
    border-bottom-left-radius: 4px;
    color: var(--text-primary);
  }

  .user .bubble {
    background: var(--user-bubble);
    border-bottom-right-radius: 4px;
    color: white;
  }

  .bubble.error {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
    color: #fca5a5;
  }

  .bubble p {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .timestamp {
    font-size: 11px;
    color: var(--text-muted);
    padding: 0 4px;
  }
</style>
