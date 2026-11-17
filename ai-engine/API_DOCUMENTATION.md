# 📡 VICE CLIPPER — AI ENGINE API DOCUMENTATION

O **Vice Clipper AI Engine** é um microsserviço assíncrono e de alto desempenho construído em **Python 3.11+**, **FastAPI**, **Faster-Whisper**, **OpenCV** e **FFmpeg**, responsável pelo processamento audiovisual, análise semântica, cálculo do **VICE VIRAL SCORE (0-100)** e renderização em formato vertical 9:16 para TikTok, Instagram Reels e YouTube Shorts.

---

## 🏗️ 1. Arquitetura do Serviço

```
/ai-engine
  /app
    /api           # Rotas FastAPI (/jobs, /render, /health)
    /core          # Configurações, diretórios e cliente Supabase
    /models        # Schemas Pydantic tipados
    /services      # Metadados de vídeo, extração de áudio WAV e resolução de URLs
    /analyzers     # Análise semântica e cálculo do Vice Viral Score (0-100)
    /processors    # Reframe inteligente com OpenCV e renderização FFmpeg com .ass
    /utils         # Proteção contra ataques SSRF e validação de tokens
  /python          # Ambiente Python 3.11 embeddable independente
  /storage         # Diretório de trabalho para arquivos de áudio e buffers temporários
  main.py          # Ponto de entrada Uvicorn / FastAPI
  requirements.txt # Dependências do ecossistema
  .env.example     # Modelo de variáveis de ambiente
```

---

## 🔒 2. Autenticação & Segurança (SSRF Protection)

Todas as requisições entre o Gateway Next.js e o AI Engine exigem o header:
```http
X-AI-Engine-Key: <AI_ENGINE_API_KEY>
```

### Regras de Proteção contra SSRF
* Bloqueio estrito de endereços IP locais e privados (RFC 1918 e RFC 3927 - link-local `169.254.169.254`).
* Whitelist de domínios autorizados para ingestão de streaming:
  `youtube.com`, `youtu.be`, `twitch.tv`, `kick.com`, `supabase.co`.
* Tratamento de caminhos de arquivo locais seguros para testes locais autorizados.

---

## 🚀 3. Endpoints da API

### `GET /health`
Verifica a saúde do serviço, disponibilidade do FFmpeg, versão do OpenCV, tamanho do modelo Whisper e conexão com o Supabase.

#### Resposta (200 OK):
```json
{
  "status": "healthy",
  "service": "vice-clipper-ai-engine",
  "version": "1.0.0",
  "ffmpeg": {
    "path": "D:\\VICE CLIPS\\node_modules\\ffmpeg-static\\ffmpeg.exe",
    "available": true
  },
  "opencv": {
    "version": "5.0.0",
    "available": true
  },
  "whisper": {
    "model_size": "tiny",
    "device": "cpu",
    "compute_type": "int8"
  },
  "supabase": {
    "connected": true,
    "url": "https://kerkwjhuneardiexhnek.supabase.co"
  },
  "gemini": {
    "configured": false
  }
}
```

---

### `POST /api/jobs`
Inicia um trabalho assíncrono de análise inteligente de vídeo. O pipeline executa em segundo plano sem bloquear o servidor.

#### Requisição:
```json
{
  "source_video_url": "https://www.youtube.com/watch?v=QdBZY2fkU-0",
  "source_type": "url",
  "user_id": "4c81a4f5-1af3-46b7-9040-138a0f33e4c7",
  "is_live": false,
  "target_duration": "30-45",
  "keywords": ["perseguição", "tiroteio", "ação"]
}
```

#### Resposta (201 Created):
```json
{
  "id": "2a850a46-8e74-41a9-b5b3-9aef750275c8",
  "user_id": "4c81a4f5-1af3-46b7-9040-138a0f33e4c7",
  "source_video_url": "https://www.youtube.com/watch?v=QdBZY2fkU-0",
  "source_type": "url",
  "platform": "youtube",
  "is_live": false,
  "status": "pending",
  "progress": 0,
  "duration": 0.0,
  "current_stage": "Na fila de processamento...",
  "error_message": null,
  "metadata": {},
  "created_at": "2026-11-16T00:27:50.710615+00:00"
}
```

