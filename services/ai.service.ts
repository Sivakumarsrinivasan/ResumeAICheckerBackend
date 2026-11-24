import {Type, GoogleGenAI} from "@google/genai"
export interface ResumeMatchResult {
  score: number;
  summary: string;
  missingSkills: string[];
}
const ai = new GoogleGenAI({
    apiKey:process.env.GEMINI_KEY
})

export  const resumeChecker = async(params:{
    jobTitle:string,
    jobDescription:string,
    yearsofexperience:number,
    skills:string,
    resumeText:string
}): Promise<ResumeMatchResult> =>{
if (!process.env.GEMINI_KEY) {
    // Safe fallback if API key is not configured during local testing
    return {
      score: 50,
      summary: "GEMINI_API_KEY not configured; default baseline score assigned.",
      missingSkills: [],
    };
  }
  const prompt = `
Evaluate how well the candidate's resume matches the job posting.
Return an integer ATS match score from 0 to 100, a short 1-2 sentence summary, and key missing skills.

Job Title: ${params.jobTitle}
Minimum Experience: ${params.yearsofexperience} years
Required Skills: ${params.skills}
Job Description: ${params.jobDescription}

Candidate Resume:
${params.resumeText}
`;

const response = await ai.models.generateContent({
    model:"gemini-2.5-flash",
    contents:prompt,
    config:{
        responseMimeType:'application/json',
        responseSchema:{
            type:Type.OBJECT,
            properties: {
          score: {
            type: Type.INTEGER,
            description: "Match percentage from 0 to 100",
          },
          summary: {
            type: Type.STRING,
            description: "Concise explanation of candidate fit",
          },
          missingSkills: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Important skills from the job description missing in the resume",
          },
        },
        required: ["score", "summary", "missingSkills"],
        }
    }
})
const parsed = JSON.parse(response.text ?? "{}") as Partial<ResumeMatchResult>;
  const clampedScore = Math.max(0, Math.min(100, Number(parsed.score ?? 0)));

  return {
    score: clampedScore,
    summary: parsed.summary ?? "Evaluation completed.",
    missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
  };

}