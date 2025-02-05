// worker.js
import { modelConfig } from "./config.js";
import { loadPipeline } from "./modelLoader.js";

// Función para generar un buffer WAV a partir de un array de muestras (Float32)
function createWavBuffer(samples, sampleRate) {
  const numChannels = 1;
  const bytesPerSample = 2; // PCM 16 bits
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
  return buffer;
}

let langDetector = null;
let translator = null;
let synthesizer = null;

// Función para cargar todos los modelos en paralelo
async function loadModels() {
  const ldPromise = loadPipeline(
    modelConfig.languageDetector.task,
    modelConfig.languageDetector.modelId,
    modelConfig.languageDetector.options,
    (progress) => postMessage({ type: "download-progress", model: "langDetector", progress })
  );
  const transPromise = loadPipeline(
    modelConfig.translator.task,
    modelConfig.translator.modelId,
    modelConfig.translator.options,
    (progress) => postMessage({ type: "download-progress", model: "translator", progress })
  );
  const ttsPromise = loadPipeline(
    modelConfig.tts.task,
    modelConfig.tts.modelId,
    modelConfig.tts.options,
    (progress) => postMessage({ type: "download-progress", model: "synthesizer", progress })
  );
  [langDetector, translator, synthesizer] = await Promise.all([
    ldPromise,
    transPromise,
    ttsPromise
  ]);
}

(async () => {
  try {
    await loadModels();
    postMessage({ type: "loaded" });
  } catch (err) {
    postMessage({ type: "error", data: "Error al cargar los modelos: " + err.message });
  }
})();

// Mapeo de códigos ISO (soportados por el modelo) a los códigos requeridos por el traductor
const langMap = {
  "ar": "arb_Arab", // Arabic
  "bg": "bul_Cyrl", // Bulgarian
  "de": "deu_Latn", // German
  "el": "ell_Grek", // Modern Greek
  "en": "eng_Latn", // English
  "es": "spa_Latn", // Spanish
  "fr": "fra_Latn", // French
  "hi": "hin_Deva", // Hindi
  "it": "ita_Latn", // Italian
  "ja": "jpn_Jpan", // Japanese
  "nl": "nld_Latn", // Dutch
  "pl": "pol_Latn", // Polish
  "pt": "por_Latn", // Portuguese
  "ru": "rus_Cyrl", // Russian
  "sw": "swh_Latn", // Swahili
  "th": "tha_Thai", // Thai
  "tr": "tur_Latn", // Turkish
  "ur": "urd_Arab", // Urdu
  "vi": "vie_Latn", // Vietnamese
  "zh": "zho_Hans"  // Chinese (Simplified)
};

onmessage = async (e) => {
  const { type, text } = e.data;
  if (type === "speak") {
    if (!langDetector || !translator || !synthesizer) {
      postMessage({ type: "error", data: "Los modelos aún no se han cargado." });
      return;
    }
    try {
      // ETAPA 1: Detección de idioma
      postMessage({ type: "stage", stage: "deteccion", status: "in-progress" });
      const detectionOutput = await langDetector(text);
      const detectedISO = detectionOutput[0]?.label || "en";
      const srcLang = langMap[detectedISO] || "eng_Latn";
      postMessage({ type: "stage", stage: "deteccion", status: "complete", detected: detectedISO, mapped: srcLang });

      // ETAPA 2: Traducción
      postMessage({ type: "stage", stage: "traduccion", status: "in-progress" });
      const translationOutput = await translator(text, { src_lang: srcLang, tgt_lang: "plt_Latn" });
      const translatedText = translationOutput[0].translation_text;
      postMessage({ type: "stage", stage: "traduccion", status: "complete", translation: translatedText });

      // ETAPA 3: Síntesis de audio (TTS)
      postMessage({ type: "stage", stage: "audio", status: "in-progress" });
      const ttsOutput = await synthesizer(translatedText);
      const wavBuffer = createWavBuffer(ttsOutput.audio, ttsOutput.sampling_rate);
      postMessage({ type: "stage", stage: "audio", status: "complete" });
      
      // Resultado final: se envía el buffer de audio junto con la traducción
      postMessage({ type: "result", data: wavBuffer, translation: translatedText }, [wavBuffer]);
    } catch (err) {
      postMessage({ type: "error", data: "Error al procesar: " + err.message });
    }
  }
};
    