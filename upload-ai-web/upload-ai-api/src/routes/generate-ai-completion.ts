import { FastifyInstance } from "fastify";
import { createReadStream } from 'node:fs'
import { z } from 'zod'
import { prisma } from "../lib/prisma";
import { openai } from "../lib/openai";

export async function generateAICompletionRoute(app: FastifyInstance) {
  app.post('/ai/complete', async (req, reply) => {

    // Vamos definir um esquema de validação de dados, usando a biblioteca Zod.
    const bodySchema = z.object({
      videoId: z.string().uuid(),
      template: z.string(),
      temperature: z.number().min(0).max(1).default(0.5),
    })

    // Vamos desestruturar os dados do corpo da solicitação e;
    // vamos atribuir às variáveis correspondentes
    const { videoId, template, temperature } = bodySchema.parse(req.body)

    // Vamos procurar um vídeo no Banco de Dados com o id = videoId. 
    // Se não existir, gerar um erro. 
    // Se existir, continuar executando.
    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      }
    })

    // Caso a transcrição do vídeo não exista, gerar um erro.
    if (!video.transcription) {
      return reply.status(400).send({ error: "Video transcription was not generated yet." })
    }

    // Se tudo deu certo, vamos substituir o texto 'transcription' pela transcrição do vídeo real.
    const promptMessage = template.replace('{transcription}', video.transcription)

    //Agora, vamos fazer uma chamada para a OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-16k',
      temperature,
      messages: [
        { role: 'user', content: promptMessage },
      ]
    })

    // Por fim, vamos retornar a response
    return response
  })
}