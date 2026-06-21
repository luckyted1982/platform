import { Link, useLocation, Outlet } from 'react-router';
import { cn } from '@/lib/utils';
import { LayoutDashboard, PlusCircle, Library, Zap } from 'lucide-react';

const navItems = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/new', label: '新建评价', icon: PlusCircle },
  { path: '/library', label: '项目库', icon: Library },
];

export function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#111A25] text-white flex">
      {/* 侧边栏 */}
      <aside className="w-64 bg-[#0D1117] border-r border-[#2A3A4D] flex flex-col fixed h-full">
        <div className="p-6 border-b border-[#2A3A4D]">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#C9A96E] rounded flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#111A25]" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">ZETA-Score</h1>
              <p className="text-[11px] text-[#8A9BB0] -mt-0.5">AI Agent 评价系统</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  isActive 
                    ? 'bg-[#C9A96E]/10 text-[#C9A96E] border border-[#C9A96E]/20' 
                    : 'text-[#8A9BB0] hover:text-white hover:bg-[#1A2535]'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#2A3A4D]">
          <div className="bg-[#1A2535] rounded-lg p-3 border border-[#2A3A4D]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-[#8A9BB0]">AI Agents 就绪</span>
            </div>
            <div className="text-[11px] text-[#8A9BB0]">
              6 Specialist Agents + HITL
            </div>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 ml-64">
        <Outlet />
      </main>
    </div>
  );
}
