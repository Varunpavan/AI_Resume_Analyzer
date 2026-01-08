import { UploadCloud, CheckCircle, Target, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { getPDFText } from '../lib/pdf-utils';
import { AiService } from '../services/ai-evaluator';
import type { ResumeStructure, JobDescription, GapAnalysis } from '../types/domain';
import { JobDescriptionInput } from '../components/JobDescriptionInput';
import { BulletPointEditor } from '../components/BulletPointEditor';

export default function Dashboard() {
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Phase 2 State
    const [resumeData, setResumeData] = useState<ResumeStructure | null>(null);
    const [analysisStatus, setAnalysisStatus] = useState<string>('idle'); // idle, extracting, structuring, done

    // Phase 3 State
    const [jdData, setJdData] = useState<JobDescription | null>(null);
    const [gapAnalysis, setGapAnalysis] = useState<GapAnalysis | null>(null);
    const [isComparing, setIsComparing] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type === 'application/pdf') {
            handleFile(files[0]);
        } else {
            alert("Please upload a PDF file.");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = async (file: File) => {
        setFileName(file.name);
        setIsAnalyzing(true);
        setAnalysisStatus('extracting');

        try {
            // Step 1: Extract Text
            const text = await getPDFText(file);

            // Step 2: Structure Data (Antigravity Evaluator A)
            setAnalysisStatus('structuring');
            const structuredData = await AiService.structureResume(text);
            setResumeData(structuredData);

            setAnalysisStatus('done');
        } catch (error) {
            console.error(error);
            setAnalysisStatus('error');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleCompare = async () => {
        if (!resumeData || !jdData) return;

        setIsComparing(true);
        try {
            const analysis = await AiService.compareResumeToJD(resumeData, jdData);
            setGapAnalysis(analysis);
        } catch (error) {
            console.error(error);
        } finally {
            setIsComparing(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Resume Dashboard</h1>
                <p className="text-slate-500 mt-2">Upload your resume to get started with the analysis.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Upload */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Resume Upload Area */}
                    <div
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400'
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                <UploadCloud className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">
                                {isAnalyzing
                                    ? (analysisStatus === 'extracting' ? "Reading PDF..." : "AI Structuring...")
                                    : (fileName ? fileName : "Upload Resume (PDF)")}
                            </h3>

                            <input
                                type="file"
                                id="resume-upload"
                                className="hidden"
                                accept=".pdf"
                                onChange={handleFileChange}
                            />
                            <label
                                htmlFor="resume-upload"
                                className="mt-2 text-sm text-blue-600 font-medium hover:text-blue-800 cursor-pointer"
                            >
                                {fileName ? "Change File" : "Click to Browse"}
                            </label>
                        </div>
                    </div>

                    {/* Job Description Input (Phase 3) */}
                    <JobDescriptionInput onJDParsed={setJdData} />

                    {/* Gap Analysis Results (Phase 3) */}
                    {gapAnalysis && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="bg-slate-900 p-6 flex items-center justify-between text-white">
                                <div>
                                    <h3 className="text-xl font-bold">Match Analysis</h3>
                                    <p className="text-slate-400 text-sm">Resume vs. Job Description</p>
                                </div>
                                <div className="text-center">
                                    <div className={`text-3xl font-bold ${gapAnalysis.matchScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {gapAnalysis.matchScore}%
                                    </div>
                                    <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Match Score</span>
                                </div>
                            </div>

                            <div className="p-6 grid md:grid-cols-2 gap-8">
                                <div>
                                    <div className="flex items-center gap-2 mb-3 text-rose-600 font-semibold">
                                        <AlertCircle className="w-5 h-5" />
                                        <h3>Missing Critical Skills</h3>
                                    </div>
                                    <ul className="space-y-2">
                                        {gapAnalysis.missingCriticalSkills.map(skill => (
                                            <li key={skill} className="flex items-center gap-2 text-slate-700 bg-rose-50 px-3 py-2 rounded-lg text-sm border border-rose-100">
                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                {skill}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-3 text-emerald-600 font-semibold">
                                        <Target className="w-5 h-5" />
                                        <h3>Your Strengths</h3>
                                    </div>
                                    <ul className="space-y-2">
                                        {gapAnalysis.strengthAreas.map(skill => (
                                            <li key={skill} className="flex items-center gap-2 text-slate-700 bg-emerald-50 px-3 py-2 rounded-lg text-sm border border-emerald-100">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                {skill}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Compare Action */}
                    {resumeData && jdData && !gapAnalysis && (
                        <div className="flex justify-center pt-4">
                            <button
                                onClick={handleCompare}
                                disabled={isComparing}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg shadow-blue-200 transition-all transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
                            >
                                {isComparing ? "Analyzing Gaps..." : "Compare Resume to JD"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Column: Analysis Results */}
                <div className="space-y-6">
                    {resumeData ? (
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                <h3 className="font-semibold text-slate-900">Resume Structured</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <p className="text-sm text-slate-500 mb-1">Detected Name</p>
                                    <p className="font-medium text-slate-900">{resumeData.contactInfo.name}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-slate-500 mb-2">Success Metrics</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {resumeData.skills.technical.map(skill => (
                                            <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-medium text-slate-900">Latest Experience</p>
                                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                                            AI Tips Available
                                        </span>
                                    </div>
                                    {resumeData.experience.map((exp, i) => (
                                        <div key={i} className="mb-6 last:mb-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <p className="text-sm font-semibold text-slate-900">{exp.role}</p>
                                                <p className="text-xs text-slate-500">{exp.startDate} - {exp.endDate}</p>
                                            </div>
                                            <p className="text-xs text-slate-500 mb-2">{exp.company}</p>

                                            <div className="space-y-1 pl-2 border-l-2 border-slate-100">
                                                {exp.bullets.map((bullet, j) => (
                                                    <BulletPointEditor
                                                        key={j}
                                                        originalText={bullet}
                                                        roleContext={exp.role}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm opacity-50 pointer-events-none">
                            <h3 className="font-semibold text-slate-900 mb-4">Analysis Results</h3>
                            <div className="h-4 bg-slate-100 rounded-full w-full mb-2"></div>
                            <div className="h-4 bg-slate-100 rounded-full w-2/3"></div>
                            <p className="text-xs text-slate-400 mt-4">
                                {analysisStatus === 'structuring' ? "AI is analyzing structure..." : "Upload a resume to unlock insights."}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
