import { useEffect, useRef, useState } from "react";
import { parseCv } from "../api";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { renderAsync } from "docx-preview";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

export default function CvPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [parsed, setParsed] = useState<any>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageWidth, setPageWidth] = useState<number>(0);

  const docxContainerRef = useRef<HTMLDivElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  // Watch for container size changes
  useEffect(() => {
    if (!pdfContainerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        setPageWidth(entries[0].contentRect.width);
      }
    });
    resizeObserver.observe(pdfContainerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (file && file.type.includes("word") && fileUrl && docxContainerRef.current) {
      fetch(fileUrl)
        .then((res) => res.arrayBuffer())
        .then((buf) => renderAsync(buf, docxContainerRef.current!))
        .catch(() => {});
    }
  }, [file, fileUrl]);

  const onUpload = async () => {
    if (!file) return;
    const res = await parseCv(file);
    setParsed(res);
  };

  const isPdf = file?.type === "application/pdf";

  return (
    <div className="grid grid-cols-2 h-screen bg-gray-100 p-6 gap-6">
      {/* Left: CV Preview */}
      <div className="flex flex-col bg-white shadow-xl rounded-2xl overflow-hidden border">
        {/* Upload controls */}
        <div className="p-4 border-b flex items-center gap-3 bg-gray-50">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="block w-full text-sm text-gray-700
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-blue-600 file:text-white
                      hover:file:bg-blue-700
                      file:cursor-pointer"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <button
            onClick={onUpload}
            disabled={!file}
            className="px-4 py-2 rounded-md text-white font-medium
                      bg-blue-600 disabled:bg-gray-400
                      hover:bg-blue-700 transition-colors
                      cursor-pointer disabled:cursor-not-allowed"
          >
            Parse CV
          </button>
        </div>

        {/* Preview */}
        <div ref={pdfContainerRef} className="flex-1 overflow-auto p-6">
          {!file && (
            <div className="text-gray-400 h-full flex items-center justify-center text-center">
              Upload a PDF or DOCX to preview
            </div>
          )}

          {isPdf && fileUrl && pageWidth > 0 && (
            <Document file={fileUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
              {Array.from(new Array(numPages ?? 0), (_, i) => (
                <Page key={i} pageNumber={i + 1} width={pageWidth - 32} />
              ))}
            </Document>
          )}

          {!isPdf && file && <div ref={docxContainerRef} className="prose max-w-none" />}
        </div>
      </div>

      {/* Right: Parsed results */}
      <div className="flex flex-col bg-white shadow-xl rounded-2xl overflow-hidden border">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Parsed Result</h3>
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
