export default {
  name: 'siteSettings',
  title: 'Global Settings',
  type: 'document',
  fields: [
    {
      name: 'bannerText',
      title: 'Top Banner Announcement',
      type: 'string',
      description: 'Text displaying inside the permanent top alert bar.'
    },
    {
      name: 'bannerLinkText',
      title: 'Banner Link Text',
      type: 'string',
      description: 'Text for the action link (e.g., "Apply now").'
    }
  ]
}