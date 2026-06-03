  import { defineConfig } from 'sanity'
  import { structureTool } from 'sanity/structure'
  import player from '../schemas/player'
  import gameSession from '../schemas/gameSession'
  import round from '../schemas/round'
  import bonus from '../schemas/bonus'

  export default defineConfig({
    name: 'mahjong-cal',
    title: 'Mahjong Calculator',
    projectId: 'uue44r63',
    dataset: 'production',
    plugins: [structureTool()],
    schema: {
      types: [player, gameSession, round, bonus],
    },
  })
