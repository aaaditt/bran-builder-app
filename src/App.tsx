/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Layout, 
  Newspaper, 
  Share2, 
  Sparkles, 
  Loader2, 
  Image as ImageIcon,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Initialize Gemini API
// Note: process.env.GEMINI_API_KEY is injected by the platform
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type Medium = 'billboard' | 'newspaper' | 'social';

interface GeneratedImage {
  url: string;
  medium: Medium;
  prompt: string;
}

export default function App() {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [productSpec, setProductSpec] = useState<string | null>(null);

  const generateBrand = async () => {
    if (!description.trim()) return;

    setIsGenerating(true);
    setError(null);
    setImages([]);
    setProductSpec(null);

    try {
      // Step 1: Generate a detailed visual specification for the product to ensure consistency
      const specResponse = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Create a highly detailed visual description for a product based on this input: "${description}". 
        Focus on materials, colors, textures, branding elements, and unique design features. 
        Do NOT include any people in the description. 
        Keep it concise but vivid for an image generation model.`,
      });

      const spec = specResponse.text || description;
      setProductSpec(spec);

      const mediums: { type: Medium; promptSuffix: string; aspectRatio: "16:9" | "3:4" | "1:1" }[] = [
        { 
          type: 'billboard', 
          promptSuffix: "A high-end outdoor billboard advertisement in a clean, modern urban setting. Professional lighting, cinematic composition. No people.", 
          aspectRatio: "16:9" 
        },
        { 
          type: 'newspaper', 
          promptSuffix: "A professional print advertisement in a premium newspaper. High-contrast, elegant layout, clean typography. No people.", 
          aspectRatio: "3:4" 
        },
        { 
          type: 'social', 
          promptSuffix: "A sleek, minimalist social media product shot for Instagram. Soft studio lighting, aesthetic background. No people.", 
          aspectRatio: "1:1" 
        }
      ];

      const generatedResults: GeneratedImage[] = [];

      // Generate images sequentially to avoid rate limits and ensure stability
      for (const medium of mediums) {
        const fullPrompt = `A professional product photograph of: ${spec}. ${medium.promptSuffix} The product is the sole focus. Absolutely no people or human figures.`;
        
        const response = await genAI.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: fullPrompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: medium.aspectRatio,
            },
          },
        });

        let imageUrl = '';
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }

        if (imageUrl) {
          generatedResults.push({
            url: imageUrl,
            medium: medium.type,
            prompt: fullPrompt
          });
        }
      }

      setImages(generatedResults);
    } catch (err) {
      console.error("Generation error:", err);
      setError("Failed to generate brand visuals. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="border-b border-[#141414] p-6 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#141414] flex items-center justify-center rounded-sm">
            <Sparkles className="text-[#E4E3E0] w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tighter uppercase italic font-serif">Brand Builder</h1>
        </div>
        <div className="text-[10px] uppercase tracking-widest opacity-50 font-mono">
          Powered by Gemini Nano-Banana
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-12">
        {/* Input Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none uppercase">
                Imagine <br /> Your <span className="italic font-serif font-light">Product</span>
              </h2>
              <p className="text-lg opacity-70 max-w-md">
                Describe your product in detail. We'll generate a consistent visual identity across multiple mediums, ensuring your brand stands out without human distractions.
              </p>
            </div>

            <div className="bg-white border border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
              <div className="space-y-4">
                <label className="block text-[11px] uppercase tracking-widest font-bold opacity-50">Product Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., A sleek, matte black electric toothbrush with copper accents and a minimalist charging base..."
                  className="w-full h-32 bg-transparent border-b border-[#141414] focus:outline-none resize-none text-xl p-2 placeholder:opacity-20"
                />
                <button
                  onClick={generateBrand}
                  disabled={isGenerating || !description.trim()}
                  className="w-full bg-[#141414] text-[#E4E3E0] py-4 px-6 flex items-center justify-center gap-3 hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="uppercase tracking-widest font-bold">Generating Identity...</span>
                    </>
                  ) : (
                    <>
                      <span className="uppercase tracking-widest font-bold">Build Brand Identity</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {isGenerating && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 space-y-6"
            >
              <div className="relative">
                <Loader2 className="w-16 h-16 animate-spin text-[#141414]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#141414] rounded-full" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="uppercase tracking-widest font-bold text-sm">Crafting visual consistency</p>
                <p className="text-xs opacity-50 font-mono italic">Analyzing product specs & rendering mediums...</p>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 p-6 text-red-600 text-center uppercase tracking-widest font-bold text-sm mb-12"
            >
              {error}
            </motion.div>
          )}

          {images.length > 0 && !isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              <div className="flex items-end justify-between border-b border-[#141414] pb-4">
                <h3 className="text-3xl font-bold uppercase tracking-tighter">Brand Showcase</h3>
                <div className="text-[10px] uppercase tracking-widest opacity-50 font-mono">
                  3 Mediums Generated
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {images.map((img, idx) => (
                  <motion.div
                    key={img.medium}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group relative bg-white border border-[#141414] overflow-hidden shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] transition-all"
                  >
                    <div className="aspect-[4/5] relative overflow-hidden bg-[#f0f0f0]">
                      <img 
                        src={img.url} 
                        alt={img.medium} 
                        className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 left-4">
                        <div className="bg-[#141414] text-[#E4E3E0] px-3 py-1 text-[10px] uppercase tracking-widest font-bold rounded-sm flex items-center gap-2">
                          {img.medium === 'billboard' && <Layout className="w-3 h-3" />}
                          {img.medium === 'newspaper' && <Newspaper className="w-3 h-3" />}
                          {img.medium === 'social' && <Share2 className="w-3 h-3" />}
                          {img.medium}
                        </div>
                      </div>
                    </div>
                    <div className="p-6 border-t border-[#141414]">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-xl font-bold uppercase tracking-tight">
                          {img.medium === 'billboard' ? 'Urban Billboard' : 
                           img.medium === 'newspaper' ? 'Print Editorial' : 'Social Presence'}
                        </h4>
                        <button className="opacity-30 hover:opacity-100 transition-opacity">
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[11px] font-mono opacity-50 line-clamp-2 leading-relaxed italic">
                        {img.prompt}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {productSpec && (
                <div className="mt-24 p-12 bg-[#141414] text-[#E4E3E0] rounded-sm relative overflow-hidden">
                  <div className="relative z-10">
                    <h4 className="text-[11px] uppercase tracking-[0.3em] font-bold opacity-50 mb-6">Visual Identity Specification</h4>
                    <p className="text-2xl md:text-4xl font-serif italic font-light leading-tight max-w-4xl">
                      "{productSpec}"
                    </p>
                  </div>
                  <div className="absolute -right-20 -bottom-20 opacity-5 rotate-12">
                    <ImageIcon className="w-96 h-96" />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!isGenerating && images.length === 0 && (
          <div className="py-32 border border-dashed border-[#141414]/20 flex flex-col items-center justify-center text-center space-y-4 rounded-sm">
            <div className="w-16 h-16 bg-[#141414]/5 rounded-full flex items-center justify-center">
              <ImageIcon className="w-8 h-8 opacity-20" />
            </div>
            <div className="space-y-1">
              <p className="uppercase tracking-widest font-bold text-sm opacity-30">No Brand Generated Yet</p>
              <p className="text-xs opacity-20 max-w-xs">Enter a product description above to begin the visualization process.</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#141414] p-12 mt-24">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#141414] flex items-center justify-center rounded-sm">
                <Sparkles className="text-[#E4E3E0] w-4 h-4" />
              </div>
              <span className="font-bold uppercase tracking-tighter">Brand Builder</span>
            </div>
            <p className="text-[10px] opacity-40 uppercase tracking-widest">© 2026 Brand Identity Lab. All rights reserved.</p>
          </div>
          <div className="flex gap-12">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-30">Technology</p>
              <ul className="text-xs space-y-1 font-mono">
                <li>Gemini 3 Flash</li>
                <li>Nano-Banana 2.5</li>
                <li>React 19</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-30">Constraints</p>
              <ul className="text-xs space-y-1 font-mono">
                <li>No Humans</li>
                <li>Visual Consistency</li>
                <li>Multi-Medium</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
