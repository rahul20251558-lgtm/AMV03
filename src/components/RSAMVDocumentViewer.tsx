import React, { useState } from 'react';
import { RSAMVDocumentData, DocumentType, ThemeFormat, FontFamilyType, FontSizePt } from '../types';
import { Download, Printer, Edit3, Layers, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { FontAndSizeControl } from './FontAndSizeControl';

interface RSAMVDocumentViewerProps {
  data: RSAMVDocumentData;
  docType: DocumentType;
  theme: ThemeFormat;
  fontFamily?: FontFamilyType;
  fontSize?: FontSizePt;
  onFontFamilyChange?: (font: FontFamilyType) => void;
  onFontSizeChange?: (size: FontSizePt) => void;
  onDocTypeChange: (type: DocumentType) => void;
  onThemeChange: (theme: ThemeFormat) => void;
  onDownloadProtocol: () => void;
  onDownloadReport: () => void;
  onDownloadBoth: () => void;
  onUpdateData?: (updated: RSAMVDocumentData) => void;
}

export const RSAMVDocumentViewer: React.FC<RSAMVDocumentViewerProps> = ({
  data,
  docType,
  theme,
  fontFamily = 'Times New Roman',
  fontSize = 12,
  onFontFamilyChange,
  onFontSizeChange,
  onDocTypeChange,
  onThemeChange,
  onDownloadProtocol,
  onDownloadReport,
  onDownloadBoth,
  onUpdateData,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const isProtocol = docType === 'protocol';
  const isBlue = theme === 'blue';

  const fontStyle: React.CSSProperties = {
    fontFamily:
      fontFamily === 'Times New Roman'
        ? '"Times New Roman", Times, "Liberation Serif", Georgia, serif'
        : fontFamily === 'Arial'
        ? 'Arial, Helvetica, "Liberation Sans", sans-serif'
        : fontFamily === 'Calibri'
        ? 'Calibri, "Segoe UI", Candara, sans-serif'
        : fontFamily,
    fontSize: `${fontSize}pt`,
    lineHeight: 1.5,
  };

  const tableHeaderClass = isBlue
    ? 'bg-[#1F4E79] text-white font-bold border-[#1F4E79]'
    : 'bg-zinc-100 text-zinc-900 font-bold border-zinc-300';

  const sectionHeadingClass = isBlue
    ? 'text-[#1F4E79] border-[#1F4E79]'
    : 'text-zinc-900 border-zinc-800';

  const runningHeader = (
    <div className="flex justify-between items-center pb-2 mb-4 border-b border-zinc-300 text-[11px] text-zinc-500 font-sans">
      <span className="font-semibold text-zinc-700">{data.companyName}</span>
      <span>
        {isProtocol ? 'AMV Protocol' : 'AMV Report'} (Related Substances) – {data.productName} | Doc No. {data.protocolNo}
      </span>
    </div>
  );

  const runningFooter = (pageNum: number) => (
    <div className="text-center pt-3 mt-5 border-t border-zinc-200 text-[11px] text-zinc-400 font-sans">
      Page {pageNum} of 8
    </div>
  );

  return (
    <div style={fontStyle} className="space-y-6 text-zinc-900">
      {/* Action Bar */}
      <div className="bg-white border border-zinc-200 rounded-xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-lg border border-zinc-200">
            <button
              type="button"
              onClick={() => onDocTypeChange('protocol')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                docType === 'protocol' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              RS Protocol
            </button>
            <button
              type="button"
              onClick={() => onDocTypeChange('report')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                docType === 'report' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              RS Report
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-lg border border-zinc-200">
            <button
              type="button"
              onClick={() => onThemeChange('blue')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                theme === 'blue' ? 'bg-[#1F4E79] text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-300"></span>
              Executive Blue
            </button>
            <button
              type="button"
              onClick={() => onThemeChange('simple')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                theme === 'simple' ? 'bg-zinc-800 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
              Simple Format (No Color)
            </button>
          </div>

          {/* Typography Controls: Font Family & Font Size (matching uploaded image: Times New Roman 12) */}
          <FontAndSizeControl
            fontFamily={fontFamily}
            fontSize={fontSize}
            onFontFamilyChange={onFontFamilyChange || (() => {})}
            onFontSizeChange={onFontSizeChange || (() => {})}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isProtocol && (
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
                isEditing ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Done Editing' : 'Edit Numerical Values'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onDownloadProtocol}
            className="px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 transition-colors flex items-center gap-1.5"
            title="Download Word .docx for RS Protocol"
          >
            <Download className="w-3.5 h-3.5 text-zinc-600" />
            <span>RS Protocol (.docx)</span>
          </button>

          <button
            type="button"
            onClick={onDownloadReport}
            className="px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-blue-700 hover:bg-blue-800 transition-colors shadow-xs flex items-center gap-1.5"
            title="Download Word .docx for RS Report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>RS Report (.docx)</span>
          </button>

          <button
            type="button"
            onClick={onDownloadBoth}
            className="px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-800 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 transition-colors flex items-center gap-1.5"
            title="Download Both in one click"
          >
            <Layers className="w-3.5 h-3.5 text-zinc-600" />
            <span>Both (.docx)</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 transition-colors"
            title="Print or Save PDF"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 1: MASTHEAD, METADATA, 4-COL APPROVALS, SEC 1, 2, 3 */}
      {/* ========================================================================= */}
      <div className="page-card bg-white border border-zinc-300 rounded-lg shadow-sm p-6 sm:p-8 max-w-5xl mx-auto mb-6">
        <div className="text-center pb-1 pt-1">
          <h1 className={`text-xl sm:text-2xl font-bold uppercase tracking-wide ${sectionHeadingClass}`}>
            {data.companyName}
          </h1>
          <h2 className={`text-sm sm:text-base font-bold uppercase tracking-wider mt-2 ${sectionHeadingClass}`}>
            {isProtocol
              ? 'ANALYTICAL METHOD VALIDATION PROTOCOL'
              : 'ANALYTICAL METHOD VALIDATION REPORT'}
          </h2>
          <h3 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider mt-1">
            {data.subTitle}
          </h3>
        </div>

        <div className={`w-full h-1 my-3 ${isBlue ? 'bg-[#1F4E79]' : 'bg-zinc-800'}`}></div>

        {/* Metadata Table */}
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-xs border-collapse border border-zinc-300">
            <tbody>
              <tr>
                <td className="w-1/3 bg-zinc-50 font-bold border border-zinc-300 px-3 py-1.5 text-zinc-700">
                  {isProtocol ? 'Protocol No.' : 'Report No.'}
                </td>
                <td className="w-2/3 border border-zinc-300 px-3 py-1.5 font-mono font-bold text-zinc-900">
                  {data.protocolNo}
                </td>
              </tr>
              <tr>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1.5 text-zinc-700">
                  {isProtocol ? 'Protocol Date' : 'Report Date'}
                </td>
                <td className="border border-zinc-300 px-3 py-1.5 text-zinc-800">{data.protocolDate}</td>
              </tr>
              <tr>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1.5 text-zinc-700">Product Name</td>
                <td className="border border-zinc-300 px-3 py-1.5 font-bold text-zinc-900">{data.productName}</td>
              </tr>
              <tr>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1.5 text-zinc-700">Label Claim</td>
                <td className="border border-zinc-300 px-3 py-1.5 text-zinc-800">{data.labelClaim}</td>
              </tr>
              <tr>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1.5 text-zinc-700">Test Parameter</td>
                <td className="border border-zinc-300 px-3 py-1.5 text-zinc-800">{data.testParameter}</td>
              </tr>
              <tr>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1.5 text-zinc-700">Reference</td>
                <td className="border border-zinc-300 px-3 py-1.5 text-zinc-800">{data.reference}</td>
              </tr>
              <tr>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1.5 text-zinc-700">
                  {isProtocol ? 'Batch No. to be used' : 'Batch No. used'}
                </td>
                <td className="border border-zinc-300 px-3 py-1.5 font-mono font-bold text-zinc-900">
                  {isProtocol ? '' : data.batchNoUsed}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 4-Person Sign-Off Table (Strict Matching PDF) */}
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-xs border-collapse border border-zinc-300">
            <thead>
              <tr className={tableHeaderClass}>
                <th className="p-2 border border-zinc-300 text-center w-1/4">Prepared By</th>
                <th className="p-2 border border-zinc-300 text-center w-1/4">Checked By</th>
                <th className="p-2 border border-zinc-300 text-center w-1/4">Reviewed By</th>
                <th className="p-2 border border-zinc-300 text-center w-1/4">Authorised By</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border border-zinc-300 text-xs align-top space-y-1">
                  <div><span className="font-bold">Designation:</span> {data.signOffs.preparedBy.designation}</div>
                  <div><span className="font-bold">Name:</span> {data.signOffs.preparedBy.name}</div>
                  <div><span className="font-bold">Sign/Date:</span> {isProtocol ? '' : `${data.signOffs.preparedBy.name} / ${data.signOffs.preparedBy.date}`}</div>
                </td>
                <td className="p-2 border border-zinc-300 text-xs align-top space-y-1">
                  <div><span className="font-bold">Designation:</span> {data.signOffs.checkedBy.designation}</div>
                  <div><span className="font-bold">Name:</span> {data.signOffs.checkedBy.name}</div>
                  <div><span className="font-bold">Sign/Date:</span> {isProtocol ? '' : `${data.signOffs.checkedBy.name} / ${data.signOffs.checkedBy.date}`}</div>
                </td>
                <td className="p-2 border border-zinc-300 text-xs align-top space-y-1">
                  <div><span className="font-bold">Designation:</span> {data.signOffs.reviewedBy.designation}</div>
                  <div><span className="font-bold">Name:</span> {data.signOffs.reviewedBy.name}</div>
                  <div><span className="font-bold">Sign/Date:</span> {isProtocol ? '' : `${data.signOffs.reviewedBy.name} / ${data.signOffs.reviewedBy.date}`}</div>
                </td>
                <td className="p-2 border border-zinc-300 text-xs align-top space-y-1">
                  <div><span className="font-bold">Designation:</span> {data.signOffs.authorisedBy.designation}</div>
                  <div><span className="font-bold">Name:</span> {data.signOffs.authorisedBy.name}</div>
                  <div><span className="font-bold">Sign/Date:</span> {isProtocol ? '' : `${data.signOffs.authorisedBy.name} / ${data.signOffs.authorisedBy.date}`}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 1. Objective */}
        <div className="mb-3">
          <h3 className={`text-xs font-bold uppercase mb-1 ${sectionHeadingClass}`}>1. Objective</h3>
          <p className="text-xs text-zinc-800 leading-relaxed whitespace-pre-line">{data.objective}</p>
        </div>

        {/* 2. Scope */}
        <div className="mb-3">
          <h3 className={`text-xs font-bold uppercase mb-1 ${sectionHeadingClass}`}>2. Scope</h3>
          <p className="text-xs text-zinc-800 leading-relaxed">{data.scope}</p>
        </div>

        {/* 3. Reference and Validation Details */}
        <div className="mb-2">
          <h3 className={`text-xs font-bold uppercase mb-1.5 ${sectionHeadingClass}`}>
            3. Reference and Validation Details
          </h3>
          <table className="w-full text-xs border-collapse border border-zinc-300">
            <tbody>
              <tr>
                <td className="w-1/4 bg-zinc-50 font-bold border border-zinc-300 px-3 py-1 text-zinc-700">Reference</td>
                <td className="border border-zinc-300 px-3 py-1 text-zinc-800">{data.referenceDetails.reference}</td>
              </tr>
              <tr>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1 text-zinc-700">(a) Type of study</td>
                <td className="border border-zinc-300 px-3 py-1 text-zinc-800">{data.referenceDetails.typeOfStudy}</td>
              </tr>
              <tr>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1 text-zinc-700">(b) Test to be validated</td>
                <td className="border border-zinc-300 px-3 py-1 text-zinc-800">{data.referenceDetails.testToBeValidated}</td>
              </tr>
              <tr>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1 text-zinc-700">(c) Validation team</td>
                <td className="border border-zinc-300 px-3 py-1 text-zinc-800">{data.referenceDetails.validationTeam}</td>
              </tr>
              <tr>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1 text-zinc-700">(d) Experimental details</td>
                <td className="border border-zinc-300 px-3 py-1 text-zinc-800">{data.referenceDetails.experimentalDetails}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {runningFooter(1)}
      </div>

      {/* ========================================================================= */}
      {/* PAGE 2: SEC 4. ANALYTICAL METHOD SUMMARY (4.1, 4.2, 4.3, 4.4, 4.5) */}
      {/* ========================================================================= */}
      <div className="page-card bg-white border border-zinc-300 rounded-lg shadow-sm p-6 sm:p-8 max-w-5xl mx-auto mb-6">
        {runningHeader}
        <h2 className={`text-sm font-bold uppercase mb-2 ${sectionHeadingClass}`}>
          4. Analytical Method Summary
        </h2>

        {/* 4.1 Chromatographic Conditions */}
        <div className="mb-3">
          <h3 className="text-xs font-bold text-zinc-800 mb-1">4.1 Chromatographic Conditions</h3>
          <table className="w-full text-xs border-collapse border border-zinc-300">
            <tbody>
              {Object.entries(data.methodSummary.chromatographicConditions).map(([key, val]) => (
                <tr key={key}>
                  <td className="w-1/3 bg-zinc-50 font-semibold border border-zinc-300 px-3 py-1 capitalize text-zinc-700">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </td>
                  <td className="border border-zinc-300 px-3 py-1 text-zinc-800">{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 4.2 Temperature / Mobile Phase Programme */}
        <div className="mb-3">
          <h3 className="text-xs font-bold text-zinc-800 mb-1">4.2 Temperature / Mobile Phase Programme</h3>
          <table className="w-full text-xs border-collapse border border-zinc-300">
            <thead>
              <tr className={tableHeaderClass}>
                <th className="p-1.5 border border-zinc-300 text-center">Time (minutes)</th>
                <th className="p-1.5 border border-zinc-300 text-center">Temperature (°C) / Mobile Phase</th>
                <th className="p-1.5 border border-zinc-300 text-left">Comment</th>
              </tr>
            </thead>
            <tbody>
              {data.methodSummary.ovenProgramme.map((row, i) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-zinc-50' : ''}>
                  <td className="p-1.5 border border-zinc-300 text-center font-mono">{row.timeRange}</td>
                  <td className="p-1.5 border border-zinc-300 text-center font-semibold">{row.temperature}</td>
                  <td className="p-1.5 border border-zinc-300 text-left text-zinc-700">{row.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 4.3 Preparation of Solutions */}
        <div className="mb-3">
          <h3 className="text-xs font-bold text-zinc-800 mb-1">4.3 Preparation of Solutions</h3>
          <div className="text-xs text-zinc-800 space-y-1.5 bg-zinc-50 p-3 rounded-sm border border-zinc-200">
            <div><span className="font-bold">Solution (1) — Internal Standard Solution:</span> {data.methodSummary.solutionPreparation.internalStandard}</div>
            <div><span className="font-bold">Solution (2) — Test Solution:</span> {data.methodSummary.solutionPreparation.testSolution}</div>
            <div><span className="font-bold">Solution (3) — Reference Solution:</span> {data.methodSummary.solutionPreparation.referenceSolution}</div>
            <div><span className="font-bold">Solution (4) — System Suitability Solution:</span> {data.methodSummary.solutionPreparation.systemSuitabilitySolution}</div>
            <div><span className="font-bold">Blank:</span> {data.methodSummary.solutionPreparation.blank}</div>
            <div><span className="font-bold">Placebo Solution:</span> {data.methodSummary.solutionPreparation.placeboSolution}</div>
            <div className="text-zinc-600 italic"><span className="font-bold not-italic">Handling Note:</span> {data.methodSummary.solutionPreparation.handlingNote}</div>
          </div>
        </div>

        {/* 4.4 Limits (as per the monograph) */}
        <div className="mb-3">
          <h3 className="text-xs font-bold text-zinc-800 mb-1">4.4 Limits (as per the monograph)</h3>
          <table className="w-full text-xs border-collapse border border-zinc-300">
            <thead>
              <tr className={tableHeaderClass}>
                <th className="p-1.5 border border-zinc-300 text-left">Criterion</th>
                <th className="p-1.5 border border-zinc-300 text-center w-1/3">Limit</th>
              </tr>
            </thead>
            <tbody>
              {data.methodSummary.monographLimits.map((lim, i) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-zinc-50' : ''}>
                  <td className="p-1.5 border border-zinc-300 text-zinc-800">{lim.criterion}</td>
                  <td className="p-1.5 border border-zinc-300 text-center font-semibold text-zinc-900">{lim.limit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 4.5 Requirements */}
        <div className="mb-2">
          <h3 className="text-xs font-bold text-zinc-800 mb-1">4.5 Requirements (Reagents &amp; Consumables)</h3>
          <table className="w-full text-xs border-collapse border border-zinc-300">
            <thead>
              <tr className={tableHeaderClass}>
                <th className="p-1.5 border border-zinc-300 text-left">Name of Material</th>
                <th className="p-1.5 border border-zinc-300 text-left">Grade</th>
                <th className="p-1.5 border border-zinc-300 text-left">Make</th>
                <th className="p-1.5 border border-zinc-300 text-center">Batch No.</th>
              </tr>
            </thead>
            <tbody>
              {data.methodSummary.requirements.map((req, i) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-zinc-50' : ''}>
                  <td className="p-1.5 border border-zinc-300 font-semibold text-zinc-900">{req.name}</td>
                  <td className="p-1.5 border border-zinc-300 text-zinc-700">{req.grade}</td>
                  <td className="p-1.5 border border-zinc-300 text-zinc-700">{req.make}</td>
                  <td className="p-1.5 border border-zinc-300 text-center font-mono text-zinc-800">{req.batchNo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {runningFooter(2)}
      </div>

      {/* ========================================================================= */}
      {/* PAGE 3: SEC 5. CRITERIA & SEC 6. SYSTEM SUITABILITY & SEC 7. SPECIFICITY */}
      {/* ========================================================================= */}
      <div className="page-card bg-white border border-zinc-300 rounded-lg shadow-sm p-6 sm:p-8 max-w-5xl mx-auto mb-6">
        {runningHeader}
        
        {/* 5. Validation Parameters Acceptance Criteria */}
        <div className="mb-4">
          <h2 className={`text-sm font-bold uppercase mb-2 ${sectionHeadingClass}`}>
            5. Validation Parameters — Acceptance Criteria
          </h2>
          <table className="w-full text-xs border-collapse border border-zinc-300">
            <thead>
              <tr className={tableHeaderClass}>
                <th className="p-1.5 border border-zinc-300 text-center w-12">Sr.</th>
                <th className="p-1.5 border border-zinc-300 text-left w-36">Parameter</th>
                <th className="p-1.5 border border-zinc-300 text-left">Acceptance Criteria</th>
                <th className="p-1.5 border border-zinc-300 text-left w-48">
                  {isProtocol ? 'Execution Status' : 'Observed Result / Compliance'}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.validationParameters.map((p, i) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-zinc-50' : ''}>
                  <td className="p-1.5 border border-zinc-300 text-center font-semibold">{p.srNo}</td>
                  <td className="p-1.5 border border-zinc-300 font-semibold text-zinc-900">{p.parameter}</td>
                  <td className="p-1.5 border border-zinc-300 text-zinc-700">{p.acceptanceCriteria}</td>
                  <td className="p-1.5 border border-zinc-300 font-medium text-emerald-800">
                    {isProtocol ? 'To be evaluated' : p.resultRemark}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 6. System Suitability */}
        <div className="mb-4">
          <h2 className={`text-sm font-bold uppercase mb-2 ${sectionHeadingClass}`}>
            6. System Suitability
          </h2>
          <table className="w-full text-xs border-collapse border border-zinc-300 mb-2">
            <thead>
              <tr className={tableHeaderClass}>
                <th className="p-1.5 border border-zinc-300 text-center w-16">Sr. No.</th>
                <th className="p-1.5 border border-zinc-300 text-center">Working Standard Weight (mg)</th>
                <th className="p-1.5 border border-zinc-300 text-right">Peak Area</th>
                <th className="p-1.5 border border-zinc-300 text-left">Remark</th>
              </tr>
            </thead>
            <tbody>
              {data.systemSuitability.injections.map((inj, i) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-zinc-50' : ''}>
                  <td className="p-1.5 border border-zinc-300 text-center font-mono">{inj.srNo}</td>
                  <td className="p-1.5 border border-zinc-300 text-center font-mono">{isProtocol ? '' : inj.weightMg}</td>
                  <td className="p-1.5 border border-zinc-300 text-right font-mono font-semibold">
                    {isProtocol ? '' : inj.peakArea.toLocaleString()}
                  </td>
                  <td className="p-1.5 border border-zinc-300 text-left text-zinc-600">{isProtocol ? '' : inj.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* SS Stats Summary */}
          <table className="w-full text-xs border-collapse border border-zinc-300 mb-2">
            <tbody>
              <tr>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1 text-zinc-700">Mean Peak Area</td>
                <td className="border border-zinc-300 px-3 py-1 font-mono font-bold text-zinc-900">
                  {isProtocol ? '' : data.systemSuitability.stats.meanArea.toLocaleString()}
                </td>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1 text-zinc-700">% RSD of Peak Area</td>
                <td className="border border-zinc-300 px-3 py-1 font-mono font-bold text-zinc-900">
                  {isProtocol ? 'Limit: NMT 2.0 %' : `${data.systemSuitability.stats.rsdArea} % (Limit: NMT 2.0 %)`}
                </td>
              </tr>
              <tr>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1 text-zinc-700">Tailing Factor (T)</td>
                <td className="border border-zinc-300 px-3 py-1 font-mono font-bold text-zinc-900">
                  {isProtocol ? 'Limit: NMT 2.0' : `${data.systemSuitability.stats.tailingFactor} (Limit: NMT 2.0)`}
                </td>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1 text-zinc-700">Theoretical Plates (N)</td>
                <td className="border border-zinc-300 px-3 py-1 font-mono font-bold text-zinc-900">
                  {isProtocol ? 'Limit: NLT 800' : `${data.systemSuitability.stats.theoreticalPlates} (Limit: NLT 800)`}
                </td>
              </tr>
              <tr>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1 text-zinc-700">Resolution (Rs)</td>
                <td colSpan={3} className="border border-zinc-300 px-3 py-1 font-mono font-bold text-zinc-900">
                  {isProtocol ? 'Limit: NLT 2.0' : `${data.systemSuitability.stats.resolution} (Limit: NLT 2.0)`}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs font-semibold text-blue-900 bg-blue-50 p-2 rounded border border-blue-200">
            {isProtocol ? data.systemSuitability.stats.conclusionProtocol : data.systemSuitability.stats.conclusionReport}
          </p>
        </div>

        {/* 7. Specificity */}
        <div className="mb-2">
          <h2 className={`text-sm font-bold uppercase mb-2 ${sectionHeadingClass}`}>
            7. Specificity (Interference Study)
          </h2>
          <table className="w-full text-xs border-collapse border border-zinc-300 mb-2">
            <thead>
              <tr className={tableHeaderClass}>
                <th className="p-1.5 border border-zinc-300 text-left">Solution</th>
                <th className="p-1.5 border border-zinc-300 text-center">Retention Time</th>
                <th className="p-1.5 border border-zinc-300 text-right">Peak Area</th>
                <th className="p-1.5 border border-zinc-300 text-left">Interference Observed</th>
              </tr>
            </thead>
            <tbody>
              {data.specificity.rows.map((row, i) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-zinc-50' : ''}>
                  <td className="p-1.5 border border-zinc-300 font-semibold text-zinc-900">{row.solution}</td>
                  <td className="p-1.5 border border-zinc-300 text-center font-mono">{isProtocol ? '' : row.retentionTime}</td>
                  <td className="p-1.5 border border-zinc-300 text-right font-mono">{isProtocol ? '' : row.peakArea}</td>
                  <td className="p-1.5 border border-zinc-300 text-left text-zinc-700">{isProtocol ? '' : row.interferenceObserved}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs font-semibold text-blue-900 bg-blue-50 p-2 rounded border border-blue-200">
            {isProtocol ? data.specificity.conclusionProtocol : data.specificity.conclusionReport}
          </p>
        </div>

        {runningFooter(3)}
      </div>

      {/* ========================================================================= */}
      {/* PAGE 4: SEC 8. LINEARITY & RANGE & SEC 9. PRECISION */}
      {/* ========================================================================= */}
      <div className="page-card bg-white border border-zinc-300 rounded-lg shadow-sm p-6 sm:p-8 max-w-5xl mx-auto mb-6">
        {runningHeader}
        <h2 className={`text-sm font-bold uppercase mb-2 ${sectionHeadingClass}`}>
          8. Linearity and Range
        </h2>

        {/* 8.1 Linearity */}
        <div className="mb-3">
          <h3 className="text-xs font-bold text-zinc-800 mb-1">8.1 Linearity (5 Levels: 50% to 150%)</h3>
          <table className="w-full text-xs border-collapse border border-zinc-300 mb-2">
            <thead>
              <tr className={tableHeaderClass}>
                <th className="p-1.5 border border-zinc-300 text-left">Level</th>
                <th className="p-1.5 border border-zinc-300 text-center">Nominal (ppm)</th>
                <th className="p-1.5 border border-zinc-300 text-center">Weight (mg)</th>
                <th className="p-1.5 border border-zinc-300 text-center">Final Dilution</th>
                <th className="p-1.5 border border-zinc-300 text-right">Mean Peak Area</th>
              </tr>
            </thead>
            <tbody>
              {data.linearityAndRange.linearityLevels.map((lvl, i) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-zinc-50' : ''}>
                  <td className="p-1.5 border border-zinc-300 font-semibold text-zinc-900">{lvl.levelName}</td>
                  <td className="p-1.5 border border-zinc-300 text-center font-mono">{lvl.nominalPpm}</td>
                  <td className="p-1.5 border border-zinc-300 text-center font-mono">{isProtocol ? '' : lvl.weightTakenMg}</td>
                  <td className="p-1.5 border border-zinc-300 text-center">{lvl.finalDilution}</td>
                  <td className="p-1.5 border border-zinc-300 text-right font-mono font-semibold">
                    {isProtocol ? '' : Number(lvl.meanArea).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Regression Parameters */}
          <table className="w-full text-xs border-collapse border border-zinc-300 mb-2">
            <tbody>
              <tr>
                <td className="w-1/3 bg-zinc-50 font-bold border border-zinc-300 px-3 py-1 text-zinc-700">
                  Correlation Coefficient (r²)
                </td>
                <td className="border border-zinc-300 px-3 py-1 font-mono font-bold text-zinc-900">
                  {isProtocol ? 'Limit: ≥ 0.995' : `${data.linearityAndRange.regression.rSquared} (Limit: ≥ 0.995)`}
                </td>
              </tr>
              <tr>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1 text-zinc-700">Slope (S)</td>
                <td className="border border-zinc-300 px-3 py-1 font-mono text-zinc-900">
                  {isProtocol ? '' : data.linearityAndRange.regression.slope}
                </td>
              </tr>
              <tr>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1 text-zinc-700">y-Intercept (c)</td>
                <td className="border border-zinc-300 px-3 py-1 font-mono text-zinc-900">
                  {isProtocol ? '' : data.linearityAndRange.regression.yIntercept}
                </td>
              </tr>
              <tr>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1 text-zinc-700">
                  Residual SD of y-intercepts
                </td>
                <td className="border border-zinc-300 px-3 py-1 font-mono text-zinc-900">
                  {isProtocol ? '' : data.linearityAndRange.regression.sdYIntercepts}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs font-semibold text-blue-900 bg-blue-50 p-2 rounded border border-blue-200">
            {isProtocol ? data.linearityAndRange.regression.conclusionProtocol : data.linearityAndRange.regression.conclusionReport}
          </p>
        </div>

        {/* 8.2 Range */}
        <div className="mb-4">
          <h3 className="text-xs font-bold text-zinc-800 mb-1">8.2 Range (Triplicate at 75% and 125%)</h3>
          <table className="w-full text-xs border-collapse border border-zinc-300 mb-2">
            <thead>
              <tr className={tableHeaderClass}>
                <th className="p-1.5 border border-zinc-300 text-center w-12">Sr.</th>
                <th className="p-1.5 border border-zinc-300 text-center">Level (ppm)</th>
                <th className="p-1.5 border border-zinc-300 text-left">Sample ID</th>
                <th className="p-1.5 border border-zinc-300 text-right">Peak Area</th>
              </tr>
            </thead>
            <tbody>
              {data.linearityAndRange.rangeRows.map((row, i) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-zinc-50' : ''}>
                  <td className="p-1.5 border border-zinc-300 text-center font-mono">{row.srNo}</td>
                  <td className="p-1.5 border border-zinc-300 text-center font-semibold">{row.levelPpm}</td>
                  <td className="p-1.5 border border-zinc-300 text-left font-mono">{row.sampleId}</td>
                  <td className="p-1.5 border border-zinc-300 text-right font-mono font-semibold">
                    {isProtocol ? '' : Number(row.peakArea).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs font-semibold text-blue-900 bg-blue-50 p-2 rounded border border-blue-200">
            {isProtocol ? data.linearityAndRange.rangeConclusionProtocol : data.linearityAndRange.rangeConclusionReport}
          </p>
        </div>

        {/* 9. Precision (Repeatability) */}
        <div className="mb-2">
          <h2 className={`text-sm font-bold uppercase mb-2 ${sectionHeadingClass}`}>
            9. Precision (Repeatability — 6 Determinations)
          </h2>
          <table className="w-full text-xs border-collapse border border-zinc-300 mb-2">
            <thead>
              <tr className={tableHeaderClass}>
                <th className="p-1.5 border border-zinc-300 text-center w-12">Sr. No.</th>
                <th className="p-1.5 border border-zinc-300 text-left">Sample ID</th>
                <th className="p-1.5 border border-zinc-300 text-center">Volume Used</th>
                <th className="p-1.5 border border-zinc-300 text-right">Peak Area</th>
                <th className="p-1.5 border border-zinc-300 text-center">Content (% of LA)</th>
              </tr>
            </thead>
            <tbody>
              {data.precision.rows.map((row, i) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-zinc-50' : ''}>
                  <td className="p-1.5 border border-zinc-300 text-center font-mono">{row.srNo}</td>
                  <td className="p-1.5 border border-zinc-300 font-mono font-semibold">{row.sampleId}</td>
                  <td className="p-1.5 border border-zinc-300 text-center font-mono">{row.volumeUsed}</td>
                  <td className="p-1.5 border border-zinc-300 text-right font-mono font-semibold">
                    {isProtocol ? '' : Number(row.peakArea).toLocaleString()}
                  </td>
                  <td className="p-1.5 border border-zinc-300 text-center font-mono font-bold text-zinc-900">
                    {isProtocol ? '' : `${row.contentPercentLa} %`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Precision Stats */}
          <table className="w-full text-xs border-collapse border border-zinc-300 mb-2">
            <tbody>
              <tr>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1 text-zinc-700">Mean Content (% of LA)</td>
                <td className="border border-zinc-300 px-3 py-1 font-mono font-bold text-zinc-900">
                  {isProtocol ? '' : `${data.precision.stats.meanContent} %`}
                </td>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1 text-zinc-700">% RSD of Content</td>
                <td className="border border-zinc-300 px-3 py-1 font-mono font-bold text-zinc-900">
                  {isProtocol ? 'Limit: NMT 2.0 %' : `${data.precision.stats.rsd} % (Limit: NMT 2.0 %)`}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs font-semibold text-blue-900 bg-blue-50 p-2 rounded border border-blue-200">
            {isProtocol ? data.precision.stats.conclusionProtocol : data.precision.stats.conclusionReport}
          </p>
        </div>

        {runningFooter(4)}
      </div>

      {/* ========================================================================= */}
      {/* PAGE 5: SEC 10. LOD & LOQ & SEC 11. INTERMEDIATE PRECISION */}
      {/* ========================================================================= */}
      <div className="page-card bg-white border border-zinc-300 rounded-lg shadow-sm p-6 sm:p-8 max-w-5xl mx-auto mb-6">
        {runningHeader}

        {/* 10. Limit of Detection and Limit of Quantitation */}
        <div className="mb-4">
          <h2 className={`text-sm font-bold uppercase mb-2 ${sectionHeadingClass}`}>
            10. Limit of Detection (LOD) and Limit of Quantitation (LOQ)
          </h2>
          <p className="text-xs text-zinc-600 mb-2">
            Formulae: LOD = 3.3 × (SD / S) and LOQ = 10 × (SD / S), where SD = residual standard deviation of y-intercepts and S = slope.
          </p>

          <table className="w-full text-xs border-collapse border border-zinc-300 mb-2">
            <thead>
              <tr className={tableHeaderClass}>
                <th className="p-1.5 border border-zinc-300 text-center w-12">Sr.</th>
                <th className="p-1.5 border border-zinc-300 text-left">Level</th>
                <th className="p-1.5 border border-zinc-300 text-center">Concentration (ppm)</th>
                <th className="p-1.5 border border-zinc-300 text-right">Peak Area</th>
                <th className="p-1.5 border border-zinc-300 text-center">S/N Ratio</th>
              </tr>
            </thead>
            <tbody>
              {data.lodLoq.confirmationRows.map((row, i) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-zinc-50' : ''}>
                  <td className="p-1.5 border border-zinc-300 text-center font-mono">{row.srNo}</td>
                  <td className="p-1.5 border border-zinc-300 font-semibold text-zinc-900">{row.level}</td>
                  <td className="p-1.5 border border-zinc-300 text-center font-mono">{row.concentrationPpm}</td>
                  <td className="p-1.5 border border-zinc-300 text-right font-mono">{isProtocol ? '' : Number(row.peakArea).toLocaleString()}</td>
                  <td className="p-1.5 border border-zinc-300 text-center font-mono font-bold text-zinc-900">
                    {isProtocol ? (row.level === 'LOD' ? 'Criteria: S/N ≥ 3' : 'Criteria: S/N ≥ 10') : `${row.snRatio}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="text-xs font-bold text-zinc-800 mb-1">Precision at LOQ Level (6 Replicates)</h3>
          <table className="w-full text-xs border-collapse border border-zinc-300 mb-2">
            <thead>
              <tr className={tableHeaderClass}>
                <th className="p-1.5 border border-zinc-300 text-center w-12">Sr. No.</th>
                <th className="p-1.5 border border-zinc-300 text-right">Peak Area</th>
                <th className="p-1.5 border border-zinc-300 text-center">Content (% of LA)</th>
                <th className="p-1.5 border border-zinc-300 text-left">Remark</th>
              </tr>
            </thead>
            <tbody>
              {data.lodLoq.loqPrecisionRows.map((r, i) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-zinc-50' : ''}>
                  <td className="p-1.5 border border-zinc-300 text-center font-mono">{r.srNo}</td>
                  <td className="p-1.5 border border-zinc-300 text-right font-mono">{isProtocol ? '' : Number(r.peakArea).toLocaleString()}</td>
                  <td className="p-1.5 border border-zinc-300 text-center font-mono">{isProtocol ? '' : `${r.contentPercentLa} %`}</td>
                  <td className="p-1.5 border border-zinc-300 text-left text-zinc-600">{isProtocol ? '' : r.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs font-semibold text-blue-900 bg-blue-50 p-2 rounded border border-blue-200">
            {isProtocol ? data.lodLoq.loqStats.conclusionProtocol : data.lodLoq.loqStats.conclusionReport}
          </p>
        </div>

        {/* 11. Intermediate Precision */}
        <div className="mb-2">
          <h2 className={`text-sm font-bold uppercase mb-2 ${sectionHeadingClass}`}>
            11. Intermediate Precision (Analyst 1 vs. Analyst 2)
          </h2>
          <table className="w-full text-xs border-collapse border border-zinc-300 mb-2">
            <thead>
              <tr className={tableHeaderClass}>
                <th className="p-1.5 border border-zinc-300 text-center w-10">Sr.</th>
                <th className="p-1.5 border border-zinc-300 text-center">Analyst 1 Vol</th>
                <th className="p-1.5 border border-zinc-300 text-right">Analyst 1 Area</th>
                <th className="p-1.5 border border-zinc-300 text-center">Analyst 1 % LA</th>
                <th className="p-1.5 border border-zinc-300 text-center">Analyst 2 Vol</th>
                <th className="p-1.5 border border-zinc-300 text-right">Analyst 2 Area</th>
                <th className="p-1.5 border border-zinc-300 text-center">Analyst 2 % LA</th>
              </tr>
            </thead>
            <tbody>
              {data.intermediatePrecision.rows.map((row, i) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-zinc-50' : ''}>
                  <td className="p-1.5 border border-zinc-300 text-center font-mono">{row.srNo}</td>
                  <td className="p-1.5 border border-zinc-300 text-center font-mono">{row.analyst1Volume}</td>
                  <td className="p-1.5 border border-zinc-300 text-right font-mono">{isProtocol ? '' : Number(row.analyst1Area).toLocaleString()}</td>
                  <td className="p-1.5 border border-zinc-300 text-center font-mono">{isProtocol ? '' : `${row.analyst1Content} %`}</td>
                  <td className="p-1.5 border border-zinc-300 text-center font-mono">{row.analyst2Volume}</td>
                  <td className="p-1.5 border border-zinc-300 text-right font-mono">{isProtocol ? '' : Number(row.analyst2Area).toLocaleString()}</td>
                  <td className="p-1.5 border border-zinc-300 text-center font-mono">{isProtocol ? '' : `${row.analyst2Content} %`}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Intermediate Precision Stats */}
          <table className="w-full text-xs border-collapse border border-zinc-300 mb-2">
            <tbody>
              <tr>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1 text-zinc-700">Analyst 1 Mean (% of LA)</td>
                <td className="border border-zinc-300 px-3 py-1 font-mono font-bold text-zinc-900">{isProtocol ? '' : `${data.intermediatePrecision.stats.analyst1Mean} %`}</td>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1 text-zinc-700">Analyst 1 % RSD</td>
                <td className="border border-zinc-300 px-3 py-1 font-mono font-bold text-zinc-900">{isProtocol ? 'Limit: NMT 2.0 %' : `${data.intermediatePrecision.stats.analyst1Rsd} %`}</td>
              </tr>
              <tr>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1 text-zinc-700">Analyst 2 Mean (% of LA)</td>
                <td className="border border-zinc-300 px-3 py-1 font-mono font-bold text-zinc-900">{isProtocol ? '' : `${data.intermediatePrecision.stats.analyst2Mean} %`}</td>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1 text-zinc-700">Analyst 2 % RSD</td>
                <td className="border border-zinc-300 px-3 py-1 font-mono font-bold text-zinc-900">{isProtocol ? 'Limit: NMT 2.0 %' : `${data.intermediatePrecision.stats.analyst2Rsd} %`}</td>
              </tr>
              <tr>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1 text-zinc-700">Cumulative Mean (n = 12)</td>
                <td className="border border-zinc-300 px-3 py-1 font-mono font-bold text-zinc-900">{isProtocol ? '' : `${data.intermediatePrecision.stats.cumulativeMean} %`}</td>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1 text-zinc-700">Cumulative % RSD (n = 12)</td>
                <td className="border border-zinc-300 px-3 py-1 font-mono font-bold text-zinc-900">{isProtocol ? 'Limit: NMT 2.0 %' : `${data.intermediatePrecision.stats.cumulativeRsd} % (Limit: NMT 2.0 %)`}</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs font-semibold text-blue-900 bg-blue-50 p-2 rounded border border-blue-200">
            {isProtocol ? data.intermediatePrecision.stats.conclusionProtocol : data.intermediatePrecision.stats.conclusionReport}
          </p>
        </div>

        {runningFooter(5)}
      </div>

      {/* ========================================================================= */}
      {/* PAGE 6: SEC 12. ACCURACY & SEC 13. OVERALL CONCLUSION */}
      {/* ========================================================================= */}
      <div className="page-card bg-white border border-zinc-300 rounded-lg shadow-sm p-6 sm:p-8 max-w-5xl mx-auto mb-6">
        {runningHeader}

        {/* 12. Accuracy (Recovery) */}
        <div className="mb-4">
          <h2 className={`text-sm font-bold uppercase mb-2 ${sectionHeadingClass}`}>
            12. Accuracy (Recovery — 3 Levels in Triplicate)
          </h2>
          <table className="w-full text-xs border-collapse border border-zinc-300 mb-2">
            <thead>
              <tr className={tableHeaderClass}>
                <th className="p-1.5 border border-zinc-300 text-center w-12">Sr.</th>
                <th className="p-1.5 border border-zinc-300 text-center">Level (ppm)</th>
                <th className="p-1.5 border border-zinc-300 text-center">Spiked (mg)</th>
                <th className="p-1.5 border border-zinc-300 text-right">Sample Area</th>
                <th className="p-1.5 border border-zinc-300 text-center">Recovered (mg)</th>
                <th className="p-1.5 border border-zinc-300 text-center">% Recovery</th>
              </tr>
            </thead>
            <tbody>
              {data.accuracy.rows.map((row, i) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-zinc-50' : ''}>
                  <td className="p-1.5 border border-zinc-300 text-center font-mono">{row.srNo}</td>
                  <td className="p-1.5 border border-zinc-300 text-center font-semibold">{row.levelPpm}</td>
                  <td className="p-1.5 border border-zinc-300 text-center font-mono">{isProtocol ? '' : row.standardSpikedMg}</td>
                  <td className="p-1.5 border border-zinc-300 text-right font-mono">{isProtocol ? '' : Number(row.sampleArea).toLocaleString()}</td>
                  <td className="p-1.5 border border-zinc-300 text-center font-mono">{isProtocol ? '' : row.amountRecoveredMg}</td>
                  <td className="p-1.5 border border-zinc-300 text-center font-mono font-bold text-zinc-900">
                    {isProtocol ? '' : `${row.percentRecovery} %`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Level Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
            {data.accuracy.stats.levelStats.map((st) => (
              <div key={st.levelPpm} className="bg-zinc-50 border border-zinc-200 p-2 rounded text-xs">
                <div className="font-bold text-zinc-700">{st.levelPpm} ppm Level</div>
                <div>Mean Recovery: <span className="font-mono font-semibold">{isProtocol ? 'Criteria: 98.0 – 102.0 %' : `${st.meanRecovery} %`}</span></div>
                <div>% RSD: <span className="font-mono font-semibold">{isProtocol ? 'Criteria: ≤ 2.0 %' : `${st.rsdRecovery} %`}</span></div>
              </div>
            ))}
          </div>

          <table className="w-full text-xs border-collapse border border-zinc-300 mb-2">
            <tbody>
              <tr>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1 text-zinc-700">Overall Mean Recovery (n = 9)</td>
                <td className="border border-zinc-300 px-3 py-1 font-mono font-bold text-zinc-900">
                  {isProtocol ? 'Limit: 98.0 – 102.0 %' : `${data.accuracy.stats.overallMeanRecovery} % (Limit: 98.0 – 102.0 %)`}
                </td>
                <td className="bg-zinc-50 font-bold border border-zinc-300 px-3 py-1 text-zinc-700">Overall % RSD (n = 9)</td>
                <td className="border border-zinc-300 px-3 py-1 font-mono font-bold text-zinc-900">
                  {isProtocol ? 'Limit: NMT 2.0 %' : `${data.accuracy.stats.overallRsd} % (Limit: NMT 2.0 %)`}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs font-semibold text-blue-900 bg-blue-50 p-2 rounded border border-blue-200">
            {isProtocol ? data.accuracy.stats.conclusionProtocol : data.accuracy.stats.conclusionReport}
          </p>
        </div>

        {/* 13. Overall Conclusion */}
        <div className="mb-2">
          <h2 className={`text-sm font-bold uppercase mb-2 ${sectionHeadingClass}`}>
            13. Overall Conclusion
          </h2>
          <div className="text-xs text-zinc-800 leading-relaxed bg-zinc-50 p-3 rounded border border-zinc-200 whitespace-pre-line">
            {isProtocol ? data.overallConclusionProtocol : data.overallConclusionReport}
          </div>
        </div>

        {runningFooter(6)}
      </div>

      {/* ========================================================================= */}
      {/* PAGE 7: SEC 14. COMPLETION RECORD, SEC 15. ABBREVIATIONS, SEC 16. REVISION */}
      {/* ========================================================================= */}
      <div className="page-card bg-white border border-zinc-300 rounded-lg shadow-sm p-6 sm:p-8 max-w-5xl mx-auto mb-6">
        {runningHeader}

        {/* 14. Completion Record */}
        <div className="mb-4">
          <h2 className={`text-sm font-bold uppercase mb-2 ${sectionHeadingClass}`}>
            14. Completion Record
          </h2>
          <table className="w-full text-xs border-collapse border border-zinc-300 mb-2">
            <thead>
              <tr className={tableHeaderClass}>
                <th className="p-1.5 border border-zinc-300 text-left w-1/2">Particulars</th>
                <th className="p-1.5 border border-zinc-300 text-left">Details / Compliance</th>
                <th className="p-1.5 border border-zinc-300 text-center w-1/4">Signature &amp; Date</th>
              </tr>
            </thead>
            <tbody>
              {data.completionRecord.map((rec, i) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-zinc-50' : ''}>
                  <td className="p-1.5 border border-zinc-300 font-semibold text-zinc-800">{rec.particulars}</td>
                  <td className="p-1.5 border border-zinc-300 text-zinc-700">{isProtocol ? '' : rec.details}</td>
                  <td className="p-1.5 border border-zinc-300 text-center font-mono text-zinc-600">
                    {isProtocol ? '' : rec.signatureDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 15. Abbreviations */}
        <div className="mb-4">
          <h2 className={`text-sm font-bold uppercase mb-2 ${sectionHeadingClass}`}>
            15. Abbreviations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
            {data.abbreviations.map((ab, i) => (
              <div key={i} className="flex items-center gap-2 border border-zinc-200 px-2 py-1 rounded bg-zinc-50">
                <span className="font-bold text-zinc-900 w-24 font-mono">{ab.abbreviation}</span>
                <span className="text-zinc-700">{ab.expansion}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 16. Revision History */}
        <div className="mb-4">
          <h2 className={`text-sm font-bold uppercase mb-2 ${sectionHeadingClass}`}>
            16. Revision History
          </h2>
          <table className="w-full text-xs border-collapse border border-zinc-300 mb-3">
            <thead>
              <tr className={tableHeaderClass}>
                <th className="p-1.5 border border-zinc-300 text-center w-20">Version</th>
                <th className="p-1.5 border border-zinc-300 text-center w-28">Effective Date</th>
                <th className="p-1.5 border border-zinc-300 text-left">Reason for Change</th>
              </tr>
            </thead>
            <tbody>
              {data.revisionHistory.map((rev, i) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-zinc-50' : ''}>
                  <td className="p-1.5 border border-zinc-300 text-center font-mono font-bold">{rev.version}</td>
                  <td className="p-1.5 border border-zinc-300 text-center font-mono">{rev.effectiveDate}</td>
                  <td className="p-1.5 border border-zinc-300 text-zinc-700">{rev.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-center pt-4 pb-2 border-t border-zinc-200">
          <span className="text-xs font-bold tracking-widest text-zinc-400">— END OF DOCUMENT —</span>
        </div>

        {runningFooter(7)}
      </div>
    </div>
  );
};
