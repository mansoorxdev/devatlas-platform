import { useNavigate, Link } from 'react-router-dom';
import {
  Wrench,
  ArrowRight,
  FileJson,
  KeyRound,
  Hash,
  Binary,
  Link2,
} from 'lucide-react';
import { ToolCard } from './ToolCard';
import { APP_PATHS } from '@/constants';

const SHOWCASE_TOOLS = [
  {
    id: 'json-formatter',
    title: 'JSON Formatter',
    description: 'Format, validate, and minify JSON instantly in your browser.',
    category: 'JSON Utilities',
    icon: FileJson,
    route: '/devtools?tool=json-formatter',
  },
  {
    id: 'jwt-decoder',
    title: 'JWT Inspector',
    description: 'Decode JWT headers, payloads, and time-based claims locally.',
    category: 'Security',
    icon: KeyRound,
    route: '/devtools?tool=jwt-decoder',
  },
  {
    id: 'uuid-generator',
    title: 'UUID & Key Generator',
    description: 'Generate UUIDs and secure secret keys using browser cryptography.',
    category: 'Generators',
    icon: Hash,
    route: '/devtools?tool=uuid-generator',
  },
  {
    id: 'base64',
    title: 'Base64 Encoder',
    description: 'Encode and decode text with UTF-8 and Base64 support.',
    category: 'Encoders',
    icon: Binary,
    route: '/devtools?tool=base64',
  },
  {
    id: 'url-encoder',
    title: 'URL Encoder',
    description: 'Encode and decode URL components safely in your browser.',
    category: 'Encoders',
    icon: Link2,
    route: '/devtools?tool=url-encoder',
  },
];

export function DevToolsShowcaseSection() {
  const navigate = useNavigate();

  return (
    <section className="mb-14" aria-labelledby="devtools-showcase-heading">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-1">
            <Wrench size={14} />
            <span>DevTools</span>
          </div>
          <h2
            id="devtools-showcase-heading"
            className="text-2xl font-extrabold text-slate-900 dark:text-slate-100"
          >
            Developer Tools
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Fast, private, browser-based utilities for everyday development tasks.
          </p>
        </div>

        <Link
          to={APP_PATHS.DEVTOOLS}
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-500 transition-colors self-start sm:self-auto"
        >
          View All Tools
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Tools Grid (3 cols on desktop, 2 on tablet, 1 on mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SHOWCASE_TOOLS.map((tool) => (
          <ToolCard
            key={tool.id}
            id={tool.id}
            title={tool.title}
            description={tool.description}
            category={tool.category}
            icon={tool.icon}
            isComingSoon={false}
            onClick={() => navigate(tool.route)}
          />
        ))}
      </div>
    </section>
  );
}

export default DevToolsShowcaseSection;
