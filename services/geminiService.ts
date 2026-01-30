import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { StoryboardSegment, VideoStyle, ViralTactic, SrtSubtitle, VideoStatus, AspectRatio } from "../types";

// Helper to ensure we have the key before making requests
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment.");
  }
  return new GoogleGenAI({ apiKey });
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Robust error checking for 429/Quota issues
const isRateLimitError = (error: any): boolean => {
  if (!error) return false;
  
  // Check standard error properties
  if (error.status === 429 || error.code === 429) return true;
  
  // Check Google API specific nested error structure (e.g. { error: { code: 429, ... } })
  if (error.error) {
    if (error.error.code === 429) return true;
    if (error.error.status === 'RESOURCE_EXHAUSTED') return true;
  }
  
  // Check message string for keywords
  const msg = (error.message || JSON.stringify(error) || '').toLowerCase();
  return msg.includes('429') || 
         msg.includes('quota') || 
         msg.includes('resource_exhausted');
};

/**
 * Analyzes uploaded reference images to identify the entities.
 */
export const analyzeReferenceImages = async (base64Images: string[]): Promise<string[]> => {
    if (base64Images.length === 0) return [];
    
    const ai = getClient();
    const model = "gemini-3-flash-preview"; 

    // Relaxed prompt to allow sufficient detail for semantic matching
    const prompt = `
        Analyze these images and identify the specific MAIN ENTITY in each one.
        Return a JSON array of strings, where each string describes the entity at that index.
        
        Example Output: ["The book 'Principles' by Ray Dalio", "A bottle of Chanel No.5 perfume"]
        
        Be specific. If it is a book, mention the title and author on the cover. If it is a product, mention the brand.
    `;

    const parts: any[] = [{ text: prompt }];
    
    // Attach all images
    base64Images.forEach(img => {
        const base64Data = img.split(',')[1];
        const mimeType = img.split(';')[0].split(':')[1] || 'image/png';
        parts.push({
            inlineData: { mimeType, data: base64Data }
        });
    });

    try {
        const response = await ai.models.generateContent({
            model,
            contents: { parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        
        const descriptions = JSON.parse(response.text || "[]");
        console.log("Reference Image Analysis:", descriptions);
        return descriptions;
    } catch (e) {
        console.warn("Failed to analyze reference images, falling back to generic indexing.", e);
        return base64Images.map((_, i) => `Reference Image ${i}`);
    }
};

export const generateStoryboardFromSrt = async (
  subtitles: SrtSubtitle[],
  style: VideoStyle,
  referenceImageDescriptions: string[] = []
): Promise<StoryboardSegment[]> => {
  const ai = getClient();
  
  const maxSrtEndTime = subtitles.reduce((max, sub) => Math.max(max, sub.endSeconds), 0);

  let strategySection = '';
  if (style.id === 'oil_painting') {
      strategySection = "### STRATEGY: Healing/Therapeutic. Slow pacing, back views, nature focus.";
  } else {
      strategySection = "### STRATEGY: Viral/TikTok. Fast pacing, hook at start.";
  }

  // Build the context string for the AI Director
  const refAssetsContext = referenceImageDescriptions.map((desc, i) => 
      `Index ${i}: ${desc}`
  ).join('\n    ');

  // Restored detailed instructions for intelligent matching + CULTURAL + TEMPORAL ADAPTATION
  const systemInstruction = `
    You are a world-class Short Video Creative Director. 
    Your goal is to transform a subtitle script into a visual storyboard matching the style: "${style.name}" (${style.description}).

    ### 1. UNIFIED VISUAL CONSISTENCY (HIGHEST PRIORITY):
    *   **Consistent Environment**: Establish a SINGLE, cohesive setting (e.g., "A futuristic neon Tokyo street in rain" OR "A sunny minimalistic white studio"). Do not jump between wildly different locations unless the script explicitly demands it.
    *   **Consistent Lighting**: Maintain the same time of day and lighting conditions (e.g., "Golden hour soft light") across ALL segments.
    *   **Consistent Palette**: Use the prompt to enforce a specific color palette defined by the style "${style.name}".
    *   **Recurring Characters**: If a character appears, describe them EXACTLY the same way in every visual_prompt (e.g., "A young woman with short bob hair in a beige trench coat").

    ### 2. TEMPORAL & SOCIAL CONTEXT:
    *   **DETECT ERA**: Analyze the script for time cues.
        *   Keywords like "AI", "Crypto", "Current Market", "Mobile App" -> **MODERN DAY (2020s)**.
        *   Keywords like "Ancient", "Dynasty" -> **HISTORICAL**.
        *   **DEFAULT**: **MODERN DAY (Present)**.
    *   **MODERN CHINA CONTEXT**: If the script implies Chinese context:
        *   **Visuals**: Modern Glass Skyscrapers, High-Speed Trains, Contemporary Fashion.
        *   **FORBIDDEN**: Do NOT use 1990s visuals (Old taxis, rustic bicycles) unless specified.
    *   **OUTPUT RULE**: In \`visual_prompt\`, explicitly state the era AND the consistent lighting/setting in EVERY segment.

    ### 3. REFERENCE ASSETS:
    You have access to the following specific uploaded assets:
    ${refAssetsContext}

    **INTELLIGENT ENTITY MATCHING RULES:**
    *   **Strict Semantic Matching**: Only assign a \`reference_image_index\` if the subtitle text refers to the *specific physical entity* described in the asset.
    *   **Avoid Ambiguity**: If the scene is abstract, set \`reference_image_index\` to -1.

    ### 4. VISUAL STYLE:
    *   Match the style description: ${style.description}
    
    ${strategySection}

    ### JSON OUTPUT INSTRUCTIONS:
    Generate a \`visual_prompt\` like a Midjourney prompt.
    Field \`reference_image_index\`: Integer. The index of the uploaded image to use (0 to ${Math.max(0, referenceImageDescriptions.length - 1)}). Set to -1 if no reference needed.
  `;

  const simpleSubs = subtitles.map(s => ({
    id: s.id,
    time: `${s.startTime} --> ${s.endTime}`,
    text: s.text
  }));

  const prompt = `
    SRT content:
    ${JSON.stringify(simpleSubs)}
    
    Reference Images Available: ${referenceImageDescriptions.length}

    Generate JSON storyboard for the ENTIRE script. Ensure VISUAL CONSISTENCY across all frames.
  `;

  let lastError: any;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
        const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                subtitle_ids: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING }
                },
                visual_prompt: { type: Type.STRING, description: "Detailed visual prompt. MUST repeat the core setting/lighting keywords for consistency." },
                reference_image_index: { type: Type.INTEGER, description: "Index of reference image to use (0-N), or -1 if none." },
                camera_movement: { 
                    type: Type.STRING, 
                    enum: ["Zoom In", "Zoom Out", "Pan Right", "Pan Left", "Static"]
                },
                viral_reasoning: { type: Type.STRING },
                tactic: { 
                    type: Type.STRING, 
                    enum: Object.values(ViralTactic) 
                }
                },
                required: ["subtitle_ids", "visual_prompt", "camera_movement", "viral_reasoning", "tactic"]
            }
            }
        }
        });

        const jsonStr = response.text || "[]";
        const rawSegments = JSON.parse(jsonStr);

        // Hydration logic
        const hydratedSegments = rawSegments.map((seg: any) => {
            const relevantSubs = subtitles.filter(s => seg.subtitle_ids?.includes(s.id));
            if (!relevantSubs.length) return null;
            relevantSubs.sort((a, b) => a.startSeconds - b.startSeconds);

            // Sanitize index
            let refIdx = seg.reference_image_index;
            if (typeof refIdx !== 'number' || refIdx < 0 || refIdx >= referenceImageDescriptions.length) {
                refIdx = undefined; // Treat -1 or invalid as undefined
            }

            return {
                ...seg,
                startTime: relevantSubs[0].startSeconds,
                endTime: relevantSubs[relevantSubs.length - 1].endSeconds,
                text: relevantSubs.map(s => s.text).join(' '),
                reference_image_index: refIdx
            };
        }).filter(Boolean);

        hydratedSegments.sort((a: any, b: any) => a.startTime - b.startTime);

        let currentTime = 0;
        return hydratedSegments.map((seg: any, index: number) => {
            let segmentEnd = seg.endTime;
            if (index < hydratedSegments.length - 1) {
                const nextStart = hydratedSegments[index + 1].startTime;
                if (nextStart > segmentEnd) segmentEnd = nextStart;
            } else {
                if (segmentEnd < maxSrtEndTime) segmentEnd = maxSrtEndTime;
            }

            const duration = Math.max(0.1, segmentEnd - currentTime);
            const finalSegment: StoryboardSegment = {
                id: `seg-${index}-${Date.now()}`,
                status: VideoStatus.IDLE,
                text: seg.text,
                duration: duration,
                visual_prompt: `${seg.visual_prompt}`, // Don't append modifier here, we do it in generation to keep prompt clean
                camera_movement: seg.camera_movement,
                viral_reasoning: seg.viral_reasoning,
                tactic: seg.tactic,
                reference_image_index: seg.reference_image_index
            };
            currentTime = segmentEnd;
            return finalSegment;
        });
    } catch (error: any) {
        lastError = error;
        if (isRateLimitError(error)) {
            const waitTime = (Math.pow(2, attempt) * 2000) + 1000;
            console.warn(`Storyboard generation rate limited. Retrying in ${waitTime}ms...`);
            await delay(waitTime);
            continue;
        }
        throw error;
    }
  }
  throw lastError;
};

