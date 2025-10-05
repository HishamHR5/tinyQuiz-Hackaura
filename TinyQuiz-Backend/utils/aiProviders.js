const axios = require('axios');
const OpenAI = require('openai');

/**
 * Available AI providers for quiz generation
 */
const PROVIDERS = {
  GEMINI: 'gemini',
  NVIDIA: 'nvidia'
};

/**
 * Generate quiz questions using Google Gemini AI
 * @param {string} topic - The topic for quiz questions
 * @param {number} questionCount - Number of questions to generate (default: 5)
 * @param {string} difficulty - Difficulty level: easy, medium, hard (default: easy)
 * @returns {Promise<Array>} Array of structured question objects
 */
const generateWithGemini = async (topic, questionCount = 5, difficulty = 'easy') => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    // Define difficulty descriptions
    const difficultyDescriptions = {
      easy: "basic concepts, simple definitions, and fundamental principles that beginners should know",
      medium: "intermediate concepts requiring some understanding and application of knowledge",
      hard: "advanced concepts, complex applications, and detailed analysis requiring deep understanding"
    };

    // Construct detailed prompt for structured JSON output
    const prompt = `Generate exactly ${questionCount} multiple choice quiz questions about "${topic}" at ${difficulty.toUpperCase()} difficulty level.

DIFFICULTY LEVEL: ${difficulty.toUpperCase()} - Focus on ${difficultyDescriptions[difficulty] || difficultyDescriptions.easy}

IMPORTANT: Respond ONLY with valid JSON in this exact format (no markdown, no explanations):

{
  "questions": [
    {
      "question": "What is the main purpose of JavaScript?",
      "options": [
        "To style web pages",
        "To add interactivity to web pages",
        "To structure web content",
        "To manage databases"
      ],
      "correctAnswer": 1,
      "explanation": "JavaScript is primarily used to add interactivity and dynamic behavior to web pages."
    }
  ]
}

Requirements:
- Each question must have exactly 4 options
- correctAnswer must be the index (0-3) of the correct option
- Questions should be appropriate for ${difficulty.toUpperCase()} difficulty level
- Include brief explanations for learning
- Focus specifically on: ${topic}
- Ensure JSON is valid and parseable

Generate ${questionCount} questions following this format exactly.`;

    // Make API request to Gemini
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      },
      {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    // Extract and validate response
    if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response structure from Gemini API');
    }

    let rawText = response.data.candidates[0].content.parts[0].text.trim();

    // Clean up the response (remove markdown formatting if present)
    rawText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    return parseAndValidateQuestions(rawText, 'Gemini');

  } catch (error) {

    // Re-throw with more context
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.message || 'Unknown API error';
      throw new Error(`Gemini API error (${status}): ${message}`);
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request to Gemini API timed out');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error('Unable to connect to Gemini API - check your internet connection');
    } else {
      throw new Error(`Quiz generation failed with Gemini: ${error.message}`);
    }
  }
};

/**
 * Generate quiz questions using NVIDIA Nemotron/LLaMA AI via OpenAI SDK
 * @param {string} topic - The topic for quiz questions
 * @param {number} questionCount - Number of questions to generate (default: 5)
 * @returns {Promise<Array>} Array of structured question objects
 */
