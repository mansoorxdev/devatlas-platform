import { useState, useCallback, useEffect } from 'react';
import {
  Hash,
  ArrowLeft,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  RefreshCw,
  Key,
  Sparkles,
} from 'lucide-react';

// Character Encodings for Secure Key Generation
const CHAR_SETS = {
  hex: '0123456789abcdef',
  base64url: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
  alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
};

// Generate cryptographically secure random string using crypto.getRandomValues()
function generateSecureKey(length, charSetKey) {
  const chars = CHAR_SETS[charSetKey] || CHAR_SETS.alphanumeric;
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

export function UuidGeneratorTool({ onBackToHub }) {
  const [activeMode, setActiveMode] = useState('uuid'); // 'uuid' | 'secretKey'
  const [bulkCount, setBulkCount] = useState(5); // 1-20
  const [keyLength, setKeyLength] = useState(32); // 16-128
  const [encodingMode, setEncodingMode] = useState('alphanumeric'); // 'hex' | 'base64url' | 'alphanumeric'
  const [generatedItems, setGeneratedItems] = useState([]);
  const [copied, setCopied] = useState(false);

  // Perform Generation based on current settings
  const generateValues = useCallback(() => {
    const safeCount = Math.max(1, Math.min(20, Number(bulkCount) || 1));
    const items = [];

    if (activeMode === 'uuid') {
      for (let i = 0; i < safeCount; i++) {
        // Native browser UUID v4 API
        if (typeof window.crypto?.randomUUID === 'function') {
          items.push(window.crypto.randomUUID());
        } else {
          // Fallback using crypto.getRandomValues
          const buf = new Uint8Array(16);
          window.crypto.getRandomValues(buf);
          buf[6] = (buf[6] & 0x0f) | 0x40; // version 4
          buf[8] = (buf[8] & 0x3f) | 0x80; // variant
          const hex = Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('');
          items.push(
            `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
          );
        }
      }
    } else {
      const safeLen = Math.max(16, Math.min(128, Number(keyLength) || 32));
      for (let i = 0; i < safeCount; i++) {
        items.push(generateSecureKey(safeLen, encodingMode));
      }
    }

    setGeneratedItems(items);
  }, [activeMode, bulkCount, keyLength, encodingMode]);

  useEffect(() => {
    generateValues();
  }, [generateValues]);

  const handleCopyAll = () => {
    if (generatedItems.length === 0) return;
    try {
      navigator.clipboard.writeText(generatedItems.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy generated items:', err);
    }
  };

  const handleClear = () => {
    setGeneratedItems([]);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHub}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Back to DevTools Hub"
            aria-label="Back to DevTools Hub"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                UUID & Secure Key Generator
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 uppercase">
                <ShieldCheck size={12} />
                crypto.getRandomValues
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Generate v4 UUIDs and cryptographically secure secret keys in your browser.
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={generateValues}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw size={14} />
            <span>Regenerate</span>
          </button>

          {generatedItems.length > 0 && (
            <button
              onClick={handleCopyAll}
              className="px-3.5 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied All!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy All</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleClear}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
          >
            <RotateCcw size={14} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveMode('uuid')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeMode === 'uuid'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-brand-500/30'
          }`}
        >
          <Hash size={16} />
          <span>UUID v4 Generator</span>
        </button>

        <button
          onClick={() => setActiveMode('secretKey')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeMode === 'secretKey'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-brand-500/30'
          }`}
        >
          <Key size={16} />
          <span>Secure Secret Key Generator</span>
        </button>
      </div>

      {/* Generator Configuration Options */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 text-xs font-medium">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Bulk Count Selector */}
          <div className="flex items-center gap-2">
            <label className="text-slate-600 dark:text-slate-400 font-semibold">Quantity:</label>
            <select
              value={bulkCount}
              onChange={(e) => setBulkCount(Number(e.target.value))}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none"
            >
              {[1, 3, 5, 10, 15, 20].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'item' : 'items'}
                </option>
              ))}
            </select>
          </div>

          {/* Secret Key Specific Options */}
          {activeMode === 'secretKey' && (
            <>
              {/* Length Selector */}
              <div className="flex items-center gap-2">
                <label className="text-slate-600 dark:text-slate-400 font-semibold">Length:</label>
                <select
                  value={keyLength}
                  onChange={(e) => setKeyLength(Number(e.target.value))}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none"
                >
                  {[16, 24, 32, 48, 64, 128].map((len) => (
                    <option key={len} value={len}>
                      {len} chars
                    </option>
                  ))}
                </select>
              </div>

              {/* Character Encoding Selector */}
              <div className="flex items-center gap-2">
                <label className="text-slate-600 dark:text-slate-400 font-semibold">Encoding:</label>
                <select
                  value={encodingMode}
                  onChange={(e) => setEncodingMode(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none"
                >
                  <option value="alphanumeric">Alphanumeric (A-Z, a-z, 0-9)</option>
                  <option value="hex">Hexadecimal (0-9, a-f)</option>
                  <option value="base64url">Base64URL (A-Z, a-z, 0-9, -, _)</option>
                </select>
              </div>
            </>
          )}
        </div>

        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
          <Sparkles size={12} className="text-emerald-500" />
          <span>Random Entropy Source: Web Crypto API</span>
        </div>
      </div>

      {/* Generated Values Output Area */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
          <span>Generated Output ({generatedItems.length})</span>
          <span className="font-mono text-[11px]">One per line</span>
        </div>

        <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto min-h-64">
          {generatedItems.length === 0 ? (
            <p className="text-slate-600">// Click Regenerate to generate values...</p>
          ) : (
            <div className="space-y-1.5">
              {generatedItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between group hover:bg-slate-900/60 p-1 rounded transition-colors">
                  <span>{item}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(item);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-400 hover:text-slate-200 bg-slate-800 px-2 py-0.5 rounded cursor-pointer"
                    title="Copy single item"
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UuidGeneratorTool;
