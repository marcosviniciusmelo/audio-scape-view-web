# SoundScape 3D

Experiência audiovisual construída com Next.js (App Router), TypeScript, React Three Fiber, Three.js, TailwindCSS, Web Audio API e integração server-side com Gemini.

## Executando

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`, habilite o microfone e deixe a cena reagir ao ambiente.

## Variáveis de ambiente

Crie um arquivo `.env.local` opcional:

```bash
GEMINI_API_KEY=your_key
GEMINI_MODEL=gemini-2.5-flash
UNSPLASH_ACCESS_KEY=optional_unsplash_key
```

- Sem `GEMINI_API_KEY`, a aplicação usa inferência heurística local para gênero, humor, energia, cores e palavras-chave.
- Sem `UNSPLASH_ACCESS_KEY`, a rota de imagens usa URLs dinâmicas do Unsplash Source como fallback.

## Rotas API

- `POST /api/recognize`: recebe snippet de áudio + métricas FFT e retorna contexto musical.
- `POST /api/gemini`: encapsula a chamada ao Gemini no backend.
- `POST /api/images`: resolve imagens relacionadas ao contexto detectado.
