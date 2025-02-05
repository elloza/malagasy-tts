// config.js
export const modelConfig = {
    languageDetector: {
      task: "text-classification",
      modelId: "louisthomaspro/xlm-roberta-base-language-detection-onnx",
      options: {}
    },
    translator: {
      task: "translation",
      modelId: "Xenova/nllb-200-distilled-600M",
      options: {}
    },
    tts: {
      task: "text-to-speech",
      modelId: "elloza/mms-tts-mlg-onnx",
      options: { quantized: false }
    }
  };
  