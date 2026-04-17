"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession, User } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

interface Template {
  id: string;
  name: string;
  description: string;
  category: "Journal" | "Document" | "Evaluation" | "Letter";
  format: "PDF" | "DOCX";
  size: string;
}

const sampleTemplates: Template[] = [
  { id: "1", name: "Daily Journal Template", description: "Standard format for daily activities and learning logs.", category: "Journal", format: "DOCX", size: "45 KB" },
  { id: "2", name: "Weekly Progress Report", description: "Consolidated weekly report format for performance monitoring.", category: "Document", format: "PDF", size: "120 KB" },
  { id: "3", name: "Self-Evaluation Form", description: "Mid-term and final self-evaluation questionnaire.", category: "Evaluation", format: "PDF", size: "85 KB" },
  { id: "4", name: "Endorsement Letter Draft", description: "Official endorsement letter template for partner companies.", category: "Letter", format: "DOCX", size: "32 KB" },
];

export default function TemplatesPage() {
  const router = useRouter();
  const [session, setSession] = useState<User | null>(null);

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession) {
      router.push("/login");
      return;
    }
    setSession(currentSession);
  }, []);

  if (!session) return null;

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar session={session} />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar session={session} title="Requirement Templates" />
        
        <div className="flex-1 overflow-y-auto p-8 animate-in">
          <div className="max-w-6xl mx-auto space-y-10">
            <div>
              <h2 className="text-3xl font-black text-foreground tracking-tight">System Templates</h2>
              <p className="text-sm font-medium text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                Download the official templates required for your practicum. Ensure you use the latest versions for all your submissions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sampleTemplates.map((t) => (
                <div key={t.id} className="glass p-8 rounded-[2.5rem] border-border/50 shadow-xl shadow-primary/5 group hover:border-primary/30 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        t.category === 'Journal' ? 'bg-primary/10 text-primary' : 
                        t.category === 'Evaluation' ? 'bg-violet-500/10 text-violet-600' :
                        t.category === 'Letter' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {t.category}
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t.format} • {t.size}</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">{t.name}</h3>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed mb-8">{t.description}</p>
                  </div>
                  
                  <button className="w-full py-4 rounded-2xl bg-secondary text-foreground font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white shadow-sm hover:shadow-xl hover:shadow-primary/20 transition-all flex items-center justify-center gap-3">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download Template
                  </button>
                </div>
              ))}
            </div>

            <div className="p-10 rounded-[3rem] bg-primary/5 border border-primary/10 flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/20">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h4 className="text-lg font-black text-foreground">Need a different format?</h4>
                <p className="text-sm font-medium text-muted-foreground mt-1">If you require a template that is not listed here, please contact your advisor or the administration office.</p>
              </div>
              <button onClick={() => router.push("/messages")} className="text-xs font-black text-primary uppercase tracking-[0.2em] hover:underline">Contact Advisor</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
