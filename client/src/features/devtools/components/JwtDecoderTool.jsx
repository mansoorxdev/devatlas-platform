import { useState } from 'react';
import {
  KeyRound,
  ShieldAlert,
  ArrowLeft,
  RotateCcw,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCode,
  Lock,
} from 'lucide-react';

// Helper: Pure browser Base64URL decoding with UTF-8 support
function base64UrlDecode(str) {
  try {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binaryString = window.atob(base64);
    const bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch (err) {
    throw new Error('Invalid Base64URL segment encoding.');
  }
}

// Format Epoch Timestamp to Human Readable String
function formatTimestamp(epochSec) {
  if (typeof epochSec !== 'number') return null;
  const date = new Date(epochSec * 1000);
  return date.toUTCString();
}

export function JwtDecoderTool({ onBackToHub }) {
  const [tokenInput, setTokenInput] = useState('');
  const [decodedData, setDecodedData] = useState(null);
  const [errorState, setErrorState] = useState(null);
  const [copiedSection, setCopiedSection] = useState(null);

  // Decode JWT Token
  const handleDecodeJwt = (tokenToDecode = tokenInput) => {
    const trimmed = tokenToDecode.trim();
    if (!trimmed) {
      setErrorState('Please paste a JWT token to decode.');
      setDecodedData(null);
      return;
    }

    const parts = trimmed.split('.');
    if (parts.length !== 3) {
      setErrorState(`Invalid JWT structure: Expected 3 dot-separated segments (Header.Payload.Signature), got ${parts.length}.`);
      setDecodedData(null);
      return;
    }

    try {
      // Decode Header
      const rawHeaderJson = base64UrlDecode(parts[0]);
      const headerObj = JSON.parse(rawHeaderJson);

      // Decode Payload
      const rawPayloadJson = base64UrlDecode(parts[1]);
      const payloadObj = JSON.parse(rawPayloadJson);

      // Inspect Claims (exp, iat, nbf)
      const nowEpoch = Math.floor(Date.now() / 1000);
      let expStatus = null;

      if (payloadObj.exp && typeof payloadObj.exp === 'number') {
        const isExpired = payloadObj.exp <= nowEpoch;
        expStatus = {
          isExpired,
          formatted: formatTimestamp(payloadObj.exp),
          label: isExpired ? 'Expired' : 'Valid / Unexpired',
        };
      }

      const iatFormatted = payloadObj.iat ? formatTimestamp(payloadObj.iat) : null;
      const nbfFormatted = payloadObj.nbf ? formatTimestamp(payloadObj.nbf) : null;

      setDecodedData({
        headerObj,
        headerFormatted: JSON.stringify(headerObj, null, 2),
        payloadObj,
        payloadFormatted: JSON.stringify(payloadObj, null, 2),
        signatureRaw: parts[2],
        expStatus,
        iatFormatted,
        nbfFormatted,
      });

      setErrorState(null);
    } catch (err) {
      setErrorState(`Failed to decode JWT: ${err.message}`);
      setDecodedData(null);
    }
  };

  const handleClear = () => {
    setTokenInput('');
    setDecodedData(null);
    setErrorState(null);
  };

  const handleCopySection = (text, sectionName) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      setCopiedSection(sectionName);
      setTimeout(() => setCopiedSection(null), 2500);
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
                JWT Inspector & Decoder
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 uppercase">
                <Lock size={12} />
                Client-Side Inspector
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Inspect JWT header, payload claims, and expiration dates. Tokens are decoded 100% in your browser.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDecodeJwt()}
            disabled={!tokenInput.trim()}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <KeyRound size={14} />
            <span>Decode JWT</span>
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

      {/* Security Disclaimer Banner */}
      <div className="p-3.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
        <ShieldAlert size={18} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <div>
          <span className="font-bold">Security & Authenticity Notice:</span> This tool decodes Base64URL JWT headers and payloads for inspection only. It does <span className="underline">NOT</span> verify cryptographic signature authenticity. Decoded tokens are never sent to a server.
        </div>
      </div>

      {/* Error Banner */}
      {errorState && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-xs font-medium text-rose-700 dark:text-rose-300">
          <XCircle size={16} className="shrink-0" />
          <span>{errorState}</span>
        </div>
      )}

      {/* Token Input Box */}
      <div className="flex flex-col space-y-2">
        <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold px-1 flex items-center justify-between">
          <span>Encoded JWT Token Input</span>
          <span className="font-mono text-[11px] text-slate-400">Header.Payload.Signature</span>
        </label>

        <textarea
          aria-label="Encoded JWT Token Input"
          value={tokenInput}
          onChange={(e) => {
            setTokenInput(e.target.value);
            if (e.target.value.trim().split('.').length === 3) {
              handleDecodeJwt(e.target.value);
            }
          }}
          placeholder="Paste encoded JWT token here (e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c)..."
          className="w-full h-28 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-mono text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none leading-relaxed"
        />
      </div>

      {/* Decoded Output Sections */}
      {decodedData && (
        <div className="space-y-6 pt-2">
          {/* Claim Timestamps Cards */}
          {(decodedData.expStatus || decodedData.iatFormatted || decodedData.nbfFormatted) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Expiration Claim */}
              {decodedData.expStatus && (
                <div
                  className={`p-4 rounded-2xl border ${
                    decodedData.expStatus.isExpired
                      ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                      : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="uppercase font-mono">exp (Expiration)</span>
                    {decodedData.expStatus.isExpired ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-300">
                        <AlertTriangle size={12} /> Expired
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-300">
                        <CheckCircle2 size={12} /> Unexpired
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-1">
                    {decodedData.expStatus.formatted}
                  </p>
                </div>
              )}

              {/* Issued At Claim */}
              {decodedData.iatFormatted && (
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase font-mono mb-1">
                    <Clock size={13} /> iat (Issued At)
                  </div>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                    {decodedData.iatFormatted}
                  </p>
                </div>
              )}

              {/* Not Before Claim */}
              {decodedData.nbfFormatted && (
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase font-mono mb-1">
                    <Clock size={13} /> nbf (Not Before)
                  </div>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                    {decodedData.nbfFormatted}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Header & Payload Editors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Decoded Header */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold px-1">
                <span className="flex items-center gap-1">
                  <FileCode size={14} className="text-rose-500" /> Header (Algorithm & Token Type)
                </span>
                <button
                  onClick={() => handleCopySection(decodedData.headerFormatted, 'header')}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                >
                  {copiedSection === 'header' ? (
                    <>
                      <Check size={12} className="text-emerald-500" />
                      <span className="text-emerald-500">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy Header</span>
                    </>
                  )}
                </button>
              </div>

              <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-rose-300 leading-relaxed overflow-x-auto min-h-48">
                <pre><code>{decodedData.headerFormatted}</code></pre>
              </div>
            </div>

            {/* Decoded Payload */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold px-1">
                <span className="flex items-center gap-1">
                  <FileCode size={14} className="text-purple-500" /> Payload (Claims & Data)
                </span>
                <button
                  onClick={() => handleCopySection(decodedData.payloadFormatted, 'payload')}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                >
                  {copiedSection === 'payload' ? (
                    <>
                      <Check size={12} className="text-emerald-500" />
                      <span className="text-emerald-500">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy Payload</span>
                    </>
                  )}
                </button>
              </div>

              <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-purple-300 leading-relaxed overflow-x-auto min-h-48">
                <pre><code>{decodedData.payloadFormatted}</code></pre>
              </div>
            </div>
          </div>

          {/* Decoded Signature View */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold px-1">
              <span className="flex items-center gap-1">
                <Lock size={14} className="text-cyan-500" /> Signature Segment
              </span>
              <button
                onClick={() => handleCopySection(decodedData.signatureRaw, 'signature')}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
              >
                {copiedSection === 'signature' ? (
                  <>
                    <Check size={12} className="text-emerald-500" />
                    <span className="text-emerald-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Copy Signature</span>
                  </>
                )}
              </button>
            </div>

            <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-cyan-300 break-all leading-relaxed">
              <code>{decodedData.signatureRaw}</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JwtDecoderTool;
