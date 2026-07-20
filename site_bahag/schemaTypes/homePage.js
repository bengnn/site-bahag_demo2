export default {
  name: 'homePage',
  title: 'Home Page Content',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero Section' },
    { name: 'vision', title: 'Our Vision' },
    { name: 'team', title: 'Directors' },
    { name: 'roles', title: 'Who We Need' },
  ],
  fields: [
    // --- HERO SECTION ---
    {
      name: 'heroTitle',
      title: 'Hero Main Title',
      type: 'string',
      group: 'hero'
    },
    {
      name: 'heroSubtitle',
      title: 'Hero Subtitle (Value Proposition)',
      type: 'text',
      rows: 3,
      group: 'hero'
    },
    {
      name: 'heroImage',
      title: 'Hero Background Image',
      type: 'image',
      options: { hotspot: true },
      group: 'hero'
    },
    {
      name: 'heroReassurance',
      title: 'Reassurance Text',
      type: 'string',
      group: 'hero'
    },

    // --- VISION SECTION ---
    {
      name: 'visionTitle',
      title: 'Vision Section Title',
      type: 'string',
      group: 'vision'
    },
    {
      name: 'visionText',
      title: 'Vision Main Text Description',
      type: 'text',
      rows: 5,
      group: 'vision'
    },
    {
      name: 'visionImage',
      title: 'Vision House Image',
      type: 'image',
      options: { hotspot: true },
      group: 'vision'
    },
    {
      name: 'visionVideoUrl',
      title: 'Presentation Video URL',
      type: 'url',
      description: 'Link from YouTube, Vimeo, etc.',
      group: 'vision'
    },

    // --- DIRECTORS SECTION (Array of profiles) ---
    {
      name: 'directors',
      title: 'Project Directors',
      type: 'array',
      group: 'team',
      of: [
        {
          type: 'object',
          name: 'directorProfile',
          title: 'Director Profile',
          fields: [
            { name: 'name', title: 'Full Name', type: 'string' },
            { name: 'role', title: 'Role / Designation', type: 'string' },
            { name: 'description', title: 'Short Bio', type: 'text', rows: 3 },
            { name: 'avatar', title: 'Avatar Photo', type: 'image', options: { hotspot: true } }
          ]
        }
      ]
    },

    // --- ROLES SECTION (Array of needed skillsets) ---
    {
      name: 'neededRoles',
      title: 'Open Profiles / Roles',
      type: 'array',
      group: 'roles',
      of: [
        {
          type: 'object',
          name: 'roleItem',
          title: 'Role Card',
          fields: [
            { name: 'icon', title: 'Emoji Icon', type: 'string', description: 'e.g., 📐, 🔨, 🎨' },
            { name: 'title', title: 'Role Title', type: 'string' },
            { name: 'description', title: 'Role Job Requirements', type: 'text', rows: 3 }
          ]
        }
      ]
    }
  ]
}