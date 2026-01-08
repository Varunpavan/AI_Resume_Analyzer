import { useState } from 'react';
import { Wand2, Check, ArrowRight, RefreshCw } from 'lucide-react';
import { AiService } from '../services/ai-evaluator';
import type { BulletImprovement } from '../types/domain';

interface BulletPointEditorProps {
    originalText: string;
    roleContext: string;
}

export function BulletPointEditor({ originalText, roleContext }: BulletPointEditorProps) {
    const [isImproving, setIsImproving] = useState(false);
    const [improvement, setImprovement] = useState<BulletImprovement | null>(null);
    const [accepted, setAccepted] = useState(false);

    const handleImprove = async () => {
        setIsImproving(true);
        try {
            const result = await AiService.improveBulletPoint(originalText, roleContext);
            setImprovement(result);
        } catch (error) {
            console.error(error);
        } finally {
            setIsImproving(false);
        }
    };

    if (accepted && improvement) {
        return (
            <div className="flex items-start gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-sm">
                <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-emerald-900 font-medium">{improvement.improvedVersions[0].text}</span>
            </div>
        );
    }

    return (
        <div className="group relative">
            {!improvement ? (
                <div className="flex items-start justify-between gap-4 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <p className="text-slate-700 text-sm leading-relaxed">{originalText}</p>
                    <button
                        onClick={handleImprove}
                        disabled={isImproving}
                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1.5 text-blue-600 hover:bg-blue-100 rounded-md disabled:opacity-50"
                        title="Improve with AI"
                    >
                        {isImproving ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Wand2 className="w-4 h-4" />
                        )}
                    </button>
                </div>
            ) : (
                <div className="mt-2 bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 bg-blue-50/50 border-b border-blue-100 flex items-center gap-2">
                        <Wand2 className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-semibold text-blue-800 uppercase tracking-wide">AI Recommendation</span>
                    </div>

                    <div className="p-4 grid gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-slate-500 uppercase font-semibold">
                                <span className="bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded">Before</span>
                            </div>
                            <p className="text-slate-500 text-sm line-through decoration-rose-400/50 decoration-2">{originalText}</p>
                        </div>

                        <div className="flex justify-center">
                            <ArrowRight className="w-4 h-4 text-slate-300 transform rotate-90" />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-500 uppercase font-semibold">
                                <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">After</span>
                                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">
                                    {improvement.improvedVersions[0].type}
                                </span>
                            </div>
                            <p className="text-slate-900 text-sm font-medium">{improvement.improvedVersions[0].text}</p>
                            <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded block">
                                💡 Why: {improvement.improvedVersions[0].reasoning}
                            </p>
                        </div>
                    </div>

                    <div className="p-3 bg-slate-50 flex gap-2 justify-end">
                        <button
                            onClick={() => setImprovement(null)}
                            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                            Discard
                        </button>
                        <button
                            onClick={() => setAccepted(true)}
                            className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                        >
                            <Check className="w-3.5 h-3.5" />
                            Accept Change
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
