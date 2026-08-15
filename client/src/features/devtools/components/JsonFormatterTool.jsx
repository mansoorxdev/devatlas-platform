import { useState } from 'react';
import {
  FileJson,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  Minimize2,
  Maximize2,
  ShieldCheck,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';

const MAX_SAFE_INPUT_SIZE = 500000; // ~500KB

export function JsonFormatterTool({ onBackToHub }) {
  const [inputJson, setInputJson] = useState('');
  const [outputJson, setOutputJson] = useState('');
  const [validationState, setValidationState] = useState(null); // { isValid: boolean, message: string }
  const [copied, setCopied] = useState(false);
  const [sizeWarning, setSizeWarning] = useState(false);

  // Validate JSON string safely
  const parseJson = (text) => {
    if (!text.trim()) {
      throw new Error('Input is empty.');
    }
    return JSON.parse(text);
  };

  // Format 2-space indented JSON
  const handleFormat = () => {
    if (!inputJson.trim()) return;

    if (inputJson.length > MAX_SAFE_INPUT_SIZE) {
      setSizeWarning(true);
    }

    try {
      const parsed = parseJson(inputJson);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutputJson(formatted);
      setValidationState({
        isValid: true,
        message: 'Valid JSON — Formatted with 2-space indentation.',
      });
    } catch (err) {
      setOutputJson('');
      setValidationState({
        isValid: false,
        message: `Invalid JSON: ${err.message}`,
      });
    }
  };

  // Minify JSON
  const handleMinify = () => {
    if (!inputJson.trim()) return;

    try {
      const parsed = parseJson(inputJson);
      const minified = JSON.stringify(parsed);
      setOutputJson(minified);
      setValidationState({
        isValid: true,
        message: 'Valid JSON — Minified to compact single line.',
      });
    } catch (err) {
      setOutputJson('');
      setValidationState({
        isValid: false,
        message: `Invalid JSON: ${err.message}`,
      });
    }
  };

  // Validate JSON without changing output
  const handleValidate = () => {
    if (!inputJson.trim()) {
      setValidationState({ isValid: false, message: 'Input JSON is empty.' });
      return;
    }

    try {
      parseJson(inputJson);
      setValidationState({
        isValid: true,
        message: 'Valid JSON Syntax!',
      });
    } catch (err) {
      setValidationState({
        isValid: false,
        message: `Invalid JSON: ${err.message}`,
      });
    }
  };

  // Clear input & output
  const handleClear = () => {
    setInputJson('');
    setOutputJson('');
    setValidationState(null);
    setSizeWarning(false);
  };

  // Copy ONLY output string to clipboard
  const handleCopyOutput = () => {
    const textToCopy = outputJson || inputJson;
    if (!textToCopy) return;

    try {
      navigator.clipboard.writeText(textToCopy);
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
                JSON Formatter & Validator
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 uppercase">
                <ShieldCheck size={12} />
                Client-Side Only
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Format, minify, and validate JSON payloads. Your data never leaves your browser.
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleFormat}
            disabled={!inputJson.trim()}
            className="px-3.5 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Maximize2 size={14} />
            <span>Format</span>
          </button>

          <button
            onClick={handleMinify}
            disabled={!inputJson.trim()}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Minimize2 size={14} />
            <span>Minify</span>
          </button>

          <button
            onClick={handleValidate}
            disabled={!inputJson.trim()}
            className="px-3.5 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 size={14} />
            <span>Validate</span>
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

      {/* Size Guard Warning Banner */}
      {sizeWarning && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
          <AlertTriangle size={16} className="shrink-0" />
          <span>
            Large payload detected ({Math.round(inputJson.length / 1024)} KB). Formatting completed client-side.
          </span>
        </div>
      )}

      {/* Validation Banner */}
      {validationState && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium ${
            validationState.isValid
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {validationState.isValid ? (
              <CheckCircle2 size={16} className="shrink-0" />
            ) : (
              <AlertCircle size={16} className="shrink-0" />
            )}
            <span>{validationState.message}</span>
          </div>
        </div>
      )}

      {/* Main Grid Editors (Input & Output) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Textarea Editor */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span className="flex items-center gap-1">
              <FileJson size={14} /> Input JSON
            </span>
            <span className="font-mono text-[11px]">{inputJson.length} chars</span>
          </div>

          <textarea
            aria-label="Input JSON payload"
            value={inputJson}
            onChange={(e) => {
              setInputJson(e.target.value);
              if (e.target.value.length > MAX_SAFE_INPUT_SIZE) {
                setSizeWarning(true);
              } else {
                setSizeWarning(false);
              }
            }}
            placeholder={`{\n  "name": "DevAtlas",\n  "type": "developer-platform"\n}`}
            className="w-full h-96 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-mono text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none leading-relaxed"
          />
        </div>

        {/* Output View Container */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span className="flex items-center gap-1">
              <FileJson size={14} /> Formatted Output
            </span>
            {(outputJson || inputJson) && (
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
                    <span>Copy Output</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="relative w-full h-96 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
            <pre className="p-4 flex-grow overflow-auto font-mono text-xs text-slate-200 leading-relaxed">
              <code>{outputJson || '// Formatted or minified output will appear here...'}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JsonFormatterTool;
