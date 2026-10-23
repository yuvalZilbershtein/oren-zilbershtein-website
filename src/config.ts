/**
 * All the site's text lives here (except places and testimonials, which have
 * their own files in src/content/). Edit the words between the quotes.
 * Lines marked ✏️ are placeholders waiting for the real details.
 */
export const site = {
  name: 'Oren Zilbershtein',
  role: 'Pastry Chef & Culinary Consultant',
  tagline: 'Culinary consulting for businesses', // from the logo: ייעוץ קולינרי לעסקים
  yearsOfExperience: 25,
  basedIn: 'Israel',

  hero: {
    tagline: 'Twenty-five years of pastry craft, now shared with kitchens around the world.',
    intro:
      'I help hotels, bakeries, cafés and restaurants create pastries their guests remember — and build teams that make them perfectly, every day.',
    // Describes src/assets/chef/hero.jpg for screen readers and search engines.
    imageAlt: 'Oren Zilbershtein holding a tray of fresh cinnamon buns',
  },

  // Leave `value` empty to count automatically from the places on the site;
  // counted stats appear once they reach `min`.
  stats: [
    { value: '25+', label: 'Years as a pastry chef' },
    { value: '', label: 'Businesses consulted', auto: 'places', min: 3 },
    { value: '', label: 'Countries', auto: 'countries', min: 2 },
  ],

  about: {
    heading: 'From Israel’s kitchens to the world',
    // Describes src/assets/chef/about.jpg
    imageAlt: 'Oren Zilbershtein holding a stack of Jerusalem bagels',
    // ✏️ Replace with the real story: training, kitchens led, signature style, proudest moments.
    paragraphs: [
      'I’ve spent the last twenty-five years in professional pastry kitchens across Israel — creating, testing and perfecting desserts, and working alongside the teams who make them every day.',
      'Today I bring that experience to businesses around the world as a pastry consultant. Whether it’s a new opening, a dessert menu that needs a fresh start, or a team ready to raise its level, I work hands-on in your kitchen until the results speak for themselves.',
    ],
  },

  services: [
    {
      title: 'Menu & product development',
      text: 'New desserts, pastries and seasonal collections designed around your concept, your equipment and your guests.',
    },
    {
      title: 'Recipes & costing',
      text: 'Precise, scalable recipes with clear costing — so every batch tastes the same and every item earns its place.',
    },
    {
      title: 'Kitchen setup & workflow',
      text: 'Equipment planning, station layout and production schedules for new openings and growing kitchens.',
    },
    {
      title: 'Team training',
      text: 'Hands-on training that gives your team the technique and confidence to deliver consistently.',
    },
    {
      title: 'Openings & relaunches',
      text: 'Support from the first tasting to opening day — and through the weeks that follow.',
    },
    {
      title: 'Ongoing consulting',
      text: 'Regular visits or remote check-ins to keep quality high and the menu evolving.',
    },
  ],

  contact: {
    heading: 'Let’s create something delicious.',
    text: 'Opening a new place, refreshing a dessert menu or training a team? Tell me about your business and let’s see how I can help.',
    email: 'orenzil2812@gmail.com',
    whatsapp: '', // ✏️ Country code + number, digits only (e.g. 972 for Israel) — the button appears once filled in
    languages: ['Hebrew', 'English'], // ✏️
    // ✏️ Paste full profile links; leave '' to hide an icon.
    instagram: 'https://www.instagram.com/orenz10/',
    facebook: '',
    linkedin: '',
  },

  seo: {
    description:
      'Pastry chef with 25 years of experience in Israel, consulting hotels, bakeries, cafés and restaurants worldwide on menus, recipes, kitchens and teams.',
  },
};
