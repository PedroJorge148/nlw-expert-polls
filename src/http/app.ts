import fastify from 'fastify'
import { createPoll } from './routes/create-poll'
import { getPoll } from './routes/get-poll'
import { voteOnPoll } from './routes/vote-on-poll'
import fastifyCookie from '@fastify/cookie'

export const app = fastify()

app.register(fastifyCookie, {
  secret: 'polls-app-nlw-afonafoadnfsod',
  hook: 'onRequest',
})

app.register(createPoll)
app.register(getPoll)
app.register(voteOnPoll)
