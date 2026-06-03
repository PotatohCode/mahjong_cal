export default {
  name: 'player',
  title: 'Player',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string', validation: Rule => Rule.required() },
    { name: 'createdAt', title: 'Created At', type: 'datetime' },
  ],
}
