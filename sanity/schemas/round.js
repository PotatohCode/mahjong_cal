export default {
  name: 'round',
  title: 'Round',
  type: 'document',
  fields: [
    { name: 'session', title: 'Session', type: 'reference', to: [{ type: 'gameSession' }] },
    { name: 'roundNumber', title: 'Round Number', type: 'number' },
    { name: 'winner', title: 'Winner', type: 'reference', to: [{ type: 'player' }] },
    {
      name: 'winType',
      title: 'Win Type',
      type: 'string',
      options: { list: ['self_draw', 'discard'] },
    },
    { name: 'discarder', title: 'Discarder', type: 'reference', to: [{ type: 'player' }] },
    {
      name: 'taiBreakdown',
      title: 'Tai Breakdown',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'key', type: 'string' },
            { name: 'label', type: 'string' },
            { name: 'tai', type: 'number' },
            { name: 'count', type: 'number' },
          ],
        },
      ],
    },
    { name: 'totalTai', title: 'Total Tai', type: 'number' },
    {
      name: 'pointsExchanged',
      title: 'Points Exchanged',
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
    { name: 'timestamp', title: 'Timestamp', type: 'datetime' },
  ],
}