export const refineVisualPrompt = async (
    currentPrompt: string,
    style: VideoStyle
): Promise<string> => {
    const ai = getClient();
    const prompt = `Refine this prompt for style "${style.name}". Ensure it matches the consistent atmosphere of: ${style.description}. Prompt: "${currentPrompt}". Remove AI feel. Return only prompt.`;
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
    });
    return response.text?.trim() || currentPrompt;
};

export const generateImageForSegment = async (
  segment: StoryboardSegment,
  aspectRatio: AspectRatio,
  referenceImages: string[] = [],
  signal?: AbortSignal,
  seed?: number
): Promise<string> => {
  if (signal?.aborted) throw new Error("Cancelled");

  const ai = getClient();
  const modelName = 'gemini-3-pro-image-preview'; 

  console.log(`Starting image generation for segment ${segment.id}. Ref Index: ${segment.reference_image_index}`);

  let lastError: any;
  const maxRetries = 8;
  
  // Choose specific style parameters
  // Ensure "Unified Style" by appending the global modifier + positive quality boosters
  const antiAiPositive = "cinematic lighting, high fidelity, distinct consistent artstyle, masterful composition, 8k resolution, highly detailed";
  
  // Enhanced Negative Constraints to reduce hallucinations and keep style pure
  const negativeConstraints = "Exclude: blurry, low quality, distorted, bad anatomy, ugly, disfigured, watermark, text, subtitles, ui, signature, jpeg artifacts, cartoon (unless specified), anime (unless specified), cgi (unless specified), inconsistent lighting, messy background.";
  
  const contentParts: any[] = [];
  
  // Use specific reference image if the AI Director assigned one
  const refIndex = segment.reference_image_index;
  const specificRefImage = (refIndex !== undefined && refIndex >= 0 && refIndex < referenceImages.length) 
      ? referenceImages[refIndex] 
      : null;

  if (specificRefImage) {
      const base64Data = specificRefImage.split(',')[1];
      const mimeType = specificRefImage.split(';')[0].split(':')[1] || 'image/png';
      contentParts.push({
          inlineData: { mimeType, data: base64Data }
      });
  }

  // Construct Final Prompt
  // We trust the `segment.visual_prompt` has the style description because we instructed the Storyboard AI to include it.
  // We add aspect ratio and technical quality tokens.
  let finalPrompt = `${segment.visual_prompt}. ${antiAiPositive}. Aspect ratio ${aspectRatio}. ${negativeConstraints}`;
  
  if (specificRefImage) {
      finalPrompt = `[IMPORTANT: Integrate the object from the provided image naturally into this scene, maintaining the scene's lighting and style]. ${finalPrompt}`;
  }

  contentParts.push({ text: finalPrompt });

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (signal?.aborted) throw new Error("Cancelled");

    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts: contentParts },
        config: {
          imageConfig: { aspectRatio: aspectRatio, imageSize: '1K' },
          seed: seed, // Use project-wide seed for consistency
          safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          ]
        }
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const mimeType = part.inlineData.mimeType || 'image/png';
            return `data:${mimeType};base64,${part.inlineData.data}`;
          }
        }
      }
      
      throw new Error("No image data found");

    } catch (error: any) {
      if (signal?.aborted) throw new Error("Cancelled");
      lastError = error;
      
      if (isRateLimitError(error)) {
        const waitTime = (Math.pow(2, attempt) * 2000) + (Math.random() * 1000);
        await delay(waitTime);
        continue;
      }
      if (error.message?.includes("404")) throw error;
      
      await delay(2000);
    }
  }

  throw lastError || new Error("Image generation failed");
};
