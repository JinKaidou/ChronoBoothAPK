export interface HistoricalScene {
  id: string;
  name: string;
  description: string;
  prompt: string;
  thumbnail: string;
}

export const HISTORICAL_SCENES: HistoricalScene[] = [
  {
    id: 'egypt',
    name: 'Ancient Egypt',
    description: 'Standing before the Great Pyramids of Giza during the Old Kingdom.',
    prompt: 'Ancient Egypt during the construction of the Great Pyramids, with pharaohs, workers, and golden desert sands.',
    thumbnail: 'https://picsum.photos/seed/egypt/400/300'
  },
  {
    id: 'rome',
    name: 'Imperial Rome',
    description: 'A gladiator or citizen in the heart of the Roman Colosseum.',
    prompt: 'The Roman Colosseum at its peak, filled with spectators, marble statues, and Roman soldiers in armor.',
    thumbnail: 'https://picsum.photos/seed/rome/400/300'
  },
  {
    id: 'renaissance',
    name: 'Renaissance Italy',
    description: "In Leonardo da Vinci's workshop in 15th-century Florence.",
    prompt: "A 15th-century Renaissance workshop in Florence, filled with sketches, inventions, and oil paintings in the style of Leonardo da Vinci.",
    thumbnail: 'https://picsum.photos/seed/renaissance/400/300'
  },
  {
    id: 'victorian',
    name: 'Victorian London',
    description: 'Walking the foggy streets of 19th-century London.',
    prompt: 'Foggy streets of Victorian London in the late 1800s, with gas lamps, horse-drawn carriages, and people in top hats and corsets.',
    thumbnail: 'https://picsum.photos/seed/victorian/400/300'
  },
  {
    id: 'moon',
    name: '1969 Moon Landing',
    description: 'One small step for man, one giant leap for you.',
    prompt: 'The 1969 lunar surface during the Apollo 11 mission, with the lunar module, the American flag, and the vast blackness of space.',
    thumbnail: 'https://picsum.photos/seed/moon/400/300'
  },
  {
    id: 'cyberpunk',
    name: 'Neo-Tokyo 2077',
    description: 'A neon-drenched future metropolis.',
    prompt: 'A futuristic cyberpunk city with neon signs, flying cars, and advanced technology in a rainy night setting.',
    thumbnail: 'https://picsum.photos/seed/cyberpunk/400/300'
  }
];
