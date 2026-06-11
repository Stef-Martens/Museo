import type { Artwork } from "@/types";

export const ARTWORKS: Artwork[] = [
  {
    id: "mona-lisa",
    title: "Mona Lisa",
    artist: "Leonardo da Vinci",
    year: "1503–1519",
    description:
      "Portrait of Lisa Gherardini, wife of Florentine merchant Francesco del Giocondo. Famous for her enigmatic smile and Leonardo's sfumato technique.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg",
    museum: "Louvre Museum, Paris",
    location: { latitude: 48.8606, longitude: 2.3376, city: "Paris", country: "France" },
    period: "renaissance",
    whyItMatters:
      "The most visited painting in the world. Leonardo's mastery of light, anatomy, and psychology revolutionized portraiture and remains unmatched five centuries later.",
  },
  {
    id: "starry-night",
    title: "The Starry Night",
    artist: "Vincent van Gogh",
    year: "1889",
    description:
      "Swirling night sky over a quiet village, painted from memory during Van Gogh's stay at the Saint-Paul asylum in Saint-Rémy-de-Provence.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
    museum: "Museum of Modern Art, New York",
    location: { latitude: 40.7614, longitude: -73.9776, city: "New York", country: "USA" },
    period: "modern",
    whyItMatters:
      "Van Gogh transformed personal turmoil into universal beauty. Its expressive brushwork and emotional intensity made it the defining image of modern art.",
  },
  {
    id: "girl-pearl-earring",
    title: "Girl with a Pearl Earring",
    artist: "Johannes Vermeer",
    year: "c. 1665",
    description:
      "A young woman in exotic dress turns to gaze at the viewer over her shoulder, her luminous pearl earring catching the light.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/0f/1665_Girl_with_a_Pearl_Earring.jpg",
    museum: "Mauritshuis, The Hague",
    location: { latitude: 52.0804, longitude: 4.3142, city: "The Hague", country: "Netherlands" },
    period: "baroque",
    whyItMatters:
      "Often called the 'Mona Lisa of the North.' Vermeer's intimate portrayal and masterful use of light created one of history's most captivating gazes.",
  },
  {
    id: "great-wave",
    title: "The Great Wave off Kanagawa",
    artist: "Katsushika Hokusai",
    year: "c. 1831",
    description:
      "A towering wave threatens boats off the coast of Kanagawa, with Mount Fuji visible in the background beneath the foam.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/a/a5/Tsunami_by_hokusai_19th_century.jpg",
    museum: "British Museum, London",
    location: { latitude: 51.5194, longitude: -0.127, city: "London", country: "UK" },
    period: "contemporary",
    whyItMatters:
      "The most recognizable work of Japanese art. Hokusai's dynamic composition and Prussian blue pigment influenced Impressionists and pop culture alike.",
  },
  {
    id: "persistence-memory",
    title: "The Persistence of Memory",
    artist: "Salvador Dalí",
    year: "1931",
    description:
      "Melting clocks draped over a barren landscape, exploring the relativity of time and the subconscious mind.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/en/d/dd/The_Persistence_of_Memory.jpg",
    museum: "Museum of Modern Art, New York",
    location: { latitude: 40.7614, longitude: -73.9776, city: "New York", country: "USA" },
    period: "modern",
    whyItMatters:
      "Dalí's surrealist masterpiece made the subconscious visible. Its melting clocks became the universal symbol of dream logic and artistic rebellion.",
  },
  {
    id: "birth-venus",
    title: "The Birth of Venus",
    artist: "Sandro Botticelli",
    year: "c. 1485",
    description:
      "Venus emerges from the sea on a shell, blown ashore by Zephyr and welcomed by a Hora with a flowered cloak.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg",
    museum: "Uffizi Gallery, Florence",
    location: { latitude: 43.7678, longitude: 11.2553, city: "Florence", country: "Italy" },
    period: "renaissance",
    whyItMatters:
      "Botticelli revived classical mythology for Renaissance Florence. Its graceful lines and mythological subject defined the ideal of beauty for an era.",
  },
  {
    id: "water-lilies",
    title: "Water Lilies",
    artist: "Claude Monet",
    year: "1919",
    description:
      "Part of Monet's monumental series depicting his flower garden at Giverny, focusing on light, reflection, and atmosphere.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg",
    museum: "Art Institute of Chicago",
    location: { latitude: 41.8796, longitude: -87.6237, city: "Chicago", country: "USA" },
    period: "impressionism",
    whyItMatters:
      "Monet pushed Impressionism to its limits, dissolving form into pure color and light. These works paved the way for abstract art.",
  },
  {
    id: "scream",
    title: "The Scream",
    artist: "Edvard Munch",
    year: "1893",
    description:
      "A figure stands on a bridge clutching its face, mouth agape, against a blood-red sky — an icon of existential anguish.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_National_Gallery_Oslo.jpg",
    museum: "National Museum, Oslo",
    location: { latitude: 59.9169, longitude: 10.737, city: "Oslo", country: "Norway" },
    period: "modern",
    whyItMatters:
      "Munch captured modern anxiety before the world had words for it. The Scream became the face of human dread in the 20th century.",
  },
];

export function getArtworkById(id: string): Artwork | undefined {
  return ARTWORKS.find((a) => a.id === id);
}
