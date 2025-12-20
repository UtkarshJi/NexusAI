<script lang="ts">
  import { isLoading, sendMessage } from '../stores/chat';

  let inputValue = '';
  let inputElement: HTMLInputElement;

  $: canSend = inputValue.trim().length > 0 && !$isLoading;

  async function handleSubmit() {
    if (!canSend) return;
    
    const message = inputValue;
    inputValue = '';
    
    await sendMessage(message);
    
    // Focus input after sending
    inputElement?.focus();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }
</script>

<form class="input-form" on:submit|preventDefault={handleSubmit}>
  <div class="input-wrapper">
    <input
      bind:this={inputElement}
      bind:value={inputValue}
      on:keydown={handleKeydown}
      type="text"
      placeholder={$isLoading ? 'Agent is typing...' : 'Type your message...'}
      disabled={$isLoading}
      maxlength="2000"
      autocomplete="off"
    />
    
    <button 
      type="submit" 
      disabled={!canSend}
      aria-label="Send message"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 2L11 13" />
        <path d="M22 2L15 22L11 13L2 9L22 2Z" />
      </svg>
    </button>
  </div>
  
  <p class="input-hint">
    Press Enter to send • Max 2000 characters
  </p>
</form>

<style>
  .input-form {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .input-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--bg-secondary);
    border: 1px solid var(--bg-tertiary);
    border-radius: var(--radius-xl);
    padding: 4px 4px 4px 20px;
    transition: all var(--transition-fast);
  }

  .input-wrapper:focus-within {
    border-color: var(--primary);
    box-shadow: var(--shadow-glow);
  }

  input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text-primary);
    font-size: 15px;
    padding: 12px 0;
    font-family: inherit;
  }

  input::placeholder {
    color: var(--text-muted);
  }

  input:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  button {
    width: 44px;
    height: 44px;
    background: var(--user-bubble);
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--transition-fast);
    flex-shrink: 0;
  }

  button:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: var(--shadow-glow);
  }

  button:active:not(:disabled) {
    transform: scale(0.95);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  button svg {
    width: 20px;
    height: 20px;
    color: white;
  }

  .input-hint {
    text-align: center;
    font-size: 12px;
    color: var(--text-muted);
    margin: 0;
  }
</style>
