import { Link } from 'react-router-dom';
import { ArrowRight, FileText, CheckCircle, Zap } from 'lucide-react';

export default function Home() {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-16 pb-32">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl mb-6">
                        Optimize Your Resume with <span className="text-blue-600">AI Precision</span>
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
                        Don't just guess what recruiters want. Use our AI Resume Analyzer to identify gaps,
                        optimize keywords, and rewrite bullet points for maximum impact.
                    </p>
                    <div className="mt-10 flex justify-center gap-x-6">
                        <Link
                            to="/dashboard"
                            className="rounded-full bg-blue-600 px-8 py-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all flex items-center gap-2"
                        >
                            Analyze My Resume <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Feature Grid */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <FeatureCard
                            icon={<FileText className="w-8 h-8 text-blue-600" />}
                            title="Deep Parsing"
                            description="Extracts every detail from your PDF resume using advanced structure recognition."
                        />
                        <FeatureCard
                            icon={<Zap className="w-8 h-8 text-indigo-600" />}
                            title="Job Matching"
                            description="Compares your profile purely against the Job Description to find spacing and skills gaps."
                        />
                        <FeatureCard
                            icon={<CheckCircle className="w-8 h-8 text-emerald-600" />}
                            title="Instant Fixes"
                            description="Don't just see the score. Click to rewrite weak bullet points instantly."
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-600 leading-relaxed">{description}</p>
        </div>
    );
}
