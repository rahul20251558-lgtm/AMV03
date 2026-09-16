const fs = require('fs');
const content = fs.readFileSync('src/components/MLTDocumentViewer.tsx', 'utf8');

let newContent = content.replace(
  /\{\/\* Info Table \*\/\}[\s\S]*?<\/table>/,
  `{/* Metadata Table */}
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-xs border-collapse border border-zinc-300">
            <tbody>
              <tr>
                <td className="w-1/3 bg-zinc-50 font-bold border border-zinc-300 px-3 py-1.5 text-zinc-700">Document No.</td>
                <td className="w-2/3 border border-zinc-300 px-3 py-1.5 font-mono font-bold text-zinc-900">{docNo}</td>
              </tr>
              <tr>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1.5 text-zinc-700">Product Name</td>
                <td className="border border-zinc-300 px-3 py-1.5 font-bold text-zinc-900">{data.productName}</td>
              </tr>
              <tr>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1.5 text-zinc-700">Label Claim</td>
                <td className="border border-zinc-300 px-3 py-1.5 text-zinc-800">{data.strength}</td>
              </tr>
              <tr>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1.5 text-zinc-700">Test Parameter</td>
                <td className="border border-zinc-300 px-3 py-1.5 text-zinc-800">Microbial Limit Test — Total Viable Aerobic Count, Total Combined Moulds and Yeasts Count, and Tests for Specified Micro-organisms</td>
              </tr>
              <tr>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1.5 text-zinc-700">Reference</td>
                <td className="border border-zinc-300 px-3 py-1.5 text-zinc-800">{data.references.join(', ')}; in-house SOP No. [Current Version]</td>
              </tr>
              <tr>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1.5 text-zinc-700">Batch No. Used</td>
                <td className="border border-zinc-300 px-3 py-1.5 font-mono font-bold text-zinc-900">{data.batchNo}</td>
              </tr>
              <tr>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1.5 text-zinc-700">Effective Date</td>
                <td className="border border-zinc-300 px-3 py-1.5 text-zinc-800">{docDate}</td>
              </tr>
            </tbody>
          </table>
        </div>`
);

// Update APPROVALS table to use px-3 py-1.5 text-xs text-center
newContent = newContent.replace(
  /\{\/\* APPROVALS \*\/\}[\s\S]*?<\/table>/,
  `{/* APPROVALS */}
        <h3 className={\`text-xs font-bold uppercase mb-1 \${sectionHeadingClass}\`}>APPROVALS / SIGN-OFF</h3>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-xs border-collapse border border-zinc-300 text-center">
            <thead>
              <tr className={tableHeaderClass}>
                <th className="border border-zinc-300 p-2">ACTIVITY</th>
                <th className="border border-zinc-300 p-2">DESIGNATION</th>
                <th className="border border-zinc-300 p-2">NAME</th>
                <th className="border border-zinc-300 p-2">SIGNATURE</th>
                <th className="border border-zinc-300 p-2">DATE</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-zinc-300 p-2 font-semibold bg-zinc-50">Prepared By</td><td className="border border-zinc-300 p-2">Microbiologist, Quality Control</td><td className="border border-zinc-300 p-2"></td><td className="border border-zinc-300 p-2"></td><td className="border border-zinc-300 p-2"></td></tr>
              <tr><td className="border border-zinc-300 p-2 font-semibold bg-zinc-50">Checked By</td><td className="border border-zinc-300 p-2">Executive Microbiologist, Quality Control</td><td className="border border-zinc-300 p-2"></td><td className="border border-zinc-300 p-2"></td><td className="border border-zinc-300 p-2"></td></tr>
              <tr><td className="border border-zinc-300 p-2 font-semibold bg-zinc-50">Reviewed By</td><td className="border border-zinc-300 p-2">Manager, Quality Control</td><td className="border border-zinc-300 p-2"></td><td className="border border-zinc-300 p-2"></td><td className="border border-zinc-300 p-2"></td></tr>
              <tr><td className="border border-zinc-300 p-2 font-semibold bg-zinc-50">Authorized By</td><td className="border border-zinc-300 p-2">Manager, Quality Assurance</td><td className="border border-zinc-300 p-2"></td><td className="border border-zinc-300 p-2"></td><td className="border border-zinc-300 p-2"></td></tr>
            </tbody>
          </table>
        </div>`
);

// Fix text-sm to text-xs across all general narrative tags.
newContent = newContent.replace(/text-sm/g, "text-xs");

fs.writeFileSync('src/components/MLTDocumentViewer.tsx', newContent);
