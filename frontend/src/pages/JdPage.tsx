import { useState } from "react";
import { parseJd } from "../api";

export default function JdPage() {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<any>(null);

  const onParse = async () => {
    if (!text.trim()) return;
    const res = await parseJd(text); // { success, originalText, data:{...} }
    setParsed(res);
  };

  return (
    <div className="grid grid-cols-2 h-screen bg-gray-100 p-6 gap-6">
      {/* Left: JD input */}
      <div className="flex flex-col bg-white shadow-xl rounded-2xl overflow-hidden border">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Job Description</h3>
          <button
            onClick={onParse}
            disabled={!text.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium 
                      hover:bg-blue-700 transition-colors 
                      cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Parse JD
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste job description here…"
          className="flex-1 p-4 resize-none outline-none text-gray-800 text-sm leading-relaxed"
        />
      </div>

      {/* Right: Parsed JD */}
      <div className="flex flex-col bg-white shadow-xl rounded-2xl overflow-hidden border">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Parsed JD</h3>
        </div>
        <div className="flex-1 overflow-auto p-6 font-mono text-sm text-gray-800 whitespace-pre-wrap">
          {!parsed && (
            <div className="text-gray-400 flex items-center justify-center h-full">
              Nothing parsed yet.
            </div>
          )}
          {parsed && <pre>{JSON.stringify(parsed, null, 2)}</pre>}
        </div>
      </div>
    </div>
  );
}
