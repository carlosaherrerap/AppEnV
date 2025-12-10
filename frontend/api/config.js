/**
 * API configuration for EnLearn backend
 */

import axios from 'axios';
import { Platform } from 'react-native';

// ===========================================
// 🔧 CONFIGURACIÓN: Cambia esta URL cuando uses ngrok
// ===========================================
const NGROK_URL = 'https://uncontinued-enduring-shin.ngrok-free.dev'; // Ejemplo: 'https://abc123.ngrok.io'
// ===========================================

// Configure API base URL
const getBaseUrl = () => {
    // Si hay URL de ngrok configurada, usarla para todas las plataformas
    if (NGROK_URL) {
        return NGROK_URL;
    }

    // Desarrollo local
    if (Platform.OS === 'web') {
        return 'http://localhost:8000';
    }
    // Para Android emulator, use 10.0.2.2 to access host machine
    return 'http://10.0.2.2:8000';
};

export const API_BASE_URL = getBaseUrl();

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds for audio processing
});

/**
 * Transcribe audio and compare with original text
 * @param {Blob|File} audioFile - The recorded audio file
 * @param {string} originalText - The phrase the user was trying to pronounce
 * @returns {Promise<Object>} - Transcription result with word scores
 */
export const transcribeAudio = async (audioUri, originalText) => {
    const formData = new FormData();

    if (Platform.OS === 'web') {
        // On web, we need to fetch the blob from the URI
        const response = await fetch(audioUri);
        const blob = await response.blob();
        formData.append('audio', blob, 'recording.wav');
    } else {
        // On native (Android/iOS), we use the file object format
        const audioFile = {
            uri: audioUri,
            type: 'audio/wav',
            name: 'recording.wav',
        };
        formData.append('audio', audioFile);
    }

    formData.append('original_text', originalText);

    const response = await api.post('/transcribe', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

/**
 * Get all practice phrases from server
 * @returns {Promise<Object>} - Phrases organized by difficulty
 */
export const getPhrases = async () => {
    const response = await api.get('/phrases');
    return response.data;
};

/**
 * Health check
 * @returns {Promise<Object>} - Server status
 */
export const healthCheck = async () => {
    const response = await api.get('/');
    return response.data;
};

export default api;
