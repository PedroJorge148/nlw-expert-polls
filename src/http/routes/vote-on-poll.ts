import { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/prisma'
import z from 'zod'
import { randomUUID } from 'node:crypto'
import { redis } from '../../lib/redis'

export async function voteOnPoll(app: FastifyInstance) {
  app.post('/polls/:pollId/votes', async (request, reply) => {
    const voteOnPollBody = z.object({
      pollOptionId: z.string().uuid(),
    })

    const voteOnPollParams = z.object({
      pollId: z.string().uuid(),
    })

    const { pollOptionId } = voteOnPollBody.parse(request.body)
    const { pollId } = voteOnPollParams.parse(request.params)

    let { sessionId } = request.cookies

    if (sessionId) {
      const usePreviousVoteOnPoll = await prisma.vote.findUnique({
        where: {
          sessionId_pollId: {
            sessionId,
            pollId,
          },
        },
      })

      if (
        usePreviousVoteOnPoll &&
        usePreviousVoteOnPoll.pollOptionId !== pollOptionId
      ) {
        await prisma.vote.delete({
          where: {
            id: usePreviousVoteOnPoll.id,
          },
        })

        await redis.zincrby(pollId, -1, usePreviousVoteOnPoll.pollOptionId)
      } else if (usePreviousVoteOnPoll) {
        return reply
          .status(409)
          .send({ message: 'You already voted on this poll.' })
      }
    }

    if (!sessionId) {
      sessionId = randomUUID()

      reply.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        signed: true,
        httpOnly: true,
      })
    }

    await prisma.vote.create({
      data: {
        sessionId,
        pollId,
        pollOptionId,
      },
    })

    await redis.zincrby(pollId, 1, pollOptionId)

    return reply.status(201).send()
  })
}
