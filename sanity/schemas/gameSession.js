export default {
  name: 'gameSession',
  title: 'Game Session',
  type: 'document',
  fields: [
    {
      name: 'players',
      title: 'Players',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'player' }] }],
      validation: Rule => Rule.min(2).max(4),
    },
    { name: 'startingPoints', title: 'Starting Points', type: 'number', initialValue: 100 },
    { name: 'minTai', title: 'Minimum Tai', type: 'number', initialValue: 1 },
    { name: 'maxTai', title: 'Maximum Tai', type: 'number', initialValue: 5 },
    { name: 'base', title: 'Base Points', type: 'number', initialValue: 2 },
    { name: 'shooterPay', title: 'Shooter Pay', type: 'boolean', initialValue: false },
    { name: 'startedAt', title: 'Started At', type: 'datetime' },
    { name: 'completedAt', title: 'Completed At', type: 'datetime' },
    { name: 'winnerId', title: 'Winner ID', type: 'string' },
  ],
}
