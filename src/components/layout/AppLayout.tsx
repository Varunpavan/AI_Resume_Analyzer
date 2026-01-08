import { Outlet, Link } from 'react-router-dom';

export function AppLayout() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <header className="border-b bg-white sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        ResumeAI
                    </Link>
                    <nav className="flex gap-4">
                        <Link to="/" className="text-sm font-medium hover:text-blue-600 transition-colors">Home</Link>
                        <Link to="/dashboard" className="text-sm font-medium hover:text-blue-600 transition-colors">Dashboard</Link>
                    </nav>
                </div>
            </header>
            <main>
                <Outlet />
            </main>
        </div>
    );
}