---

### `GET /api/jobs/{job_id}`
Consulta o status e o estágio em tempo real do trabalho.

#### Estágios Possíveis:
1. `downloading` (10%): Ingestão e validação do fluxo de mídia.
2. `extracting_audio` (25%): Extração de áudio WAV 16kHz mono de alta fidelidade.
3. `transcribing` (45%): Transcrição neural de falas e timestamps de palavras com Whisper.
4. `analyzing_context` (70%): Análise semântica e cálculo do Vice Viral Score (0-100).
5. `completed` (100%): Cortes gerados e salvos no banco.
6. `cancelled` (0%): Cancelado pelo usuário.
7. `failed`: Erro registrado.

---

### `POST /api/jobs/{job_id}/cancel`
Cancela um trabalho em andamento e limpa os arquivos temporários de áudio (`.wav`).

#### Resposta (200 OK):
```json
{
  "success": true,
  "job_id": "2a850a46-8e74-41a9-b5b3-9aef750275c8",
  "status": "cancelled"
}
```

---

### `GET /api/jobs/{job_id}/segments`
Retorna todos os segmentos e momentos virais detectados para o trabalho.

#### Resposta (200 OK):
```json
{
  "job_id": "2a850a46-8e74-41a9-b5b3-9aef750275c8",
  "segments": [
    {
      "id": "seg_01",
      "title": "💥 Clímax de Entrada & Ação Inicial",
      "description": "Trecho com alta taxa de retenção nos primeiros segundos.",
      "start_time": 3.7,
      "end_time": 33.7,
      "duration": 30.0,
      "viral_score": 93,
      "score_breakdown": {
        "hook": 23,
        "retention": 18,
        "emotion": 19,
        "clarity": 18,
        "shareability": 15
      },
      "score_explanation": "Gancho inicial de 23/25 com excelente retenção e clareza de contexto.",
      "category": "Ação & Fuga",
      "suggested_caption": "A POLÍCIA NÃO TEVE CHANCE NESSA FUGA! 🚓💥",
      "cues": []
    }
  ]
}
```

---

### `POST /api/render`
Renderiza o corte em formato vertical 9:16 (1080x1920) utilizando FFmpeg com legendas `.ass` e áudio AAC estéreo.

#### Modos de Enquadramento (`framing_mode`):
* `cover`: Preenche 100% da tela em 9:16 sem bordas e sem sombreado blur.
* `black-bars`: Mantém a proporção horizontal original com barras pretas limpas.
* `blur`: Adiciona desfoque cinematográfico de fundo (efeito GTA 6).

---

## 📊 4. Modelo de Pontuação VICE VIRAL SCORE (0 a 100)

O algoritmo calcula a pontuação baseado em critérios objetivos e comprovados de retenção:

| Pilar | Pontos Máximos | Critério de Avaliação |
| :--- | :--- | :--- |
| **Gancho Inicial** | **25 pts** | Intensidade nos primeiros 3 a 5 segundos, ausência de silêncios iniciais |
| **Potencial de Retenção** | **20 pts** | Ritmo de fala, cadência narrativa e continuidade da ação |
| **Emoção e Impacto** | **20 pts** | Picos acústicos, intensidade vocal e expressividade |
| **Clareza e Contexto** | **20 pts** | Histórias e discussões que possuem início, meio e fim sem frases cortadas |
| **Compartilhamento** | **15 pts** | Potencial de repostagem e gatilhos de engajamento social |

---

## 🛠️ 5. Como Executar o Motor Localmente

1. Navegue até a pasta `/ai-engine`:
   ```bash
   cd "D:\VICE CLIPS\ai-engine"
   ```

2. Inicialize o serviço com o Python embeddable incluído:
   ```powershell
   & ".\python\python.exe" -m uvicorn main:app --host 127.0.0.1 --port 8000
   ```

3. O serviço estará acessível em `http://127.0.0.1:8000` e integrado ao Next.js em `http://localhost:3000`.
