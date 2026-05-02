import type { CategoryMeta } from './types'

export const CATEGORIES: CategoryMeta[] = [
  { id: 'sound-buttons', label: 'Sound Buttons', emoji: '🔘', description: 'Interactive sound buttons and audio clips', color: '#3b82f6', textColor: '#ffffff', borderColor: '#2563eb', slug: 'sound-buttons' },
  { id: 'meme',      label: 'Meme',         emoji: '😂', description: 'Viral internet meme sounds and classic clips', color: '#f5c518', textColor: '#1a1400', borderColor: '#e6b800', slug: 'meme' },
  { id: 'discord',   label: 'Discord',      emoji: '🎮', description: 'Discord notification sounds and server audio', color: '#5865f2', textColor: '#ffffff', borderColor: '#4752c4', slug: 'discord' },
  { id: 'reaction',  label: 'Reactions',    emoji: '😱', description: 'Reaction sounds for every emotion and moment',  color: '#ef4444', textColor: '#ffffff', borderColor: '#dc2626', slug: 'reaction' },
  { id: 'gaming',    label: 'Gaming',       emoji: '🕹️', description: 'Video game sound effects and gaming moments',   color: '#22c55e', textColor: '#ffffff', borderColor: '#16a34a', slug: 'gaming' },
  { id: 'brainrot',  label: 'Brainrot',     emoji: '🧠', description: 'Italian brainrot, rizz, and viral Gen-Z sounds', color: '#a855f7', textColor: '#ffffff', borderColor: '#9333ea', slug: 'brainrot' },
  { id: 'culture',   label: 'Pop Culture',  emoji: '🎬', description: 'Movies, TV shows, celebrities and iconic moments', color: '#f97316', textColor: '#ffffff', borderColor: '#ea6d05', slug: 'culture' },
  { id: 'music',     label: 'Music',        emoji: '🎵', description: 'Musical clips, instrument sounds and jingles',   color: '#06b6d4', textColor: '#ffffff', borderColor: '#0891b2', slug: 'music' },
  { id: 'viral',     label: 'Viral',        emoji: '🔥', description: 'Trending viral sounds from across the internet', color: '#ec4899', textColor: '#ffffff', borderColor: '#db2777', slug: 'viral' },
  { id: 'whatsapp',  label: 'WhatsApp',     emoji: '📱', description: 'Popular WhatsApp voice messages and stickers',   color: '#25d366', textColor: '#ffffff', borderColor: '#1db954', slug: 'whatsapp' },
  { id: 'anime',     label: 'Anime',        emoji: '🎌', description: 'Anime character voices, openings and iconic scenes', color: '#f43f5e', textColor: '#ffffff', borderColor: '#e11d48', slug: 'anime' },
  { id: 'movies',    label: 'Movies',       emoji: '🎥', description: 'Famous movie quotes and cinematic sound effects', color: '#8b5cf6', textColor: '#ffffff', borderColor: '#7c3aed', slug: 'movies' },
  { id: 'sports',    label: 'Sports',       emoji: '⚽', description: 'Sports commentary, goals and crowd reactions',   color: '#10b981', textColor: '#ffffff', borderColor: '#059669', slug: 'sports' },
  { id: 'politics',  label: 'Politics',     emoji: '🏛️', description: 'Political speeches and memorable moments',       color: '#6366f1', textColor: '#ffffff', borderColor: '#4f46e5', slug: 'politics' },
  { id: 'pranks',    label: 'Pranks',       emoji: '😈', description: 'Prank sounds perfect for trolling your friends',  color: '#f59e0b', textColor: '#ffffff', borderColor: '#d97706', slug: 'pranks' },
  { id: 'sfx',       label: 'Sound Effects',emoji: '💥', description: 'Classic sound effects for any situation',        color: '#64748b', textColor: '#ffffff', borderColor: '#475569', slug: 'sound-effects' },
  { id: 'ai-voices', label: 'AI Voices',    emoji: '🤖', description: 'AI-generated voices powered by FlashTTS',       color: '#f5c518', textColor: '#1a1400', borderColor: '#e6b800', slug: 'ai-voices' },
]

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]))

export function getCategoryMeta(id: string): CategoryMeta {
  return CATEGORY_MAP[id] ?? {
    id: 'meme', label: id, emoji: '🔊',
    description: '', color: '#6b6b68',
    textColor: '#ffffff', borderColor: '#555552', slug: id,
  }
}
