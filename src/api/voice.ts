// src/api/voice.ts
// Uses Vite env var: VITE_ELEVENLABS_API_KEY
// Replace VOICE_ID with any public ElevenLabs voice id you like
const VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // default sample voice

export async function speak(text: string): Promise<HTMLAudioElement> {
  const key = import.meta.env.VITE_ELEVENLABS_API_KEY;
  if (!key) throw new Error("Missing VITE_ELEVENLABS_API_KEY");

  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: "POST",
    headers: {
      "xi-api-key": key,
      "Content-Type": "application/json",
      "accept": "audio/mpeg"
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.7 }
    })
  });
  if (!r.ok) throw new Error("ElevenLabs TTS failed");
  const blob = await r.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  return audio;
}
