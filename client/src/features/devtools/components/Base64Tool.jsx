import { useState } from 'react';
import {
  Binary,
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

// UTF-8 string to Base64
function utf8ToBase64(str, isUrlSafe = false) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  let base64 = window.btoa(binary);
  if (isUrlSafe) {
    base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  return base64;
}

// Base64 to UTF-8 string
function base64ToUtf8(str) {
  let base64 = str.trim().replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binaryString = window.atob(base64);
  const bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function Base64Tool({ onBackToHub }) {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isUrlSafe, setIsUrlSafe] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleEncode = () => {
    if (!inputText.trim()) {
      setErrorState('Please enter text to encode.');
      setOutputText('');
      return;
    }

    try {
      const encoded = utf8ToBase64(inputText, isUrlSafe);
      setOutputText(encoded);
      setErrorState(null);
      setStatusMessage(`Encoded successfully as ${isUrlSafe ? 'Base64URL' : 'Standard Base64'}.`);
    } catch (err) {
      setErrorState(`Encoding Error: ${err.message}`);
      setOutputText('');
    }
  };

  const handleDecode = () => {
    if (!inputText.trim()) {
      setErrorState('Please enter Base64 string to decode.');
      setOutputText('');
      return;
    }

    try {
      const decoded = base64ToUtf8(inputText);
      setOutputText(decoded);
      setErrorState(null);
      setStatusMessage('Decoded Base64 string successfully.');
    } catch (err) {
      setErrorState(`Invalid Base64 Input: Cannot decode payload (${err.message}).`);
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
                Base64 Encoder / Decoder
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 uppercase">
                <ShieldCheck size={12} />
                UTF-8 Client-Side
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Encode and decode plain text or Base64 strings with UTF-8 support. Data stays in your browser.
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
            Encode Base64
          </button>

          <button
            onClick={handleDecode}
            disabled={!inputText.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Decode Base64
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

      {/* Options Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs">
        <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={isUrlSafe}
            onChange={(e) => setIsUrlSafe(e.target.checked)}
            className="w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-500 cursor-pointer"
          />
          <span>Use URL-Safe Base64 Encoding (replacing + with - and / with _)</span>
        </label>
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
              <FileCode size={14} /> Input Text
            </span>
            <span className="font-mono text-[11px]">{inputText.length} chars</span>
          </div>

          <textarea
            aria-label="Base64 Input Text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste plain text or Base64 string here..."
            className="w-full h-80 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-mono text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none leading-relaxed"
          />
        </div>

        {/* Output Textarea Container */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span className="flex items-center gap-1">
              <Binary size={14} /> Result Output
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
              <code>{outputText || '// Encoded or decoded output will appear here...'}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Base64Tool;
