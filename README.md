# Brand Builder App

Imagine your product across billboards, newspapers, and social media with consistent visual identity.

## Overview

Brand Builder is a professional visualization tool that leverages the power of Gemini AI to help brand designers and product marketers see their products in real-world advertising contexts. By generating a consistent visual specification first, the app ensures that your product maintains its identity across different mediums.

## Features

- **Visual Consistency Engine**: Uses Gemini 3 Flash to create a detailed visual identity specification from your product description.
- **Multi-Medium Generation**: Renders your product in three distinct environments:
  - **Urban Billboard**: High-impact outdoor advertising.
  - **Print Editorial**: Premium newspaper advertisement layout.
  - **Social Presence**: Sleek, minimalist social media product shots.
- **Human-Free Imagery**: Hard-coded constraints ensure no people appear in the images, keeping the focus entirely on the product.
- **Brutalist UI**: A clean, high-contrast interface designed for professional use.

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Animations**: Motion (formerly Framer Motion)
- **Icons**: Lucide React
- **AI Models**: 
  - Gemini 3 Flash (for text reasoning and spec generation)
  - Gemini 2.5 Flash Image (Nano-Banana) (for high-quality image generation)

## Getting Started

### Prerequisites

- A Gemini API Key (configured via environment variables).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/aaaditt/brand-builder-app-gaistudio.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   Create a `.env` file and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Enter a detailed description of your product in the input field.
2. Click "Build Brand Identity".
3. Wait for the AI to generate the visual specification and the three medium-specific images.
4. View your brand showcase and the detailed visual identity spec at the bottom.

## License

Apache-2.0
