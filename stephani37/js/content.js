// ============================================================
//  EDIT ME — all party content lives here. No logic.
// ============================================================
window.PARTY = {
  guestOfHonor: 'Stephani',

  intro: {
    welcome: 'WELCOME TO',
    name: "BABY GIRL'S",
    number: '37',
    suffix: 'th',
    tagline: 'BIRTHDAY PARTY'
  },

  wifi: {
    ssid: 'BabyPenguin',
    password: 'sanjosewaco713'
  },

  music: {
    // Drop your entrance theme here (mp3 or m4a). Loops forever.
    src: 'assets/audio/theme.mp3',
    startAt: 0,            // seconds — skip a slow intro and hit the drop
    introVolume: 1.0,      // 0.0 – 1.0
    homeVolume: 0.35,      // volume ducks to this on the home hub
    keepPlayingOnHome: true
  },

  modules: [
    { id: 'gallery',   title: 'Photo Gallery',   blurb: 'Browse all photos & zoom in full-screen' },
    { id: 'quiz',      title: 'Stephani Quiz',   blurb: 'How well do you know the Birthday Girl?' }
  ],

  // Stephani Trivia Quiz Questions & Options
  quiz: [
    {
      question: "What is Stephani's favorite NHL team?",
      options: [
        "San Jose Sharks",
        "Vegas Golden Knights",
        "Anaheim Ducks",
        "Los Angeles Kings"
      ],
      correctIndex: 0
    },
    {
      question: "What is Stephani's ring finger size?",
      options: [
        "7.0",
        "7.5",
        "8.0",
        "8.5"
      ],
      correctIndex: 3
    },
    {
      question: "What does Stephani want for breakfast besides breakfast items?",
      options: [
        "Tacos or pizza",
        "Only breakfast items!",
        "A fresh salad",
        "Leftovers from dinner"
      ],
      correctIndex: 1
    },
    {
      question: "What is Stephani's favorite MLB team?",
      options: [
        "Oakland Athletics",
        "Los Angeles Dodgers",
        "San Francisco Giants",
        "San Diego Padres"
      ],
      correctIndex: 2
    },
    {
      question: "Stephani is half ___ and half ___:",
      options: [
        "Italian & Portuguese",
        "Italian & Irish",
        "Italian & Greek",
        "Italian & Spanish"
      ],
      correctIndex: 0
    }
  ],

  // Party timeline schedule displayed on intro overlay and menu corner
  timeline: [
    { time: '4:00 PM', event: 'Doors Open' },
    { time: '5:45 PM', event: 'Tacos Off The Grill' },
    { time: '7:00 PM', event: 'Birthday Cake' },
    { time: 'Later',   event: "Fire Pit & S'mores" }
  ],

  // High-Resolution Photo Gallery & Ambient Slideshow
  photos: [
    { src: 'assets/photos/stephani_1.jpg',   date: 'Birthday Smiles' },
    { src: 'assets/photos/stephani_2.jpg',   date: 'Casual Chic' },
    { src: 'assets/photos/stephani_3.jpg',   date: 'Sunshine Glow' },
    { src: 'assets/photos/stephani_4.jpg',   date: 'Stephani Radiance' },
    { src: 'assets/photos/stephani_5.jpg',   date: 'Party Vibes' },
    { src: 'assets/photos/stephani_6.jpg',   date: 'Golden Hour' },
    { src: 'assets/photos/stephani_7.jpg',   date: 'Celebration Moments' },
    { src: 'assets/photos/stephani_8.jpg',   date: 'Austin Outing' },
    { src: 'assets/photos/stephani_9.jpg',   date: 'Gorgeous Stephani' },
    { src: 'assets/photos/stephani_10.jpg',  date: 'Pure Happiness' },
    { src: 'assets/photos/stephani_11.jpg',  date: 'Birthday Girl • 37th' },
    { src: 'assets/photos/stephani_12.jpg',  date: 'Faire Day Elegance' },
    { src: 'assets/photos/stephani_13.jpg',  date: 'Festival Memories' },
    { src: 'assets/photos/stephani_14.jpg',  date: 'Adventures & Travels' },
    { src: 'assets/photos/stephani_22.jpg',  date: 'Sweet Moments' },
    { src: 'assets/photos/stephani_23.jpg',  date: 'Squad & Besties' }
  ],
  photoSlideshow: {
    intervalMs: 8000,    // Time between transitions (8 seconds)
    opacity: 0.32        // Subtle opacity so foreground UI remains crisp
  }
};
