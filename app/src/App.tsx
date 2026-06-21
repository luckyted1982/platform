import { Routes, Route } from "react-router";
import { PlatformLayout } from "@/components/PlatformLayout";
import { AiAssistant } from "@/components/AiAssistant";
import { HomePage } from "@/pages/platform/HomePage";
import { ServicesPage } from "@/pages/platform/ServicesPage";
import { PartnersPage } from "@/pages/platform/PartnersPage";
import { KnowledgePage } from "@/pages/platform/KnowledgePage";
import { CompaniesPage } from "@/pages/platform/CompaniesPage";
import { PatentServicesPage } from "@/pages/platform/PatentServicesPage";
import { ComputeServicesPage } from "@/pages/platform/ComputeServicesPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/*" element={
          <PlatformLayout>
            <Routes>
              <Route path="platform" element={<HomePage />} />
              <Route path="platform/services" element={<ServicesPage />} />
              <Route path="platform/partners" element={<PartnersPage />} />
              <Route path="platform/knowledge" element={<KnowledgePage />} />
              <Route path="platform/companies" element={<CompaniesPage />} />
              <Route path="platform/patent-services" element={<PatentServicesPage />} />
              <Route path="platform/compute-services" element={<ComputeServicesPage />} />
              <Route path="zeta-score" element={<ZetaScorePlaceholder />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </PlatformLayout>
        } />
      </Routes>
      <AiAssistant floating />
    </>
  );
}

function ZetaScorePlaceholder() {
  return (
    <div className="p-8 max-w-7xl mx-auto flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-20 h-20 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">创新能力评测系统</h2>
        <p className="text-gray-400 mb-6">专业的AI-Infra早期项目评价体系</p>
        <a href="https://7t5p5hkrrbpye.ok.kimi.link" target="_blank" rel="noopener noreferrer"
          className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl transition-colors inline-flex items-center gap-2">
          打开评测系统
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
        </a>
      </div>
    </div>
  );
}

export default App;
