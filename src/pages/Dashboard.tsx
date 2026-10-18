
import {
    UploadCloud,
    CheckCircle,
    Target,
    AlertCircle,
    Trash2,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { getPDFText } from '../lib/pdf-utils';
import { AiService } from '../services/ai-evaluator';
import type {
    ResumeStructure,
    JobDescription,
    GapAnalysis,
} from '../types/domain';
import { JobDescriptionInput } from '../components/JobDescriptionInput';
import { BulletPointEditor } from '../components/BulletPointEditor';

export default function Dashboard() {
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Resume analysis state
    const [resumeData, setResumeData] =
        useState<ResumeStructure | null>(null);
    const [analysisStatus, setAnalysisStatus] =
        useState<string>('idle');

    // Job description and comparison state
    const [jdData, setJdData] =
        useState<JobDescription | null>(null);
    const [gapAnalysis, setGapAnalysis] =
        useState<GapAnalysis | null>(null);
    const [isComparing, setIsComparing] = useState(false);

    // Reference to the PDF file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;

        if (files.length > 0 && files[0].type === 'application/pdf') {
            await handleFile(files[0]);
        } else {
            alert('Please upload a PDF file.');
        }
    };

    const handleFileChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (file) {
            await handleFile(file);
        }
    };

    const handleFile = async (file: File) => {
        setFileName(file.name);
        setIsAnalyzing(true);
        setAnalysisStatus('extracting');

        // Clear results from the previous resume
        setResumeData(null);
        setGapAnalysis(null);

        try {
            // Step 1: Extract text from the PDF
            const text = await getPDFText(file);

            // Step 2: Structure the extracted resume data
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
            const analysis = await AiService.compareResumeToJD(
                resumeData,
                jdData
            );

            setGapAnalysis(analysis);
        } catch (error) {
            console.error(error);
        } finally {
            setIsComparing(false);
        }
    };

    // NEW FEATURE: Clear the selected resume and its results
    const handleClearResume = () => {
        setFileName(null);
        setResumeData(null);
        setGapAnalysis(null);
        setAnalysisStatus('idle');

        // Reset the actual file input so the same PDF can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="container mx-auto max-w-5xl px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">
                    Resume Dashboard
                </h1>
                <p className="mt-2 text-slate-500">
                    Upload your resume to get started with the analysis.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Left Column: Upload and comparison */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Resume Upload Area */}
                    <div
                        className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                            isDragging
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-300 hover:border-blue-400'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="flex flex-col items-center justify-center">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                <UploadCloud className="h-6 w-6" />
                            </div>

                            <h3 className="text-lg font-semibold text-slate-900">
                                {isAnalyzing
                                    ? analysisStatus === 'extracting'
                                        ? 'Reading PDF...'
                                        : 'AI Structuring...'
                                    : fileName || 'Upload Resume (PDF)'}
                            </h3>

                            <input
                                ref={fileInputRef}
                                type="file"
                                id="resume-upload"
                                className="hidden"
                                accept=".pdf,application/pdf"
                                onChange={handleFileChange}
                            />

                            <label
                                htmlFor="resume-upload"
                                className="mt-2 cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                                {fileName ? 'Change File' : 'Click to Browse'}
                            </label>
                        </div>
                    </div>

                    {/* NEW FEATURE: Clear Resume Button */}
                    {fileName && (
                        <div className="flex justify-center">
                            <button
                                type="button"
                                onClick={handleClearResume}
                                disabled={isAnalyzing}
                                className="flex items-center gap-2 rounded-full border border-red-300 px-5 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Trash2 className="h-4 w-4" />
                                Clear Resume
                            </button>
                        </div>
                    )}

                    {/* Job Description Input */}
                    <JobDescriptionInput onJDParsed={setJdData} />

                    {/* Gap Analysis Results */}
                    {gapAnalysis && (
                        <div className="animate-in fade-in slide-in-from-bottom-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm duration-700">
                            <div className="flex items-center justify-between bg-slate-900 p-6 text-white">
                                <div>
                                    <h3 className="text-xl font-bold">
                                        Match Analysis
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        Resume vs. Job Description
                                    </p>
                                </div>

                                <div className="text-center">
                                    <div
                                        className={`text-3xl font-bold ${
                                            gapAnalysis.matchScore >= 70
                                                ? 'text-emerald-400'
                                                : 'text-amber-400'
                                        }`}
                                    >
                                        {gapAnalysis.matchScore}%
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Match Score
                                    </span>
                                </div>
                            </div>

                            <div className="grid gap-8 p-6 md:grid-cols-2">
                                <div>
                                    <div className="mb-3 flex items-center gap-2 font-semibold text-rose-600">
                                        <AlertCircle className="h-5 w-5" />
                                        <h3>Missing Critical Skills</h3>
                                    </div>

                                    <ul className="space-y-2">
                                        {gapAnalysis.missingCriticalSkills.map(
                                            (skill) => (
                                                <li
                                                    key={skill}
                                                    className="flex items-center gap-2 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-slate-700"
                                                >
                                                    <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                                    {skill}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>

                                <div>
                                    <div className="mb-3 flex items-center gap-2 font-semibold text-emerald-600">
                                        <Target className="h-5 w-5" />
                                        <h3>Your Strengths</h3>
                                    </div>

                                    <ul className="space-y-2">
                                        {gapAnalysis.strengthAreas.map(
                                            (skill) => (
                                                <li
                                                    key={skill}
                                                    className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-slate-700"
                                                >
                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                    {skill}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Compare Resume to Job Description */}
                    {resumeData && jdData && !gapAnalysis && (
                        <div className="flex justify-center pt-4">
                            <button
                                onClick={handleCompare}
                                disabled={isComparing}
                                className="transform rounded-full bg-blue-600 px-8 py-3 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:scale-105 hover:bg-blue-700 disabled:scale-100 disabled:opacity-50"
                            >
                                {isComparing
                                    ? 'Analyzing Gaps...'
                                    : 'Compare Resume to JD'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Column: Resume Analysis Results */}
                <div className="space-y-6">
                    {resumeData ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm duration-500">
                            <div className="mb-4 flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-emerald-500" />
                                <h3 className="font-semibold text-slate-900">
                                    Resume Structured
                                </h3>
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-lg bg-slate-50 p-4">
                                    <p className="mb-1 text-sm text-slate-500">
                                        Detected Name
                                    </p>
                                    <p className="font-medium text-slate-900">
                                        {resumeData.contactInfo.name}
                                    </p>
                                </div>

                                <div>
                                    <p className="mb-2 text-sm text-slate-500">
                                        Success Metrics
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {resumeData.skills.technical.map(
                                            (skill) => (
                                                <span
                                                    key={skill}
                                                    className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
                                                >
                                                    {skill}
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-4">
                                    <div className="mb-2 flex items-center justify-between">
                                        <p className="text-sm font-medium text-slate-900">
                                            Latest Experience
                                        </p>
                                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                                            AI Tips Available
                                        </span>
                                    </div>

                                    {resumeData.experience.map((exp, i) => (
                                        <div
                                            key={i}
                                            className="mb-6 last:mb-0"
                                        >
                                            <div className="mb-1 flex items-baseline justify-between">
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {exp.role}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {exp.startDate} - {exp.endDate}
                                                </p>
                                            </div>

                                            <p className="mb-2 text-xs text-slate-500">
                                                {exp.company}
                                            </p>

                                            <div className="space-y-1 border-l-2 border-slate-100 pl-2">
                                                {exp.bullets.map(
                                                    (bullet, j) => (
                                                        <BulletPointEditor
                                                            key={j}
                                                            originalText={bullet}
                                                            roleContext={exp.role}
                                                        />
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="pointer-events-none rounded-xl border border-slate-200 bg-white p-6 opacity-50 shadow-sm">
                            <h3 className="mb-4 font-semibold text-slate-900">
                                Analysis Results
                            </h3>
                            <div className="mb-2 h-4 w-full rounded-full bg-slate-100" />
                           <div className="h-4 w-2/3 rounded-full bg-slate-100" />
                            <p className="mt-4 text-xs text-slate-400">
                                {analysisStatus === 'structuring'
                                    ? 'AI is analyzing structure...'
                                    : 'Upload a resume to unlock insights.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
