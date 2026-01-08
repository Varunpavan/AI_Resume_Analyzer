export interface ResumeStructure {
    contactInfo: {
        name?: string;
        email?: string;
        phone?: string;
        linkedin?: string;
        location?: string;
    };
    summary?: string;
    education: Array<{
        institution: string;
        degree: string;
        startDate?: string;
        endDate?: string;
        gpa?: string;
    }>;
    experience: Array<{
        company: string;
        role: string;
        startDate: string;
        endDate: string;
        location?: string;
        bullets: string[];
    }>;
    skills: {
        technical: string[];
        soft: string[];
        tools: string[];
        languages?: string[];
    };
    projects: Array<{
        name: string;
        description: string;
        technologies: string[];
        link?: string;
    }>;
}

export interface JobDescription {
    title: string;
    company: string;
    requiredSkills: string[];
    preferredSkills: string[];
    keywords: string[];
    experienceLevel: string; // e.g., "Senior", "2-5 years"
    culturalFit: string[];
}

export interface GapAnalysis {
    matchScore: number; // 0-100
    missingCriticalSkills: string[];
    missingKeywords: string[];
    strengthAreas: string[];
    experienceMatch: {
        score: number;
        reasoning: string;
    };
}

export interface ATSRisk {
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    issue: string;
    fix: string;
    category: 'FORMATTING' | 'CONTENT' | 'KEYWORD_STUFFING';
}

export interface BulletImprovement {
    originalText: string;
    improvedVersions: Array<{
        text: string;
        reasoning: string; // Why this is better (e.g., "Added metrics")
        type: 'STAR_METHOD' | 'QUANTIFIED' | 'ACTION_ORIENTED';
    }>;
}
