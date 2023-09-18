// Importações do Fastify
import { fastify } from 'fastify'
import { fastifyCors } from '@fastify/cors'

// Importações das Rotas
import { getAllPromptsRoute } from './routes/get-all-prompts'
import { uploadVideoRoute } from './routes/upload-videos'
import { createTranscriptionRoute } from './routes/create-transcription'
import { generateAICompletionRoute } from './routes/generate-ai-completion'

const app = fastify()

// A seguinte configuração determina quais frontends podem fazer solicitação para este servidor.
// Em ambiente de produção, o origin deveria ser o endereço URL onde está hospedado nosso aplicativo web.
app.register(fastifyCors, {
  origin: '*'
})

// Criação das Rotas
app.register(getAllPromptsRoute)
app.register(uploadVideoRoute)
app.register(createTranscriptionRoute)
app.register(generateAICompletionRoute)

// Servidor
app.listen({
  port: 3333,
}).then(() => {
  console.log("HTTP Server running!")
})