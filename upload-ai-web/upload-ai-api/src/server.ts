// Importações do Fastify
import { fastify } from 'fastify'

// Importações das Rotas
import { getAllPromptsRoute } from './routes/get-all-prompts'
import { uploadVideoRoute } from './routes/upload-videos'
import { createTranscriptionRoute } from './routes/create-transcription'
import { generateAICompletionRoute } from './routes/generate-ai-completion'

const app = fastify()

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