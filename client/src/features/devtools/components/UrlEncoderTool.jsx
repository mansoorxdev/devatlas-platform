import { useState } from 'react';
import {
  Link2,
  ArrowLeft,
  RotateCcw,
  Copy,
  Check,
  ArrowLeftRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileCode,
} from 'lucide-react';

export function UrlEncoderTool({ onBackToHub }) {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [errorState, setErrorState] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleEncode = () => {
    if (!inputText.trim()) {
      setErrorState('Please enter URL text to encode.');
      setOutputText('');
      return;
    }

    try {
      const encoded = encodeURIComponent(inputText);
      setOutputText(encoded);
      setErrorState(null);
      setStatusMessage('URL component encoded successfully.');
    } catch (err) {
      setErrorState(`Encoding Error: ${err.message}`);
      setOutputText('');
    }
  };

  const handleDecode = () => {
    if (!inputText.trim()) {
      setErrorState('Please enter percent-encoded text to decode.');
      setOutputText('');
      return;
    }

    try {
      const decoded = decodeURIComponent(inputText);
      setOutputText(decoded);
      setErrorState(null);
      setStatusMessage('URL component decoded successfully.');
    } catch (err) {
      setErrorState(`Malformed Percent-Encoding: Cannot decode string (${err.message}).`);
      setOutputText('');
    }
  };

  const handleSwap = () => {
    setInputText(outputText);
    setOutputText(inputText);
    setErrorState(null);
    setStatusMessage('Swapped Input and Output fields.');
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setErrorState(null);
    setStatusMessage(null);
  };

  const handleCopyOutput = () => {
    if (!outputText) return;
    try {
      navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
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
                URL Encoder / Decoder
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 uppercase">
                <ShieldCheck size={12} />
                Client-Side
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Encode and decode URL query parameters and URI components safely in your browser.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleEncode}
            disabled={!inputText.trim()}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Encode URL
          </button>

          <button
            onClick={handleDecode}
            disabled={!inputText.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Decode URL
          </button>

          <button
            onClick={handleSwap}
            disabled={!outputText}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
            title="Swap Input and Output"
          >
            <ArrowLeftRight size={14} />
            <span>Swap</span>
          </button>

          <button
            onClick={handleClear}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
          >
            <RotateCcw size={14} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Status or Error Banner */}
      {errorState ? (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-xs font-medium text-rose-700 dark:text-rose-300">
          <XCircle size={16} className="shrink-0" />
          <span>{errorState}</span>
        </div>
      ) : statusMessage ? (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{statusMessage}</span>
        </div>
      ) : null}

      {/* Inputs & Outputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Textarea */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span className="flex items-center gap-1">
              <FileCode size={14} /> Input Text or URL Component
            </span>
            <span className="font-mono text-[11px]">{inputText.length} chars</span>
          </div>

          <textarea
            aria-label="URL Input Text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste URL or query component here (e.g. https://example.com/search?q=devatlas platform)..."
            className="w-full h-80 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-mono text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none leading-relaxed"
          />
        </div>

        {/* Output Textarea Container */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span className="flex items-center gap-1">
              <Link2 size={14} /> Encoded / Decoded Output
            </span>
            {outputText && (
              <button
                onClick={handleCopyOutput}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-emerald-500" />
                    <span className="text-emerald-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Copy Result</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="relative w-full h-80 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
            <pre className="p-4 flex-grow overflow-auto font-mono text-xs text-slate-200 leading-relaxed">
              <code>{outputText || '// Encoded or decoded URL output will appear here...'}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UrlEncoderTool;
