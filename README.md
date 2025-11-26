# 🚀 Visual Auto CRM - Next Gen Relationship Management

![Visual Auto CRM Banner](https://vvwdevbjtliztoeixinz.supabase.co/storage/v1/object/public/AVATAR/baniere.png)

**Visual Auto CRM** is a modern, high-performance Customer Relationship Management application built for speed, aesthetics, and efficiency. It features a stunning **Glassmorphism UI**, a fully integrated **Dark Mode**, and a unique AI Assistant with a... *colorful* personality.

---

## ✨ Key Features

### 📊 Interactive Dashboard
- **Real-time KPIs**: Track Total Revenue, Active Deals, Pending Tasks, and Meetings at a glance.
- **Visual Pipeline**: A beautiful progress bar widget showing the distribution of deals across stages.
- **Draggable Widgets**: Customize your dashboard layout with drag-and-drop functionality.

### 🤖 AI Assistant (Trevor Philips Edition)
- **Unique Persona**: Meet **Trevor**, your AI assistant inspired by GTA V. He's aggressive, vulgar, but surprisingly efficient.
- **Voice & Text Commands**: "Add a contact", "Schedule a meeting", or just chat with him (at your own risk).
- **Smart Actions**: Trevor can create contacts, deals, tasks, and calendar events directly from your conversation.
- **Context Aware**: He knows today's date, your schedule, and your CRM data.

### 💼 Deals Pipeline (Kanban)
- **Drag & Drop**: Move deals between stages (Lead, Qualified, Proposal, Negotiation, Won) effortlessly.
- **Visual Feedback**: Smooth animations and color-coded stages.
- **Quick Actions**: Add, edit, or delete deals on the fly.

### 🔔 Notifications & Reminders
- **Ntfy Integration**: Receive real-time notifications on your phone or desktop via `ntfy.sh`.
- **Task Reminders**: Set specific times for your tasks and get notified when they are due.
- **Workflow Alerts**: Get notified about important workflow updates.

### 👥 Contact Management
- **Centralized Database**: Store all your contacts with details like Company, Role, Email, and Phone.
- **Smart Avatars**: Automatically assigns a default "Crew" image if none is provided.
- **Image Upload**: Upload custom profile pictures directly to Supabase storage.
- **Search & Filter**: Instantly find who you're looking for.
- **Direct Actions**: Call or email directly from the contact card.

### 📈 Reports & Analytics
- **Revenue Charts**: Visual breakdown of revenue over time (now with fixed calculation logic!).
- **Pipeline Analysis**: Detailed charts showing deal distribution and conversion rates.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite)
- **Styling**: Tailwind CSS (with custom Glassmorphism & Dark Mode)
- **Database & Auth**: Supabase
- **AI**: OpenAI GPT-4o (Custom System Prompt)
- **Charts**: Recharts
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React

---

## 🚀 Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/YOUR_USERNAME/visual-crm.git
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add your keys:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_key
    VITE_OPENAI_API_KEY=your_openai_key
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

---

## 🎨 UI/UX Highlights

- **Glassmorphism**: Translucent cards with background blur for a modern, premium feel.
- **Dark Mode First**: Designed natively for dark mode to reduce eye strain and look cool.
- **Micro-interactions**: Subtle hover effects and transitions throughout the app.
- **Responsive Design**: Fully functional on mobile with a dedicated bottom navigation bar.

---

## ⚠️ Warning

The AI Assistant (**Trevor**) uses strong language and has an aggressive personality. This is a design choice to make the CRM experience more entertaining. **User discretion is advised.**

---

Built with ❤️ (and a bit of rage) by **[Your Name/Team]**.
