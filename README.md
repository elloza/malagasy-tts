# Malagasy TTS: 

## Introduction and motivation 🎙️🌍

Malagasy TTS is a browser-based text-to-speech (TTS) application that synthesizes text into spoken Malagasy. It leverages the power of machine learning (ML) models to detect the input language, translate it into Malagasy, and generate audio output. This project aims to make TTS accessible to a wider audience, especially for languages with limited resources and tools.

The Malagasy language, spoken by over 20 million people in Madagascar and surrounding regions, is a prime example. With its simple, user-friendly interface, this project enables users to convert text into spoken Malagasy (a feature currently unavailable in services like Google Translate) directly in their browser. This approach eliminates the need for complex setups or cloud-based services, making TTS more accessible and inclusive.

## How to use 🚀🔊
## Demo on GitHub Pages 🌐

You can view a live demo of Malagasy TTS hosted on GitHub Pages:

[https://elloza.github.io/malagasy-tts/](https://elloza.github.io/malagasy-tts/)

Enjoy exploring the live demo of Malagasy TTS!

## Technical Overview ⚙️🕸️

This project is a lightweight, fully browser-based application that brings the magic of machine learning directly to your local environment. Here’s a quick look at the technical workflow:

- **Web Worker Setup**:  
    Worker scripts ([worker.js](./worker.js)) handle the heavy lifting by loading multiple ML models (language detection, translation, and text-to-speech) in parallel. This keeps the main UI thread responsive. 🚀 ([Learn more about Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API))

- **Model Loading with [Transformers.js](https://github.com/xenova/transformers.js)**:  
    Using the Transformers.js library, the project loads ML pipelines dynamically via module imports in [modelLoader.js](./modelLoader.js). The pipelines are configured in [config.js](./config.js), ensuring smooth handling of tasks such as text classification, translation, and TTS. 🔄

- **Dynamic Audio Generation**:  
    Text input is processed into [WAV format](https://en.wikipedia.org/wiki/WAV) on the fly. The worker script generates a proper WAV buffer from PCM samples, so synthesized audio plays directly in the browser. 🎤🎶

- **Responsive UI**:  
    The [index.html](./index.html) file sets up a responsive interface with real-time progress updates for model downloads and each processing stage. It includes distinct sections for detection, translation, and audio output, ensuring a seamless user experience. 📱💻

- **Language Mapping**:  
    A custom mapping between [ISO language codes](https://en.wikipedia.org/wiki/ISO_639-1) and the models’ required formats allows more efficient processing and translation tasks. 🌍

This setup not only makes TTS accessible locally without backend dependencies but also encourages developers and enthusiasts to experiment and contribute! 💡🔧

## Models and Libraries Used 🛠

- **[Transformers.js](https://github.com/xenova/transformers.js)**:  
    Utilized from the CDN, Transformers.js provides the capability to load machine learning pipelines directly in the browser. This library simplifies working with complex models by offering pre-configured pipelines for various tasks.

- **Language Detection Model**:  
    Based on the XLM-RoBERTa architecture, this model detects the language of the input text. It is loaded from the identifier [louisthomaspro/xlm-roberta-base-language-detection-onnx](https://huggingface.co/louisthomaspro/xlm-roberta-base-language-detection-onnx).

- **Translation Model**:  
    Powered by a distilled version of the NLLB (No Language Left Behind) model, it translates the detected text into a target language. The model is identified by [Xenova/nllb-200-distilled-600M](https://huggingface.co/Xenova/nllb-200-distilled-600M).

- **Text-to-Speech (TTS) Model**:  
    This model converts translated text into audio. It ensures natural speech synthesis using the model at [elloza/mms-tts-mlg-onnx](https://huggingface.co/elloza/mms-tts-mlg-onnx).

- **Web Workers**:  
    While not a library per se, web workers are employed to handle model loading and processing tasks in parallel, ensuring that the main UI remains responsive during heavy computations. ([More on web workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API))
