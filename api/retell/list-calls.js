// Vercel Serverless Function for Retell AI with HuggingFace Lead Scoring

const HF_API_URL = 'https://api-inference.huggingface.co/models/SamLowe/roberta-base-go_emotions';

// Analyze sentiment using Hugging Face RoBERTa model
async function analyzeSentimentHF(text) {
  if (!text || text.trim().length === 0) {
    return null;
  }

  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
    if (HF_API_KEY) {
      headers['Authorization'] = `Bearer ${HF_API_KEY}`;
    }

    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        inputs: text.substring(0, 512)
      })
    });

    if (!response.ok) {
      console.error('HF API error:', response.status, response.statusText);
      return null;
    }

    const result = await response.json();
    
    if (result.error && result.error.includes('loading')) {
      console.log('HuggingFace model is loading...');
      return null;
    }
    
    if (Array.isArray(result) && result[0]) {
      const emotions = result[0].sort((a, b) => b.score - a.score);
      return emotions;
    }
    
    return null;
  } catch (error) {
    console.error('Error calling Hugging Face API:', error.message);
    return null;
  }
}

// Calculate lead score using HuggingFace AI model (1-10 scale)
async function calculateLeadScore(call) {
  if (!call.transcript || call.transcript.trim().length === 0) {
    return null;
  }

  let score = 5;
  const emotions = await analyzeSentimentHF(call.transcript);
  
  if (emotions && emotions.length > 0) {
    const positiveEmotions = ['admiration', 'amusement', 'approval', 'caring', 'desire', 
                              'excitement', 'gratitude', 'joy', 'love', 'optimism', 
                              'pride', 'relief'];
    const negativeEmotions = ['anger', 'annoyance', 'disappointment', 'disapproval', 
                              'disgust', 'embarrassment', 'fear', 'grief', 'nervousness', 
                              'remorse', 'sadness'];
    
    const topEmotions = emotions.slice(0, 3);
    let sentimentScore = 0;
    
    for (const emotion of topEmotions) {
      if (positiveEmotions.includes(emotion.label)) {
        sentimentScore += emotion.score * 2;
      } else if (negativeEmotions.includes(emotion.label)) {
        sentimentScore -= emotion.score * 1.5;
      }
    }
    
    if (sentimentScore > 0.8) {
      score += 5;
    } else if (sentimentScore > 0.4) {
      score += 4;
    } else if (sentimentScore > 0.1) {
      score += 3;
    } else if (sentimentScore > -0.1) {
      score += 2;
    } else if (sentimentScore > -0.4) {
      score += 1;
    } else if (sentimentScore > -0.8) {
      score -= 1;
    } else {
      score -= 2;
    }
  } else {
    if (call.call_analysis?.call_successful === true) {
      score += 2;
    }
    if (call.duration_ms) {
      const durationSeconds = call.duration_ms / 1000;
      if (durationSeconds > 120) {
        score += 2;
      } else if (durationSeconds > 60) {
        score += 1;
      }
    }
  }
  
  const wordCount = call.transcript.split(/\s+/).length;
  if (wordCount > 200) {
    score += 1;
  } else if (wordCount < 20) {
    score -= 1;
  }
  
  score = Math.max(1, Math.min(10, Math.round(score)));
  return score;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { limit = 10 } = req.body;
    const RETELL_API_KEY = process.env.RETELL_API_KEY;
    
    if (!RETELL_API_KEY) {
      throw new Error('RETELL_API_KEY not configured');
    }

    console.log(`📞 Fetching ${limit} recent calls from Retell AI...`);
    
    // Use Retell REST API directly
    const response = await fetch('https://api.retellai.com/v2/list-calls', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sort_order: 'descending',
        limit: limit
      })
    });

    if (!response.ok) {
      throw new Error(`Retell API error: ${response.status}`);
    }

    const data = await response.json();
    const callResponses = data.calls || [];

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
      lead_score: await calculateLeadScore(call)
    })));

    console.log(`✅ Transformed ${transformedCalls.length} calls`);

    res.status(200).json({
      success: true,
      calls: transformedCalls
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
