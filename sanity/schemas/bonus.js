export default {
  name: 'bonus',
  title: 'Bonus',
  type: 'document',
  fields: [
    { name: 'session', title: 'Session', type: 'reference', to: [{ type: 'gameSession' }] },
    { name: 'player', title: 'Recipient', type: 'reference', to: [{ type: 'player' }] },
    { name: 'bonusType', title: 'Bonus Type', type: 'string' },
    { name: 'bonusLabel', title: 'Bonus Label', type: 'string' },
    { name: 'pointsPerPlayer', title: 'Points Per Player', type: 'number' },
    { name: 'discarderOnly', title: 'Discarder Only', type: 'boolean' },
    { name: 'discarder', title: 'Discarder', type: 'reference', to: [{ type: 'player' }] },
    {
      name: 'exchanges',
      title: 'Exchanges',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'from', type: 'string' },
            { name: 'to', type: 'string' },
            { name: 'amount', type: 'number' },
          ],
        },
      ],
    },
    { name: 'roundContext', title: 'Round Context', type: 'number' },
    { name: 'timestamp', title: 'Timestamp', type: 'datetime' },
  ],
}
