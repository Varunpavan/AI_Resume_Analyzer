import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ResumeStructure, JobDescription, GapAnalysis, BulletImprovement } from "../types/domain";

// Initialize Gemini Client
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-flash-latest" }) : null;

// Mock Data for Fallback
const MOCK_RESUME: ResumeStructure = {
    contactInfo: { name: "Jane Doe (Mock)", email: "jane@example.com", location: "San Francisco, CA" },
    education: [{ institution: "University of Tech", degree: "B.S. CS", startDate: "2018", endDate: "2022" }],
    experience: [{ company: "Mock Corp", role: "Software Engineer", startDate: "2022", endDate: "Present", bullets: ["Built features.", "Fixed bugs."], location: "Remote" }],
    skills: { technical: ["React", "TypeScript"], soft: ["Teamwork"], tools: ["Git"] },
    projects: []
};

const MOCK_JD: JobDescription = {
    title: "Mock Engineer", company: "Mock Inc", requiredSkills: ["React"], preferredSkills: [],
    keywords: [], experienceLevel: "Senior", culturalFit: []
};

// Helper to clean JSON markdown
const cleanJson = (text: string) => {
    return text.replace(/```json\s*|\s*```/g, "").trim();
};

const generateWithRetry = async (prompt: string) => {
    if (!model) throw new Error("Model not initialized");

    let currentDelay = 5000;
    const maxRetries = 5;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await model.generateContent(prompt);
        } catch (error: any) {
            // Check for 429 (Too Many Requests) - checking string message for safety as error structure varies
            const isRateLimit = error?.message?.includes('429') || error?.status === 429 || error?.toString().includes('429');

            if (isRateLimit && i < maxRetries - 1) {
                console.warn(`Quota exceeded. Retrying in ${currentDelay}ms... (Attempt ${i + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, currentDelay));
                currentDelay *= 2;
                continue;
            }
            throw error;
        }
    }
    throw new Error("Generative AI request failed after retries");
};

export class AiService {

    static async structureResume(rawText: string): Promise<ResumeStructure> {
        console.log("Analyzing resume...");
        if (!model) {
            console.warn("No API Key found. Using mock data.");
            await new Promise(r => setTimeout(r, 1000));
            return MOCK_RESUME;
        }

        const prompt = `
            You are an expert resume parser. Extract the following information from the text into a JSON object:
            - contactInfo: { name, email, phone, location, linkedin, github }
            - education: array of { institution, degree, startDate, endDate, gpa }
            - experience: array of { company, role, startDate, endDate, location, bullets (array of strings) }
            - skills: { technical (array), soft (array), tools (array) }
            - projects: array of { name, description, technologies (array) }

            Resume Text:
            ${rawText}

            Return ONLY valid JSON.
        `;

        try {
            const result = await generateWithRetry(prompt);
            const response = result.response;
            const text = response.text();
            return JSON.parse(cleanJson(text)) as ResumeStructure;
        } catch (error) {
            console.error("AI Parsing Failed:", error);
            return MOCK_RESUME;
        }
    }

    static async extractJobDescription(jdText: string): Promise<JobDescription> {
        if (!model) {
            await new Promise(r => setTimeout(r, 1000));
            return MOCK_JD;
        }

        const prompt = `
            Extract job requirements from this text into a JSON object:
            - title
            - company
            - requiredSkills (array of strings)
            - preferredSkills (array of strings)
            - keywords (array)
            - experienceLevel (string)
            - culturalFit (array of strings)

            JD Text:
            ${jdText}

            Return ONLY valid JSON.
        `;

        try {
            const result = await generateWithRetry(prompt);
            return JSON.parse(cleanJson(result.response.text())) as JobDescription;
        } catch (error) {
            console.error("AI JD Extraction Failed:", error);
            return MOCK_JD;
        }
    }

    static async compareResumeToJD(resume: ResumeStructure, jd: JobDescription): Promise<GapAnalysis> {
        if (!model) {
            await new Promise(r => setTimeout(r, 1000));
            return { matchScore: 65, missingCriticalSkills: ["Mock Skill"], missingKeywords: [], strengthAreas: ["Mock Strength"], experienceMatch: { score: 50, reasoning: "Mock reasoning" } };
        }

        const prompt = `
            Compare this Resume and Job Description. Perform a Gap Analysis and return JSON:
            - matchScore (number 0-100)
            - missingCriticalSkills (array of strings - skills in JD but not in Resume)
            - missingKeywords (array)
            - strengthAreas (array - matching skills)
            - experienceMatch: { score (0-100), reasoning (string) }

            Resume: ${JSON.stringify(resume)}
            Job Description: ${JSON.stringify(jd)}

            Return ONLY valid JSON.
        `;

        try {
            const result = await generateWithRetry(prompt);
            return JSON.parse(cleanJson(result.response.text())) as GapAnalysis;
        } catch (error) {
            console.error("AI Gap Analysis Failed:", error);
            // Return a safe fallback to prevent UI crash
            return { matchScore: 0, missingCriticalSkills: ["Error analyzing"], missingKeywords: [], strengthAreas: [], experienceMatch: { score: 0, reasoning: "Error" } };
        }
    }

    static async improveBulletPoint(bullet: string, roleContext: string): Promise<BulletImprovement> {
        if (!model) {
            await new Promise(r => setTimeout(r, 1000));
            return { originalText: bullet, improvedVersions: [{ text: "Mock improved version.", reasoning: "Mock reasoning.", type: "QUANTIFIED" }] };
        }

        const prompt = `
            Rewrite this resume bullet point to be more impactful. Use the STAR method, active verbs, and quantify results if possible.
            Context: The role was "${roleContext}".
            
            Bullet: "${bullet}"

            Return JSON:
            {
                "originalText": "${bullet}",
                "improvedVersions": [
                    {
                        "text": "Improved bullet text...",
                        "reasoning": "Explanation of changes...",
                        "type": "QUANTIFIED" | "ACTIVE_VOICE" | "STAR_METHOD"
                    }
                ]
            }
        `;

        try {
            const result = await generateWithRetry(prompt);
            return JSON.parse(cleanJson(result.response.text())) as BulletImprovement;
        } catch (error) {
            console.error("AI Improvement Failed:", error);
            return { originalText: bullet, improvedVersions: [] };
        }
    }
}
