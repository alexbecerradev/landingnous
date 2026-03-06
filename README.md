# Dark Mode & Chat Widget Walkthrough

## Features Added

### 1. Dark Mode Toggle
- **Toggle button** in navbar (moon/sun icon) with smooth CSS transitions
- **localStorage persistence** — theme survives page refresh
- **System preference detection** — defaults to OS dark/light setting
- All colors use CSS custom properties, overridden via `[data-theme="dark"]`

````carousel
![Light Mode](C:/Users/alex_/.gemini/antigravity/brain/6a4b9f20-68b2-4ec5-b017-ff63d43ed33e/initial_light_mode_1772719069562.png)
<!-- slide -->
![Dark Mode](C:/Users/alex_/.gemini/antigravity/brain/6a4b9f20-68b2-4ec5-b017-ff63d43ed33e/page_after_toggle_1772719077342.png)
````

---

### 2. Floating Chat Widget
- **FAB button** (bottom-right) opens/closes the chat
- **Chat window** with gradient header, AI avatar, minimize/close buttons
- **Auto-greeting**: *"Hi! I'm the automation assistant…"*
- **Message sending** with user/assistant bubbles and typing indicator
- **Minimizable** — collapse to just the header bar

````carousel
![Chat Open in Dark Mode](C:/Users/alex_/.gemini/antigravity/brain/6a4b9f20-68b2-4ec5-b017-ff63d43ed33e/chat_widget_open_1772719087493.png)
<!-- slide -->
![Chat Conversation](C:/Users/alex_/.gemini/antigravity/brain/6a4b9f20-68b2-4ec5-b017-ff63d43ed33e/chat_message_sent_final_1772719113409.png)
````

---

### 3. API Integration (Ready for n8n)

The [sendChatMessage()](file:///d:/DEV/Landing/src/App.jsx#101-129) function in [App.jsx](file:///d:/DEV/Landing/src/App.jsx#L106-L128) sends `POST /api/chat` with:
```json
{ "message": "user message", "session_id": "sess_uuid" }
```
Currently returns a placeholder response. Replace the function body to connect to your n8n webhook.

---

### 4. CTA Buttons Wired to Chat
All **"Get Started"**, **"Start Your Automation"**, and **"Book a Consultation"** buttons now open the chat widget.

---

## Files Modified

| File | Changes |
|------|---------|
| [index.css](file:///d:/DEV/Landing/src/index.css) | Added `[data-theme="dark"]` variables, body transition |
| [App.css](file:///d:/DEV/Landing/src/App.css) | Updated to use CSS vars for dark mode, added theme toggle + chat widget styles |
| [App.jsx](file:///d:/DEV/Landing/src/App.jsx) | Added [ThemeProvider](file:///d:/DEV/Landing/src/App.jsx#13-48), `ChatContext`, [ChatWidget](file:///d:/DEV/Landing/src/App.jsx#493-603), [sendChatMessage](file:///d:/DEV/Landing/src/App.jsx#101-129) API service |

## Recording

![Full feature verification recording](C:/Users/alex_/.gemini/antigravity/brain/6a4b9f20-68b2-4ec5-b017-ff63d43ed33e/verify_features_1772719047257.webp)
