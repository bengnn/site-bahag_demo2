export default {
  name: 'galleryItem',
  title: 'Chronological Gallery',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Caption / Description',
      type: 'string',
    },
    {
      name: 'image',
      title: 'Photo File',
      type: 'image',
      options: { hotspot: true }
    },
    {
      name: 'date',
      title: 'Date (Month / Year)',
      type: 'date',
      options: { dateFormat: 'YYYY-MM' }
    }
  ]
}