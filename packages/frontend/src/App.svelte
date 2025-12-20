<script lang="ts">
  import { onMount } from "svelte";
  import {
    messages,
    isLoading,
    loadHistory,
    sendMessage,
    clearConversation,
  } from "./lib/stores/chat";
  import MessageList from "./lib/components/MessageList.svelte";
  import ChatInput from "./lib/components/ChatInput.svelte";

  let hasLoaded = false;

  onMount(async () => {
    await loadHistory();
    hasLoaded = true;
  });

  // Handle quick question click - send the message directly
  function handleQuickQuestion(question: string) {
    sendMessage(question);
  }

  // Start a new chat
  function handleNewChat() {
    clearConversation();
  }
</script>

<div class="app-container">
  <!-- Header -->
  <header class="header">
    <div class="header-content">
      <div class="brand">
        <div class="logo">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            />
          </svg>
        </div>
        <div class="brand-text">
          <h1>TechGadgets Pro</h1>
          <span class="status">
            <span class="status-dot"></span>
            Support Chat
          </span>
        </div>
      </div>

      <!-- New Chat Button -->
      {#if $messages.length > 0}
        <button
          class="new-chat-btn"
          on:click={handleNewChat}
          title="Start a new chat"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Chat
        </button>
      {/if}
    </div>
  </header>

  <!-- Chat Container -->
  <main class="chat-container">
    {#if !hasLoaded}
      <div class="loading-screen">
        <div class="loading-spinner"></div>
        <p>Loading conversation...</p>
      </div>
    {:else if $messages.length === 0}
      <div class="welcome-screen">
        <div class="welcome-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <h2>Welcome to TechGadgets Pro Support</h2>
        <p>
          Hi there! 👋 I'm your AI support assistant. How can I help you today?
        </p>
        <div class="quick-questions">
          <p class="quick-label">Try asking:</p>
          <div class="quick-chips">
            <button
              on:click={() => handleQuickQuestion("What's your return policy?")}
            >
              What's your return policy?
            </button>
            <button on:click={() => handleQuickQuestion("Do you ship to USA?")}>
              Do you ship to USA?
            </button>
            <button
              on:click={() =>
                handleQuickQuestion("What are your support hours?")}
            >
              What are your support hours?
            </button>
          </div>
        </div>
      </div>
    {:else}
      <MessageList />
    {/if}
  </main>

  <!-- Input Area -->
  <footer class="input-container">
    <ChatInput />
  </footer>
</div>

<style>
  .app-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    max-width: 900px;
    margin: 0 auto;
    background: var(--bg-chat);
  }

  /* Header */
  .header {
    background: linear-gradient(
      180deg,
      var(--bg-secondary) 0%,
      var(--bg-primary) 100%
    );
    border-bottom: 1px solid var(--bg-tertiary);
    padding: 16px 20px;
    flex-shrink: 0;
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo {
    width: 44px;
    height: 44px;
    background: var(--user-bubble);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-glow);
  }

  .logo svg {
    width: 24px;
    height: 24px;
    color: white;
  }

  .brand-text h1 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--text-secondary);
  }

  .status-dot {
    width: 8px;
    height: 8px;
    background: #22c55e;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  /* New Chat Button */
  .new-chat-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: 1px solid var(--bg-tertiary);
    color: var(--text-secondary);
    padding: 8px 14px;
    border-radius: var(--radius-md);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .new-chat-btn:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border-color: var(--primary);
  }

  .new-chat-btn svg {
    width: 16px;
    height: 16px;
  }

  /* Chat Container */
  .chat-container {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }

  /* Loading Screen */
  .loading-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 16px;
    color: var(--text-secondary);
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--bg-tertiary);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Welcome Screen */
  .welcome-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    height: 100%;
    padding: 40px 20px;
    animation: fadeIn 0.5s ease-out;
  }

  .welcome-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    box-shadow: var(--shadow-glow);
  }

  .welcome-icon svg {
    width: 40px;
    height: 40px;
    color: white;
  }

  .welcome-screen h2 {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  .welcome-screen > p {
    color: var(--text-secondary);
    font-size: 16px;
    max-width: 400px;
    margin-bottom: 32px;
  }

  .quick-questions {
    width: 100%;
    max-width: 500px;
  }

  .quick-label {
    font-size: 13px;
    color: var(--text-muted);
    margin-bottom: 12px;
  }

  .quick-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }

  .quick-chips button {
    background: var(--bg-secondary);
    border: 1px solid var(--bg-tertiary);
    color: var(--text-secondary);
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .quick-chips button:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border-color: var(--primary);
  }

  /* Input Container */
  .input-container {
    padding: 16px 20px 24px;
    background: linear-gradient(
      180deg,
      transparent 0%,
      var(--bg-secondary) 50%
    );
    flex-shrink: 0;
  }
</style>