const generateWithNvidia = async (topic, questionCount = 5, difficulty = 'easy') => {
  try {
    if (!process.env.NVIDIA_API_KEY) {
      throw new Error('NVIDIA_API_KEY environment variable is not set');
    }

    // Initialize OpenAI client for NVIDIA
    // const openai = new OpenAI({
    //   apiKey: process.env.NVIDIA_API_KEY,
    //   baseURL: 'https://integrate.api.nvidia.com/v1',
    // });

    const openai = new OpenAI({
      apiKey: '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',
      baseURL: 'https://integrate.api.nvidia.com/v1',
    });

    // Define difficulty descriptions
    const difficultyDescriptions = {
      easy: "basic concepts, simple definitions, and fundamental principles that beginners should know",
      medium: "intermediate concepts requiring some understanding and application of knowledge",
      hard: "advanced concepts, complex applications, and detailed analysis requiring deep understanding"
    };

    // Construct prompt for NVIDIA (returns array directly)
    const prompt = `Return strictly a JSON array of ${questionCount} MCQs for "${topic}" at ${difficulty.toUpperCase()} difficulty level.
    DIFFICULTY LEVEL: ${difficulty.toUpperCase()} - Focus on ${difficultyDescriptions[difficulty] || difficultyDescriptions.easy}

    Each object must have:
    - "question"
    - "option1", "option2", "option3", "option4"
    - "answer" (e.g., "option2")
    - "explanation" (brief learning explanation)
    
    Questions should be appropriate for ${difficulty.toUpperCase()} difficulty level.
    Only return the array. No explanation, no extra text.`;

    // Make API request using OpenAI SDK
    const completion = await openai.chat.completions.create({
      model: 'meta/llama-3.1-70b-instruct',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
      temperature: 0.7,
    });

    const fullReply = completion.choices[0].message.content;


    // Try multiple parsing strategies
    let mcqs;

    // Strategy 1: Look for JSON array
    let jsonMatch = fullReply.match(/\[\s*\{.*?\}\s*\]/s);

    if (jsonMatch) {
      try {
        mcqs = JSON.parse(jsonMatch[0]);
      } catch (parseError) {

      }
    }

    // Strategy 2: Clean up common formatting issues and try again
    if (!mcqs) {
      let cleanedReply = fullReply
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^\s*/, '')
        .replace(/\s*$/, '')
        .trim();

      // Try to find JSON array in cleaned text
      jsonMatch = cleanedReply.match(/\[\s*\{.*?\}\s*\]/s);

      if (jsonMatch) {
        try {
          mcqs = JSON.parse(jsonMatch[0]);
        } catch (parseError) {

        }
      }
    }

    // Strategy 3: Try parsing the entire cleaned response
    if (!mcqs) {
      try {
        let cleanedReply = fullReply
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();

        // If it starts with [, assume it's the array we want
        if (cleanedReply.startsWith('[')) {
          mcqs = JSON.parse(cleanedReply);
        }
      } catch (parseError) {

        throw new Error('No valid JSON MCQ array found in NVIDIA response. Check logs for raw response.');
      }
    }

    if (!mcqs || !Array.isArray(mcqs)) {
      throw new Error('NVIDIA response is not a valid array of questions');
    }

    // Convert NVIDIA format to our standard format
    const convertedQuestions = mcqs.map((mcq, index) => {
      // Validate required fields
      if (!mcq.question || !mcq.option1 || !mcq.option2 || !mcq.option3 || !mcq.option4 || !mcq.answer) {
        throw new Error(`Question ${index + 1}: Missing required fields in NVIDIA response`);
      }

      // Convert options to array format
      const options = [mcq.option1, mcq.option2, mcq.option3, mcq.option4];

      // Convert answer to index
      let correctAnswer;
      switch (mcq.answer.toLowerCase()) {
        case 'option1':
          correctAnswer = 0;
          break;
        case 'option2':
          correctAnswer = 1;
          break;
        case 'option3':
          correctAnswer = 2;
          break;
        case 'option4':
          correctAnswer = 3;
          break;
        default:
          throw new Error(`Question ${index + 1}: Invalid answer format "${mcq.answer}". Expected option1, option2, option3, or option4`);
      }

      return {
        question: mcq.question.trim(),
        options: options.map(opt => opt.trim()),
        correctAnswer: correctAnswer,
        explanation: mcq.explanation ? mcq.explanation.trim() : `The correct answer is ${mcq.answer}.`
      };
    });


    return convertedQuestions;

  } catch (error) {

    // Re-throw with more context
    if (error.status) {
      // OpenAI SDK error
      const details = error.response?.data ? JSON.stringify(error.response.data) : 'no body';
      // Surface model info if we can
      const modelInfo = process.env.NVIDIA_MODEL ? ` model="${process.env.NVIDIA_MODEL}"` : '';
      if (error.status === 404) {
        throw new Error(`NVIDIA API error (404):${modelInfo} not found or not accessible (${details})`);
      }
      throw new Error(`NVIDIA API error (${error.status}): ${details}`);
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request to NVIDIA API timed out');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error('Unable to connect to NVIDIA API - check your internet connection');
    } else {
      throw new Error(`Quiz generation failed with NVIDIA: ${error.message}`);
    }
  }
};

