import { useState } from 'react';
import { Briefcase, ArrowRight, Loader2 } from 'lucide-react';
import type { JobDescription } from '../types/domain';
import { AiService } from '../services/ai-evaluator';

interface JobDescriptionInputProps {
    onJDParsed: (jd: JobDescription) => void;
}

export function JobDescriptionInput({ onJDParsed }: JobDescriptionInputProps) {
    const [text, setText] = useState('');
    const [status, setStatus] = useState<'idle' | 'analyzing' | 'done'>('idle');

    const handleAnalyze = async () => {
        if (!text.trim()) return;

        setStatus('analyzing');
        try {
            const jd = await AiService.extractJobDescription(text);
            onJDParsed(jd);
            setStatus('done');
        } catch (error) {
            console.error(error);
            setStatus('idle');
        }
    };

    if (status === 'done') {
        return (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 flex items-center justify-between animate-in fade-in zoom-in duration-300">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                        <Briefcase className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-emerald-900">Job Description Analyzed</h3>
                        <p className="text-sm text-emerald-700">Ready for comparison</p>
                    </div>
                </div>
                <button
                    onClick={() => setStatus('idle')}
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                    Change JD
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-slate-500" />
                <h3 className="font-semibold text-slate-900">Target Job Description</h3>
            </div>

            <textarea
                className="w-full h-32 p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-4"
                placeholder="Paste the job requirements here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={status === 'analyzing'}
            />

            <button
                onClick={handleAnalyze}
                disabled={!text.trim() || status === 'analyzing'}
                className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-medium text-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
                {status === 'analyzing' ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Extracting Requirements...
                    </>
                ) : (
                    <>
                        Analyze Job Requirements
                        <ArrowRight className="w-4 h-4" />
                    </>
                )}
            </button>
        </div>
    );
}
