# 🚀 Visual Auto CRM - Next Gen Relationship Management

![Visual Auto CRM Banner](https://vvwdevbjtliztoeixinz.supabase.co/storage/v1/object/public/AVATAR/baniere.png)

**Visual Auto CRM** is a modern, high-performance Customer Relationship Management application built for speed, aesthetics, and efficiency. It features a stunning **Glassmorphism UI**, a fully integrated **Dark Mode**, and a unique AI Assistant with a... *colorful* personality.

---

## ✨ Key Features

### 📊 Interactive Dashboard
![Dashboard](https://vvwdevbjtliztoeixinz.supabase.co/storage/v1/object/public/AVATAR/Dashboard.png)
- **Real-time KPIs**: Track Total Revenue, Active Deals, Pending Tasks, and Meetings at a glance.
- **Visual Pipeline**: A beautiful progress bar widget showing the distribution of deals across stages.
- **Adaptive Widgets**: Automatically hides widgets that aren't relevant to your current workflow permissions.
- **Draggable Layout**: Customize your dashboard by dragging and dropping widgets to suit your style.

### 🔄 Workflows (Schemes)
![Workflow](https://vvwdevbjtliztoeixinz.supabase.co/storage/v1/object/public/AVATAR/Workflow.png)
- **Collaborative Spaces**: Create separate workspaces (Schemes) for different projects or teams.
- **Granular Permissions**: Define exactly what each workflow has access to (e.g., only Contacts and Debts, or everything).
- **Adaptive Dashboard**: The dashboard automatically hides widgets and KPIs that the current workflow doesn't have access to.
- **Easy Sharing**: Share a simple 6-character code to invite others to your workflow.
- **Admin Controls**: Admins can manage members and update permissions on the fly.

### 🤖 AI Assistant (Trevor Philips Edition)
![ChatAI](https://vvwdevbjtliztoeixinz.supabase.co/storage/v1/object/public/AVATAR/Chat.png)
- **Unique Persona**: Meet **Trevor**, your AI assistant inspired by GTA V. He's aggressive, vulgar, but surprisingly efficient.
- **Full Control**: Trevor can now **Read, Write, and Update** almost everything in the CRM (Contacts, Deals, Tasks, Events, Debts).
- **Profile & Settings**: Ask him to update your profile, change your password, or tweak your notification settings.
- **Navigation**: Tell him where you want to go ("Take me to settings", "Go to dashboard").
- **Voice & Text Commands**: "Add a contact", "Schedule a meeting", or just chat with him (at your own risk).
- **Context Aware**: He knows today's date, your schedule, and your CRM data.

### 💼 Deals Pipeline (Kanban)
![Deals](https://vvwdevbjtliztoeixinz.supabase.co/storage/v1/object/public/AVATAR/Deals.png)
- **Drag & Drop**: Move deals between stages (Lead, Qualified, Proposal, Negotiation, Won) effortlessly.
- **Visual Feedback**: Smooth animations and color-coded stages.
- **Quick Actions**: Add, edit, or delete deals on the fly.

### 👥 Contact Management
![Contact](https://vvwdevbjtliztoeixinz.supabase.co/storage/v1/object/public/AVATAR/contact.png)
- **Centralized Database**: Store all your contacts with details like Company, Role, Email, and Phone.
- **Smart Avatars**: Automatically assigns a default "Crew" image if none is provided.
- **Image Upload**: Upload custom profile pictures directly to Supabase storage.
- **Search & Filter**: Instantly find who you're looking for.
- **Direct Actions**: Call or email directly from the contact card.

### 💰 Debt Management (The Depts)
![Depts](https://vvwdevbjtliztoeixinz.supabase.co/storage/v1/object/public/AVATAR/depts.png)
- **Track Debts**: Keep track of who owes you money and how much.
- **Visual Status**: See at a glance if a debt is Lent, Partially Repaid, or Fully Repaid.
- **Reminders**: Set due dates and get notified when it's time to collect.
- **Drag & Drop**: Easily update status by moving cards between columns.

### ✅ Task Management (Missions)
![Task](https://vvwdevbjtliztoeixinz.supabase.co/storage/v1/object/public/AVATAR/Tasks.png)
- **Organize Missions**: Keep track of your to-dos with a sleek interface.
- **Priority Levels**: Mark tasks as High, Medium, or Low priority.
- **Reminders**: Set specific times for your tasks and get notified when they are due.

### 📅 Calendar (The Plan)
![Calendar](https://vvwdevbjtliztoeixinz.supabase.co/storage/v1/object/public/AVATAR/Calendar.png)
- **Schedule Events**: Manage your meetings and sit-downs.
- **Drag & Drop**: Easily reschedule events by dragging them to a new time slot.
- **Integration**: Events sync with your dashboard and AI assistant.

### 📈 Reports (Ledger)
![Ledger](https://vvwdevbjtliztoeixinz.supabase.co/storage/v1/object/public/AVATAR/Ledger.png)
- **Visual Analytics**: View detailed charts of your revenue and deal performance.
- **Time Filters**: Analyze data by Year, Month, Week, or Today.
- **Forecasts**: Get insights into your financial future.

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

## 📱 Notifications Setup (ntfy.sh)

Visual Auto CRM uses **ntfy.sh** for real-time notifications. Here is how to set it up for the first time:

### 1. Create a Topic
1.  Go to [ntfy.sh](https://ntfy.sh).
2.  Choose a unique topic name (e.g., `visual-crm-tony-123`).
    *   *Note: Topics are public, so choose something random/unique.*
3.  This will be your topic URL: `ntfy.sh/visual-crm-tony-123`.

### 2. Connect the App
1.  Open **Visual Auto CRM**.
2.  Go to **Settings** (Profile -> Settings).
3.  Enter your topic URL (e.g., `ntfy.sh/visual-crm-tony-123`) in the **Notification URL** field.
4.  Click **Save**.

### 3. Receive Notifications
*   **On Desktop**: Keep the ntfy.sh web page open or install the desktop app.
*   **On Mobile**:
    1.  Download the **ntfy** app (iOS/Android).
    2.  Click the `+` button to subscribe.
    3.  Enter your topic name (e.g., `visual-crm-tony-123`).
    4.  You will now receive push notifications for task reminders and workflow alerts!

---

## ⚠️ Warning

The AI Assistant (**Trevor**) uses strong language and has an aggressive personality. This is a design choice to make the CRM experience more entertaining. **User discretion is advised.**

---

Built with ❤️ (and a bit of rage) by **[Your Name/Team]**.
