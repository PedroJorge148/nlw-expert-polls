import fastify from 'fastify'
import { createPoll } from './routes/create-poll'
import { getPoll } from './routes/get-poll'
import { voteOnPoll } from './routes/vote-on-poll'
import fastifyCookie from '@fastify/cookie'
import fastifyWebsocket from '@fastify/websocket'
import { pollResults } from './ws/poll-results'

export const app = fastify()

app.register(fastifyCookie, {
  secret: 'polls-app-nlw-afonafoadnfsod',
  hook: 'onRequest',
})

app.register(fastifyWebsocket)

app.register(createPoll)
app.register(getPoll)
app.register(voteOnPoll)

app.register(pollResults)
