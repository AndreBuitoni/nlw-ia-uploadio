import { FileVideo, Upload } from "lucide-react";
import { Separator } from "./ui/separator";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { getFFmpeg } from "@/lib/ffmpeg";
import { fetchFile } from '@ffmpeg/util'

export function VideoInputForm() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const promptInputRef = useRef<HTMLTextAreaElement>(null)

  async function convertVideoToAudio(video: File) {
    console.log("Conversão iniciada.")
    const ffmpeg = await getFFmpeg()
    await ffmpeg.writeFile('input.mp4', await fetchFile(video))

    // Utilizar o código abaixo caso esteja ocorrendo algum erro, para ver o erro.
    // ffmpeg.on('log', log => {
    //   console.log(log)
    // })

    // O código abaixo mostra para nós como está a conversão do vídeo.
    ffmpeg.on('progress', progress => {
      console.log("Progresso da conversão: " + Math.round(progress.progress * 100))
    })

    // Os comandos abaixo especificam o que queremos que o ffmpeg execute.
    // Em resumo, iremos converter input.mp4 em output.mp3
    await ffmpeg.exec([
      '-i',
      'input.mp4',
      '-map',
      '0:a',
      '-b:a',
      '20k',
      '-acodec',
      'libmp3lame',
      'output.mp3'
    ])

    const data = await ffmpeg.readFile('output.mp3')

    const audioFileBlob = new Blob([data], { type: 'audio/mpeg'})
    const audioFile = new File([audioFileBlob], 'audio.mp3', {
      type: 'audio/mpeg',
    })

    console.log("Conversão finalizada.")

    return audioFile
  }

  async function handleUploadVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const prompt = promptInputRef.current?.value

    if (!videoFile) {
      return
    }

    //converter o vídeo em áudio
    const audioFile = await convertVideoToAudio(videoFile)

    console.log(audioFile, prompt)
  }

  function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.currentTarget


    if(!files) {
      return
    }

    const selectedFile = files[0]
    setVideoFile(selectedFile)
  }

  // Vamos criar um mecanismo para exibir uma prévia do vídeo enviado pelo usuário
  const previewURL = useMemo(() => {
    if(!videoFile) {
      return null
    }
    return URL.createObjectURL(videoFile)
  }, [videoFile])

  return (
    <form onSubmit={handleUploadVideo} className="space-y-6">
      <label
        htmlFor="video"
        className="relative border flex rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/10"
      >
        {previewURL ? (
          <video src={previewURL} controls={false} className="pointer-events-none absolute inset-0" />
        ) : (
          <>
            <FileVideo className="w-5 h-5" />
            Selecione um vídeo para upload
          </>
        )}

      </label>

      <input type="file" id="video" accept="video/mp4" className="sr-only" onChange={handleFileSelected} />

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="transcription_prompt">Prompt de transcrição</Label>
        <Textarea
          ref={promptInputRef}
          id="transcription_prompt"
          className="h-20 leading-relaxed resize-none"
          placeholder="Inclua palavras-chave mencionadas no vídeo separadas por vírgula (,)"
        />
      </div>

      <Button type="submit" className="w-full">
        Carregar Vídeo
        <Upload className="w-4 h-4 ml-2" />
      </Button>
    </form>
  );
}