/**
 * Parse and validate questions from AI response
 * @param {string} rawText - Raw text response from AI
 * @param {string} providerName - Name of the AI provider for error messages
 * @returns {Array} Validated questions array
 */
const parseAndValidateQuestions = (rawText, providerName) => {
  // Parse JSON response
  let questionsData;
  try {
    questionsData = JSON.parse(rawText);
  } catch (parseError) {

    throw new Error(`${providerName} returned invalid JSON format`);
  }

  // Validate the parsed data structure
  if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
    throw new Error('Invalid questions format - expected questions array');
  }

  if (questionsData.questions.length === 0) {
    throw new Error('No questions generated');
  }

  // Validate each question
  const validatedQuestions = questionsData.questions.map((q, index) => {
    if (!q.question || typeof q.question !== 'string') {
      throw new Error(`Question ${index + 1}: Missing or invalid question text`);
    }

    if (!Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error(`Question ${index + 1}: Must have exactly 4 options`);
    }

    if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
      throw new Error(`Question ${index + 1}: correctAnswer must be a number between 0-3`);
    }

    if (!q.explanation || typeof q.explanation !== 'string') {
      throw new Error(`Question ${index + 1}: Missing or invalid explanation`);
    }

    // Ensure all options are strings and non-empty
    const validOptions = q.options.map(option => {
      if (typeof option !== 'string' || option.trim().length === 0) {
        throw new Error(`Question ${index + 1}: All options must be non-empty strings`);
      }
      return option.trim();
    });

    return {
      question: q.question.trim(),
      options: validOptions,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation.trim()
    };
  });


  return validatedQuestions;
};

/**
 * Main function to generate quiz questions using specified AI provider
 * @param {string} topic - The topic for quiz questions
 * @param {number} questionCount - Number of questions to generate (default: 5)
 * @param {string} provider - AI provider to use ('gemini' or 'nvidia', default: 'gemini')
 * @returns {Promise<Array>} Array of structured question objects
 */
const generateQuestions = async (topic, questionCount = 5, provider = PROVIDERS.GEMINI, difficulty = 'easy') => {
  // Validate inputs
  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    throw new Error('Topic is required and must be a non-empty string');
  }

  if (questionCount < 1 || questionCount > 20) {
    throw new Error('Question count must be between 1 and 20');
  }

  // Validate provider
  const normalizedProvider = provider.toLowerCase();
  if (!Object.values(PROVIDERS).includes(normalizedProvider)) {
    throw new Error(`Invalid provider. Supported providers: ${Object.values(PROVIDERS).join(', ')}`);
  }



  // Route to appropriate provider
  switch (normalizedProvider) {
    case PROVIDERS.GEMINI:
      return await generateWithGemini(topic, questionCount, difficulty);
    case PROVIDERS.NVIDIA:
      return await generateWithNvidia(topic, questionCount, difficulty);
    default:
      throw new Error(`Provider ${provider} not implemented`);
  }
};

/**
 * Get list of available AI providers
 * @returns {Object} Object containing provider information
 */
const getAvailableProviders = () => {
  return {
    providers: [
      {
        id: PROVIDERS.GEMINI,
        name: 'Google Gemini',
        description: 'Google\'s advanced language model, great for educational content',
        requiresApiKey: 'GEMINI_API_KEY',
        available: !!process.env.GEMINI_API_KEY
      },
      {
        id: PROVIDERS.NVIDIA,
        name: 'NVIDIA Nemotron/LLaMA',
        description: 'NVIDIA\'s LLaMA-based model, excellent for quiz generation',
        requiresApiKey: 'NVIDIA_API_KEY',
        available: !!process.env.NVIDIA_API_KEY
      }
    ],
    default: PROVIDERS.GEMINI
  };
};

module.exports = {
  generateQuestions,
  getAvailableProviders,
  PROVIDERS,
  // Backward compatibility
  getQuestionsFromGemini: (topic, questionCount) => generateQuestions(topic, questionCount, PROVIDERS.GEMINI)
};