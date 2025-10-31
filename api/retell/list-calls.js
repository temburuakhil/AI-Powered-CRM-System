const Retell = require('retell-sdk').Retell;

// HuggingFace API configuration
const HF_API_URL = 'https://api-inference.huggingface.co/models/SamLowe/roberta-base-go_emotions';
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

// Analyze sentiment using Hugging Face RoBERTa model
async function analyzeSentimentHF(text) {
  if (!text || text.trim().length === 0) {
    return null;
  }

  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Add authorization if API key is available
    if (HF_API_KEY) {
      headers['Authorization'] = `Bearer ${HF_API_KEY}`;
    }

    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        inputs: text.substring(0, 512) // Limit to 512 characters for RoBERTa
      })
    });

    if (!response.ok) {
      console.error('HF API error:', response.status, response.statusText);
      return null;
    }

    const result = await response.json();
    
    // Handle model loading state (HF Inference API may need time to load model)
    if (result.error && result.error.includes('loading')) {
      console.log('HuggingFace model is loading, will retry on next call...');
      return null;
    }
    
    // Result is array of arrays with label-score pairs
    if (Array.isArray(result) && result[0]) {
      // Sort by score to get top emotions
      const emotions = result[0].sort((a, b) => b.score - a.score);
      return emotions;
    }
    
    return null;
  } catch (error) {
    console.error('Error calling Hugging Face API:', error.message);
    return null;
  }
}

// Calculate lead score using ONLY HuggingFace AI model (1-10 scale)
// Returns null if no transcript is available
async function calculateLeadScore(call) {
  // Only calculate score if transcript exists
  if (!call.transcript || call.transcript.trim().length === 0) {
    return null; // No transcript = no score
  }

  let score = 5; // Base score for calls with transcripts
  
  // Factor 1: HuggingFace AI sentiment analysis (PRIMARY - up to 5 points)
  const emotions = await analyzeSentimentHF(call.transcript);
  
  if (emotions && emotions.length > 0) {
    // Categorize emotions using go_emotions model (28 categories)
    const positiveEmotions = ['admiration', 'amusement', 'approval', 'caring', 'desire', 
                              'excitement', 'gratitude', 'joy', 'love', 'optimism', 
                              'pride', 'relief'];
    const negativeEmotions = ['anger', 'annoyance', 'disappointment', 'disapproval', 
                              'disgust', 'embarrassment', 'fear', 'grief', 'nervousness', 
                              'remorse', 'sadness'];
    
    // Get top 3 emotions from HuggingFace model
    const topEmotions = emotions.slice(0, 3);
    let sentimentScore = 0;
    
    console.log(`🤖 HF Emotions for call: ${topEmotions.map(e => `${e.label}(${e.score.toFixed(2)})`).join(', ')}`);
    
    for (const emotion of topEmotions) {
      if (positiveEmotions.includes(emotion.label)) {
        sentimentScore += emotion.score * 2; // Weight positive emotions heavily
      } else if (negativeEmotions.includes(emotion.label)) {
        sentimentScore -= emotion.score * 1.5; // Penalize negative emotions
      }
    }
    
    // Convert HF sentiment to score points (0-5 range based on AI analysis)
    if (sentimentScore > 0.8) {
      score += 5; // Extremely positive
    } else if (sentimentScore > 0.4) {
      score += 4; // Very positive
    } else if (sentimentScore > 0.1) {
      score += 3; // Positive
    } else if (sentimentScore > -0.1) {
      score += 2; // Neutral
    } else if (sentimentScore > -0.4) {
      score += 1; // Slightly negative
    } else if (sentimentScore > -0.8) {
      score -= 1; // Negative
    } else {
      score -= 2; // Very negative
    }
  } else {
    // HF model failed, use basic heuristics
    console.log('⚠️  HF model unavailable, using basic scoring');
    
    // Factor 2: Call success (0-2 points)
    if (call.call_analysis?.call_successful === true) {
      score += 2;
    }
    
    // Factor 3: Call duration (0-2 points)
    if (call.duration_ms) {
      const durationSeconds = call.duration_ms / 1000;
      if (durationSeconds > 120) { // Over 2 minutes
        score += 2;
      } else if (durationSeconds > 60) { // Over 1 minute
        score += 1;
      }
    }
  }
  
  // Factor 4: Transcript engagement analysis (0-1 points)
  const wordCount = call.transcript.split(/\s+/).length;
  if (wordCount > 200) { // Long, engaged conversation
    score += 1;
  } else if (wordCount < 20) { // Very short conversation - likely poor lead
    score -= 1;
  }
  
  // Ensure score is between 1 and 10, round to whole number
  score = Math.max(1, Math.min(10, Math.round(score)));
  
  console.log(`📊 Lead Score: ${score}/10`);
  
  return score;
}

// Vercel serverless function
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { limit = 10 } = req.body;
    
    // Initialize Retell client
    const retellClient = new Retell({
      apiKey: process.env.RETELL_API_KEY
    });

    console.log(`📞 Fetching ${limit} recent calls from Retell AI using SDK...`);
    
    // Use Retell SDK to list calls
    const callResponses = await retellClient.call.list({
      sort_order: 'descending',
      limit: limit
    });

    console.log(`✅ Retrieved ${callResponses.length} calls from Retell AI`);

    // Transform calls with lead scoring
    const transformedCalls = await Promise.all(callResponses.map(async (call) => ({
      call_id: call.call_id,
      agent_id: call.agent_id,
      call_type: call.call_type,
      call_status: call.call_status,
      from_number: call.from_number,
      to_number: call.to_number,
      direction: call.direction,
      start_timestamp: call.start_timestamp,
      end_timestamp: call.end_timestamp,
      duration_ms: call.duration_ms,
      recording_url: call.recording_url,
      transcript: call.transcript,
      transcript_with_tool_calls: call.transcript_with_tool_calls,
      disconnection_reason: call.disconnection_reason,
      call_analysis: call.call_analysis,
      public_log_url: call.public_log_url,
      lead_score: await calculateLeadScore(call) // AI-powered lead scoring
    })));

    console.log(`✅ Transformed ${transformedCalls.length} calls`);

    res.status(200).json({
      success: true,
      calls: transformedCalls
    });

  } catch (error) {
    console.error('❌ Error fetching calls from Retell AI:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
