// modelLoader.js
import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers/dist/transformers.min.js";

/**
 * Carga un pipeline con las opciones indicadas.
 * @param {string} task - Tarea (por ejemplo, "translation")
 * @param {string} modelId - Identificador del modelo en Hugging Face
 * @param {Object} options - Opciones para la carga del pipeline
 * @param {Function} progressCallback - Callback que recibe el progreso (valor entre 0 y 1)
 * @returns {Promise} Pipeline cargado.
 */
export async function loadPipeline(task, modelId, options = {}, progressCallback) {
  const opts = Object.assign({}, options, {
    progress_callback: (progress) => {
      progress = Number(progress);
      if (!Number.isFinite(progress)) progress = 0;
      if (typeof progressCallback === "function") {
        progressCallback(progress);
      }
    }
  });
  return await pipeline(task, modelId, opts);
}
