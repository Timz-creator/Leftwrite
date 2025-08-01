# Leftwrite – AI Writing Assistant Chrome Extension

Leftwrite is a Chrome extension that helps writers craft articles more efficiently.  
Built with **React.js**, **Tailwind CSS** and powered by **Claude AI**, it offers real‑time writing suggestions and content generation directly in your browser.  
The extension handles user authentication through **Firebase** and manages paid subscriptions via **Stripe**, providing a smooth onboarding and billing experience.  
The project was developed as a freelance engagement between **15 December 2024** and **29 December 2024**.

## Features

* **AI‑powered writing assistance** – Integrates Anthropic’s Claude AI to generate on‑topic suggestions and sentences while you write, helping you overcome writer’s block and maintain flow.
* **Context‑aware content generation** – Request full paragraphs or outlines based on your current topic. Claude AI tailors its output to the context of your article.
* **Secure authentication** – Utilises Firebase Authentication for user logins and session management. Multiple sign‑in methods (email/password, email link and anonymous sign‑in) are supported via the `firebase/auth/web‑extension` entry point:contentReference[oaicite:0]{index=0}.
* **Subscription management** – Integrates Stripe to handle recurring payments, enabling a seamless upgrade path from the free tier to premium features.
* **Clean user interface** – A minimalist interface built with React and Tailwind CSS keeps the focus on your writing. The extension’s popup provides quick access to AI suggestions and account management.

## Technology stack

| Technology          | Purpose                                           |
|--------------------|---------------------------------------------------|
| **React.js**       | Builds the frontend interface of the extension    |
| **Tailwind CSS**   | Provides utility‑first styling for a clean layout |
| **Claude AI**      | Generates writing suggestions and content         |
| **Firebase**       | Handles authentication and user session data      |
| **Stripe**         | Manages subscriptions and secure payments         |
| **Manifest V3**    | Chrome extension manifest standard                |

## Getting started

### Prerequisites

* **Node.js** and **npm** installed on your development machine.
* A **Claude AI API key**, **Firebase configuration** and **Stripe API keys**. Create a `.env` file in the project root to store these secrets (see the `.env.example` if provided). Do **not** commit secrets to version control.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Timz-creator/Leftwrite.git
   cd leftwrite

