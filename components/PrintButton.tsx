// components/PrintButton.tsx

"use client";

export default function PrintButton({ label }: { label?: string }) {
  return (
    <>
      <button
        onClick={() => window.print()}
        className="print-hide px-4 py-2 bg-slate-700 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        {label || "Print / Save PDF"}
      </button>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          /* Hide non-printable elements */
          .print-hide,
          header,
          nav,
          button:not(.print-show),
          [class*="hover:"],
          .sticky {
            /* Don't hide sticky - just unstick it */
          }

          .print-hide {
            display: none !important;
          }

          /* Unstick headers for print */
          .sticky {
            position: relative !important;
          }

          /* Reset backgrounds for readability */
          body {
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Force color printing for the gradients and badges */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Page setup */
          @page {
            size: landscape;
            margin: 1cm;
          }

          /* Avoid breaking inside cards */
          .rounded-2xl,
          .rounded-xl {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          /* Hide interactive elements */
          button {
            display: none !important;
          }

          /* But keep the section headers visible */
          .bg-gradient-to-r,
          [class*="bg-gradient"] {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Remove shadows */
          .shadow-sm,
          .shadow {
            box-shadow: none !important;
          }

          /* Compact spacing */
          .space-y-6 > * + * {
            margin-top: 1rem !important;
          }

          /* Make sure overflow content is visible */
          .overflow-x-auto,
          .overflow-hidden {
            overflow: visible !important;
          }

          /* Hide the page tabs */
          .border-t.border-slate-700 {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
