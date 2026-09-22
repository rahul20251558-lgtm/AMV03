import React, { useState } from 'react';
import {
  FileDown,
  Printer,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { TitrationAMVDocumentData } from '../types_titration';
import { DocumentType, ThemeFormat } from '../types';
import { generateAndDownloadTitrationDocx } from '../services/titrationDocxGenerator';

interface TitrationDocumentViewerProps {
  data: TitrationAMVDocumentData;
  documentType: DocumentType;
  theme: ThemeFormat;
  fontFamily: string;
  fontSizePt: number;
  onDocumentTypeChange?: (type: DocumentType) => void;
}

export const TitrationDocumentViewer: React.FC<TitrationDocumentViewerProps> = ({
  data,
  documentType,
  theme,
  fontFamily,
  fontSizePt,
  onDocumentTypeChange,
}) => {
  const [activeDocType, setActiveDocType] = useState<DocumentType>(documentType);
  const [isExporting, setIsExporting] = useState(false);

  const isProtocol = activeDocType === 'protocol';
  const isBlue = theme === 'blue';
  const isWestcoast = theme === 'westcoast';

  const handleDocTypeSwitch = (type: DocumentType) => {
    setActiveDocType(type);
    if (onDocumentTypeChange) {
      onDocumentTypeChange(type);
    }
  };

  const handleExportDocx = async () => {
    try {
      setIsExporting(true);
      await generateAndDownloadTitrationDocx(data, {
        docType: activeDocType,
        theme,
        fontFamily,
        fontSize: fontSizePt,
      });
    } catch (err) {
      console.error('Failed to export titration docx:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const singleDocNo = isProtocol ? data.protocolNo : data.reportNo;

  // Colors
  const headerBgClass = isBlue
    ? 'bg-[#1F4E79] text-white'
    : isWestcoast
    ? 'bg-slate-800 text-white'
    : 'bg-gray-100 text-gray-900 border-gray-300';
  const headerTextClass = isBlue ? 'text-[#1F4E79]' : 'text-slate-900';
  const metaLabelBgClass = isBlue ? 'bg-slate-50' : 'bg-gray-50';
  const tableBorderClass = 'border border-gray-300';
  const cellClass = 'border border-gray-300 px-3 py-1.5 text-xs';

  return (
    <div className="w-full max-w-5xl mx-auto my-6 px-4 pb-16 font-sans">
      {/* Action Toolbar */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs p-4 mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              Assay by Titration (AMV / AMVer)
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                Format: WC/QC/01/08-F01
              </span>
            </h2>
            <p className="text-xs text-gray-500">
              USP &lt;1226&gt; / &lt;1225&gt; Compendial Titrimetric Protocol & Executed Report
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Protocol vs Report Toggle */}
          <div className="inline-flex p-1 bg-gray-100 rounded-lg border border-gray-200">
            <button
              onClick={() => handleDocTypeSwitch('protocol')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                isProtocol
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Protocol
            </button>
            <button
              onClick={() => handleDocTypeSwitch('report')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                !isProtocol
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Executed Report
            </button>
          </div>

          {/* Export Buttons */}
          <button
            onClick={handleExportDocx}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            <FileDown className="w-4 h-4" />
            {isExporting ? 'Generating...' : 'Export Word (.docx)'}
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/* Main Document Body (A4 Paper emulation) */}
      <div
        className="bg-white border border-gray-300 shadow-sm p-8 sm:p-12 text-gray-800 print:border-none print:shadow-none print:p-0"
        style={{ fontFamily: fontFamily || 'Times New Roman' }}
      >
        {/* Running Header */}
        <div className="border-b border-gray-300 pb-2 mb-6 flex items-center justify-between text-[11px] text-gray-500 uppercase tracking-wider">
          <span>{data.companyName}</span>
          <span>
            Assay AMV {isProtocol ? 'Protocol' : 'Report'} – {data.productName}
          </span>
          <span>Doc No. {singleDocNo}</span>
        </div>

        {/* Header Title Block */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold tracking-tight text-gray-950 uppercase mb-1">
            {data.companyName}
          </h1>
          <p className="text-xs text-gray-600 max-w-2xl mx-auto mb-4">
            {data.companyAddress}
          </p>
          <div className="inline-block border-y-2 border-gray-800 py-1.5 px-6 my-2">
            <h2 className="text-base font-bold uppercase tracking-wide text-gray-900">
              {isProtocol
                ? 'ANALYTICAL METHOD VERIFICATION PROTOCOL (Assay by Titration)'
                : 'ANALYTICAL METHOD VERIFICATION REPORT (Assay by Titration)'}
            </h2>
          </div>
          <p
            className={`text-xs font-bold uppercase tracking-widest mt-2 ${
              isProtocol ? 'text-red-700' : 'text-emerald-700'
            }`}
          >
            {isProtocol
              ? '*** PROTOCOL — NOT AN EXECUTED REPORT ***'
              : '*** EXECUTED REPORT ***'}
          </p>
        </div>

        {/* Metadata Grid (Page 1) */}
        <div className="mb-6 overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <tbody>
              <tr>
                <td className={`${cellClass} font-semibold w-1/4 ${metaLabelBgClass}`}>
                  {isProtocol ? 'Protocol No.' : 'Report No.'}
                </td>
                <td className={`${cellClass} font-bold text-blue-900`}>{singleDocNo}</td>
              </tr>
              <tr>
                <td className={`${cellClass} font-semibold ${metaLabelBgClass}`}>Product Name</td>
                <td className={`${cellClass} font-semibold`}>{data.productName}</td>
              </tr>
              <tr>
                <td className={`${cellClass} font-semibold ${metaLabelBgClass}`}>Label Claim</td>
                <td className={cellClass}>{data.labelClaim}</td>
              </tr>
              <tr>
                <td className={`${cellClass} font-semibold ${metaLabelBgClass}`}>Test Parameter</td>
                <td className={cellClass}>{data.testParameter}</td>
              </tr>
              <tr>
                <td className={`${cellClass} font-semibold ${metaLabelBgClass}`}>Reference</td>
                <td className={cellClass}>{data.reference}</td>
              </tr>
              <tr>
                <td className={`${cellClass} font-semibold ${metaLabelBgClass}`}>
                  {isProtocol ? 'Protocol Date' : 'Report Date'}
                </td>
                <td className={cellClass}>
                  {isProtocol ? data.protocolDate : data.reportDate}
                </td>
              </tr>
              <tr>
                <td className={`${cellClass} font-semibold ${metaLabelBgClass}`}>Format No.</td>
                <td className={cellClass}>{data.formatNo}</td>
              </tr>
              <tr>
                <td className={`${cellClass} font-semibold ${metaLabelBgClass}`}>Supersedes</td>
                <td className={cellClass}>{data.supersedes || 'Nil'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 4-Column Signature Block (Prepared, Checked, Reviewed, Authorized) */}
        <div className="mb-8 overflow-x-auto">
          <table className="w-full text-xs border-collapse text-left">
            <thead>
              <tr className={headerBgClass}>
                <th className={`${cellClass} text-center font-bold`}>Prepared By</th>
                <th className={`${cellClass} text-center font-bold`}>Checked By</th>
                <th className={`${cellClass} text-center font-bold`}>Reviewed By</th>
                <th className={`${cellClass} text-center font-bold`}>Authorized By</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {/* Prepared By */}
                <td className={`${cellClass} align-top p-3 space-y-1`}>
                  <p className="font-semibold text-gray-900">Name: {data.signOffs.preparedBy.name}</p>
                  <p className="text-gray-600">Desig: {data.signOffs.preparedBy.designation}</p>
                  <p className="text-gray-600">Sign: ____________</p>
                  <p className="text-gray-600">Date: {data.signOffs.preparedBy.date}</p>
                </td>
                {/* Checked By */}
                <td className={`${cellClass} align-top p-3 space-y-1`}>
                  <p className="font-semibold text-gray-900">Name: {data.signOffs.checkedBy.name}</p>
                  <p className="text-gray-600">Desig: {data.signOffs.checkedBy.designation}</p>
                  <p className="text-gray-600">Sign: ____________</p>
                  <p className="text-gray-600">Date: {data.signOffs.checkedBy.date}</p>
                </td>
                {/* Reviewed By */}
                <td className={`${cellClass} align-top p-3 space-y-1`}>
                  <p className="font-semibold text-gray-900">Name: {data.signOffs.reviewedBy.name}</p>
                  <p className="text-gray-600">Desig: {data.signOffs.reviewedBy.designation}</p>
                  <p className="text-gray-600">Sign: ____________</p>
                  <p className="text-gray-600">Date: {data.signOffs.reviewedBy.date}</p>
                </td>
                {/* Authorized By */}
                <td className={`${cellClass} align-top p-3 space-y-1`}>
                  <p className="font-semibold text-gray-900">Name: {data.signOffs.authorizedBy.name}</p>
                  <p className="text-gray-600">Desig: {data.signOffs.authorizedBy.designation}</p>
                  <p className="text-gray-600">Sign: ____________</p>
                  <p className="text-gray-600">Date: {data.signOffs.authorizedBy.date}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Table of Contents (Page 1) */}
        <div className="mb-10">
          <h3 className={`text-sm font-bold uppercase mb-2 ${headerTextClass}`}>
            Table of Contents
          </h3>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className={headerBgClass}>
                <th className={`${cellClass} text-center w-16`}>Sr. No.</th>
                <th className={`${cellClass} text-left`}>Contents / Section Title</th>
                <th className={`${cellClass} text-center w-24`}>Page No.</th>
              </tr>
            </thead>
            <tbody>
              {[
                { sr: '1.0', title: 'Objective', page: 'Page 2' },
                { sr: '2.0', title: 'Scope', page: 'Page 2' },
                { sr: '3.0', title: 'Reference Documents & Verification Details', page: 'Page 2' },
                {
                  sr: '4.0',
                  title: 'Analytical Method Summary (4.1 Titrimetric Conditions, 4.2 Preparations, 4.3 Formula)',
                  page: 'Page 2',
                },
                { sr: '4.4', title: 'Materials, Chemicals, Reference Standard & Equipment', page: 'Page 2' },
                { sr: '5.0', title: 'Verification Parameters and Acceptance Criteria', page: 'Page 3' },
                { sr: '6.0', title: 'System Suitability', page: 'Page 3' },
                { sr: '7.0', title: 'Linearity and Range (50 % to 150 % of nominal conc.)', page: 'Page 3' },
                { sr: '8.0', title: 'Precision (Repeatability, n = 6)', page: 'Page 5' },
                { sr: '9.0', title: 'Intermediate Precision (Analyst-to-Analyst)', page: 'Page 5' },
                { sr: '10.0', title: 'Accuracy / Recovery (75 %, 100 %, 125 % Levels)', page: 'Page 5' },
                { sr: '11.0', title: 'Overall Conclusion', page: 'Page 6' },
                { sr: '12.0', title: 'Review Checklist & Completion Record', page: 'Page 6' },
                { sr: '13.0', title: 'List of Abbreviations', page: 'Page 6' },
              ].map((item) => (
                <tr key={item.sr}>
                  <td className={`${cellClass} text-center font-medium`}>{item.sr}</td>
                  <td className={cellClass}>{item.title}</td>
                  <td className={`${cellClass} text-center text-gray-500`}>{item.page}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Page Break Line */}
        <div className="border-t-2 border-dashed border-gray-300 my-8 relative text-center">
          <span className="bg-white px-3 text-[10px] text-gray-400 uppercase tracking-widest relative -top-2">
            Page 2 Begins
          </span>
        </div>

        {/* SECTION 1.0 OBJECTIVE */}
        <div className="mb-6">
          <h3 className={`text-sm font-bold uppercase mb-2 ${headerTextClass}`}>
            1. OBJECTIVE
          </h3>
          <p className="text-xs leading-relaxed text-gray-800 text-justify">
            {data.objective}
          </p>
        </div>

        {/* SECTION 2.0 SCOPE */}
        <div className="mb-6">
          <h3 className={`text-sm font-bold uppercase mb-2 ${headerTextClass}`}>
            2. SCOPE
          </h3>
          <p className="text-xs leading-relaxed text-gray-800 text-justify">
            {data.scope}
          </p>
        </div>

        {/* SECTION 3.0 REFERENCE DOCUMENTS & VERIFICATION DETAILS */}
        <div className="mb-6">
          <h3 className={`text-sm font-bold uppercase mb-2 ${headerTextClass}`}>
            3. REFERENCE DOCUMENTS &amp; VERIFICATION DETAILS
          </h3>
          <table className="w-full text-xs border-collapse">
            <tbody>
              <tr>
                <td className={`${cellClass} font-semibold w-1/3 ${metaLabelBgClass}`}>Reference</td>
                <td className={cellClass}>{data.referenceDetails.reference}</td>
              </tr>
              <tr>
                <td className={`${cellClass} font-semibold ${metaLabelBgClass}`}>(a) Type of Verification</td>
                <td className={cellClass}>{data.referenceDetails.typeOfVerification}</td>
              </tr>
              <tr>
                <td className={`${cellClass} font-semibold ${metaLabelBgClass}`}>(b) Test to be Verified</td>
                <td className={cellClass}>{data.referenceDetails.testToBeVerified}</td>
              </tr>
              <tr>
                <td className={`${cellClass} font-semibold ${metaLabelBgClass}`}>(c) Verification Team</td>
                <td className={cellClass}>
                  Analyst 1: {data.referenceDetails.verificationTeam.analyst1}
                  <br />
                  Analyst 2: {data.referenceDetails.verificationTeam.analyst2}
                  <br />
                  Supervisor: {data.referenceDetails.verificationTeam.supervisor}
                </td>
              </tr>
              <tr>
                <td className={`${cellClass} font-semibold ${metaLabelBgClass}`}>(d) Experimental Details</td>
                <td className={cellClass}>{data.referenceDetails.experimentalDetails}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION 4.0 ANALYTICAL METHOD SUMMARY */}
        <div className="mb-6">
          <h3 className={`text-sm font-bold uppercase mb-2 ${headerTextClass}`}>
            4. ANALYTICAL METHOD SUMMARY
          </h3>

          {/* 4.1 Titrimetric Conditions */}
          <div className="mb-4 bg-gray-50 border border-gray-200 p-4 rounded-md">
            <h4 className="text-xs font-bold text-gray-900 mb-2 uppercase">
              4.1 Titrimetric Conditions
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <p>
                <span className="font-semibold">Mode:</span> {data.methodSummary.titrimetricConditions.mode}
              </p>
              <p>
                <span className="font-semibold">Titrant:</span> {data.methodSummary.titrimetricConditions.titrant}
              </p>
              <p>
                <span className="font-semibold">Endpoint Detection:</span>{' '}
                {data.methodSummary.titrimetricConditions.endpointDetection}
              </p>
              <p>
                <span className="font-semibold">Indicator:</span>{' '}
                {data.methodSummary.titrimetricConditions.indicator}
              </p>
              <p className="sm:col-span-2">
                <span className="font-semibold">Sample Taken:</span>{' '}
                {data.methodSummary.titrimetricConditions.sampleTakenDescription}
              </p>
              <p className="sm:col-span-2">
                <span className="font-semibold">Blank:</span>{' '}
                {data.methodSummary.titrimetricConditions.blankDescription}
              </p>
              <p className="sm:col-span-2">
                <span className="font-semibold">Endpoint Color Transition:</span>{' '}
                {data.methodSummary.titrimetricConditions.endpointColorTransition}
              </p>
              <p className="sm:col-span-2 text-gray-600 italic">
                <span className="font-semibold not-italic">Note:</span>{' '}
                {data.methodSummary.titrimetricConditions.analyticalNote}
              </p>
            </div>
          </div>

          {/* 4.2 Preparation of Solutions */}
          <div className="mb-4">
            <h4 className="text-xs font-bold text-gray-900 mb-2 uppercase">
              4.2 Preparation of Solutions
            </h4>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className={headerBgClass}>
                  <th className={`${cellClass} text-left w-1/4`}>Solution</th>
                  <th className={`${cellClass} text-left`}>Preparation Procedure</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={`${cellClass} font-semibold align-top`}>Blank</td>
                  <td className={cellClass}>{data.methodSummary.solutionPreparation.blank}</td>
                </tr>
                <tr>
                  <td className={`${cellClass} font-semibold align-top`}>Standard Solution</td>
                  <td className={cellClass}>{data.methodSummary.solutionPreparation.standardSolution}</td>
                </tr>
                <tr>
                  <td className={`${cellClass} font-semibold align-top`}>Sample Solution</td>
                  <td className={cellClass}>{data.methodSummary.solutionPreparation.sampleSolution}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 4.3 Calculation Formula */}
          <div className="mb-4">
            <h4 className="text-xs font-bold text-gray-900 mb-2 uppercase">
              4.3 Calculation Formula
            </h4>
            <div className="p-3 bg-blue-50/50 border border-blue-200 rounded text-xs space-y-1">
              <p className="font-bold text-blue-900">
                {data.methodSummary.calculationFormula.generalFormula}
              </p>
              <p className="font-semibold text-gray-700">
                {data.methodSummary.calculationFormula.assayFormula}
              </p>
              <p className="text-gray-600 text-[11px] pt-1">
                Where: {data.methodSummary.calculationFormula.definitions.map((d) => `${d.symbol} = ${d.meaning}`).join(', ')}.
              </p>
            </div>
          </div>

          {/* 4.4 Materials, Chemicals and Reference Standards */}
          <div className="mb-6">
            <h4 className="text-xs font-bold text-gray-900 mb-2 uppercase">
              4.4 Materials, Chemicals and Reference Standards
            </h4>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className={headerBgClass}>
                  <th className={`${cellClass} text-center w-12`}>Sr.</th>
                  <th className={`${cellClass} text-left`}>Name of Material / Chemical / Standard</th>
                  <th className={`${cellClass} text-left w-1/3`}>Type</th>
                  <th className={`${cellClass} text-left w-28`}>Batch / Lot No.</th>
                </tr>
              </thead>
              <tbody>
                {data.methodSummary.materialsAndStandards.map((m) => (
                  <tr key={m.srNo}>
                    <td className={`${cellClass} text-center`}>{m.srNo}</td>
                    <td className={`${cellClass} font-medium`}>{m.name}</td>
                    <td className={cellClass}>{m.type}</td>
                    <td className={cellClass}>{isProtocol ? ' ' : m.lotNo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Page Break Line */}
        <div className="border-t-2 border-dashed border-gray-300 my-8 relative text-center">
          <span className="bg-white px-3 text-[10px] text-gray-400 uppercase tracking-widest relative -top-2">
            Page 3 Begins
          </span>
        </div>

        {/* SECTION 5.0 VERIFICATION PARAMETERS & ACCEPTANCE CRITERIA */}
        <div className="mb-8">
          <h3 className={`text-sm font-bold uppercase mb-2 ${headerTextClass}`}>
            5. SUMMARY OF VERIFICATION PARAMETERS &amp; ACCEPTANCE CRITERIA
          </h3>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className={headerBgClass}>
                <th className={`${cellClass} text-center w-12`}>Sr.</th>
                <th className={`${cellClass} text-left w-1/4`}>Parameter</th>
                <th className={`${cellClass} text-left`}>Acceptance Criteria</th>
                <th className={`${cellClass} text-center w-1/4`}>Verification Requirement</th>
              </tr>
            </thead>
            <tbody>
              {data.verificationParameters.map((p) => (
                <tr key={p.srNo}>
                  <td className={`${cellClass} text-center font-medium`}>{p.srNo}</td>
                  <td className={`${cellClass} font-semibold text-gray-900`}>{p.parameter}</td>
                  <td className={cellClass}>{p.acceptanceCriteria}</td>
                  <td className={`${cellClass} text-center font-medium ${isProtocol ? 'text-gray-400' : 'text-emerald-700'}`}>
                    {isProtocol ? '—' : p.statusReport || 'Complies'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SECTION 6.0 SYSTEM SUITABILITY */}
        <div className="mb-8">
          <h3 className={`text-sm font-bold uppercase mb-1 ${headerTextClass}`}>
            6. SYSTEM SUITABILITY
          </h3>
          <p className="text-xs text-gray-700 mb-3 text-justify">
            Set of parameters and criteria thereof to ensure that the system is working properly. System suitability performed during entire verification of this method, by preparing five dilutions of the same concentration of sample and shows the results of system suitability by the application of statistical techniques i.e. Mean, Standard Deviation and Relative Standard Deviation (%).
          </p>
          <p className="text-xs font-bold text-gray-900 mb-1">
            Table 1 — {data.productName}
          </p>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className={headerBgClass}>
                <th className={`${cellClass} text-center w-16`}>Sr. No.</th>
                <th className={`${cellClass} text-center`}>Working Standard Weight (mg)</th>
                <th className={`${cellClass} text-center`}>Burette Reading (ml)</th>
              </tr>
            </thead>
            <tbody>
              {data.systemSuitability.rows.map((r) => (
                <tr key={r.srNo}>
                  <td className={`${cellClass} text-center font-medium`}>{r.srNo}</td>
                  <td className={`${cellClass} text-center`}>{isProtocol ? '' : r.weightMg}</td>
                  <td className={`${cellClass} text-center font-semibold text-blue-900`}>
                    {isProtocol ? '' : r.buretteReadingMl}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td colSpan={2} className={`${cellClass} text-right`}>
                  Mean
                </td>
                <td className={`${cellClass} text-center`}>
                  {isProtocol ? '' : data.systemSuitability.meanReadingMl}
                </td>
              </tr>
              <tr className="bg-gray-50 font-bold">
                <td colSpan={2} className={`${cellClass} text-right`}>
                  RSD (NMT 2.0 %)
                </td>
                <td className={`${cellClass} text-center text-emerald-800`}>
                  {isProtocol ? '' : `${data.systemSuitability.rsdReadingMl} %`}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION 7.0 LINEARITY AND RANGE */}
        <div className="mb-8">
          <h3 className={`text-sm font-bold uppercase mb-1 ${headerTextClass}`}>
            7. LINEARITY AND RANGE
          </h3>
          <h4 className="text-xs font-bold text-gray-900 mb-1 uppercase">A. Linearity</h4>
          <p className="text-xs text-gray-700 mb-2 text-justify">
            {data.linearityAndRange.linearity.explanatoryText1}
          </p>
          <p className="text-xs text-gray-700 mb-3 text-justify">
            {data.linearityAndRange.linearity.explanatoryText2}
          </p>
          <div className="mb-3 space-y-1 text-xs bg-gray-50 p-3 rounded border border-gray-200">
            <p className="font-semibold text-gray-900">
              1) Prepare 5 standard solutions covering 50 % to 150 % of nominal concentration:
            </p>
            {data.linearityAndRange.linearity.levels.map((lvl) => (
              <p key={lvl.levelPercent} className="pl-4 text-gray-700">
                • {lvl.preparationText}
              </p>
            ))}
            <p className="pt-1 text-gray-600">
              2) Titrate each level in triplicate, record the burette reading and plot mean burette reading against concentration.
            </p>
          </div>

          <p className="text-xs font-bold text-gray-900 mb-1">
            Table 2 — {data.productName}
          </p>
          <table className="w-full text-xs border-collapse mb-4">
            <thead>
              <tr className={headerBgClass}>
                <th className={`${cellClass} text-center w-14`}>Sr. No.</th>
                <th className={`${cellClass} text-center w-24`}>Level (%)</th>
                <th className={`${cellClass} text-center`}>Weight of WS taken (mg)</th>
                <th className={`${cellClass} text-center`}>Burette Reading (ml)</th>
                <th className={`${cellClass} text-center w-28`}>Mean</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let counter = 1;
                return data.linearityAndRange.linearity.levels.map((lvl) => {
                  return lvl.replicateReadings.map((reading, repIdx) => {
                    const isFirst = repIdx === 0;
                    return (
                      <tr key={`${lvl.levelPercent}-${repIdx}`}>
                        <td className={`${cellClass} text-center font-medium`}>{counter++}</td>
                        {isFirst && (
                          <td
                            rowSpan={3}
                            className={`${cellClass} text-center font-bold bg-gray-50/50 align-middle`}
                          >
                            {lvl.levelPercent} %
                          </td>
                        )}
                        <td className={`${cellClass} text-center`}>
                          {isProtocol ? '' : lvl.weightTakenMg.toFixed(1)}
                        </td>
                        <td className={`${cellClass} text-center`}>
                          {isProtocol ? '' : reading.toFixed(2)}
                        </td>
                        {isFirst && (
                          <td
                            rowSpan={3}
                            className={`${cellClass} text-center font-semibold bg-gray-50/50 align-middle`}
                          >
                            {isProtocol ? '' : lvl.meanReadingMl.toFixed(2)}
                          </td>
                        )}
                      </tr>
                    );
                  });
                });
              })()}
              <tr className="bg-blue-50/60 font-bold">
                <td colSpan={5} className={`${cellClass} text-right text-blue-950`}>
                  {isProtocol ? (
                    'Correlation coefficient (r² > 0.995) = '
                  ) : (
                    <>
                      Correlation coefficient (r² &gt; 0.995) ={' '}
                      <span className="text-emerald-800">
                        {data.linearityAndRange.linearity.rSquared}
                      </span>{' '}
                      (r = {data.linearityAndRange.linearity.correlationCoefficientR})
                    </>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          {/* B. Range */}
          <h4 className="text-xs font-bold text-gray-900 mb-1 uppercase pt-2">B. Range</h4>
          <p className="text-xs text-gray-700 mb-2 text-justify">
            {data.linearityAndRange.range.explanatoryText}
          </p>
          <p className="text-xs font-bold text-gray-900 mb-1">
            Table 3 — {data.productName}
          </p>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className={headerBgClass}>
                <th className={`${cellClass} text-center w-14`}>Sr. No.</th>
                <th className={`${cellClass} text-left`}>Sample ID</th>
                <th className={`${cellClass} text-center w-24`}>Level (%)</th>
                <th className={`${cellClass} text-center`}>Sample Burette Reading (ml)</th>
                <th className={`${cellClass} text-left w-1/3`}>Statistical Evaluation</th>
              </tr>
            </thead>
            <tbody>
              {data.linearityAndRange.range.rows.map((r, idx) => {
                let statNode = <span className="text-gray-400">—</span>;
                if (!isProtocol) {
                  if (idx === 0) statNode = <span>Mean = {data.linearityAndRange.range.stats75.mean}</span>;
                  else if (idx === 1) statNode = <span>SD = {data.linearityAndRange.range.stats75.sd}</span>;
                  else if (idx === 2) (
                    statNode = (
                      <span className="font-bold text-emerald-800">
                        RSD (NMT 2.0 %) = {data.linearityAndRange.range.stats75.rsd} %
                      </span>
                    )
                  );
                  else if (idx === 3) statNode = <span>Mean = {data.linearityAndRange.range.stats125.mean}</span>;
                  else if (idx === 4) statNode = <span>SD = {data.linearityAndRange.range.stats125.sd}</span>;
                  else if (idx === 5) (
                    statNode = (
                      <span className="font-bold text-emerald-800">
                        RSD (NMT 2.0 %) = {data.linearityAndRange.range.stats125.rsd} %
                      </span>
                    )
                  );
                } else {
                  if (idx === 0 || idx === 3) statNode = <span>Mean =</span>;
                  else if (idx === 1 || idx === 4) statNode = <span>SD =</span>;
                  else statNode = <span>RSD (NMT 2.0 %) =</span>;
                }

                return (
                  <tr key={r.srNo}>
                    <td className={`${cellClass} text-center font-medium`}>{r.srNo}</td>
                    <td className={`${cellClass} font-medium`}>{r.sampleId}</td>
                    <td className={`${cellClass} text-center font-semibold`}>{r.levelPercent} %</td>
                    <td className={`${cellClass} text-center`}>{isProtocol ? '' : r.buretteReadingMl}</td>
                    <td className={cellClass}>{statNode}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Page Break Line */}
        <div className="border-t-2 border-dashed border-gray-300 my-8 relative text-center">
          <span className="bg-white px-3 text-[10px] text-gray-400 uppercase tracking-widest relative -top-2">
            Page 5 Begins
          </span>
        </div>

        {/* SECTION 8.0 PRECISION */}
        <div className="mb-8">
          <h3 className={`text-sm font-bold uppercase mb-1 ${headerTextClass}`}>
            8. PRECISION
          </h3>
          <p className="text-xs text-gray-700 mb-2 whitespace-pre-line text-justify">
            {data.precision.explanatoryText}
          </p>
          <p className="text-xs font-bold text-gray-900 mb-1">
            Table 4 — {data.productName}
          </p>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className={headerBgClass}>
                <th className={`${cellClass} text-center w-14`}>Sr. No.</th>
                <th className={`${cellClass} text-left`}>Sample ID</th>
                <th className={`${cellClass} text-center`}>Amount of preparation used (mg)</th>
                <th className={`${cellClass} text-center`}>Burette Reading (ml)</th>
                <th className={`${cellClass} text-center font-bold`}>Content (% of LA)</th>
              </tr>
            </thead>
            <tbody>
              {data.precision.rows.map((r) => (
                <tr key={r.srNo}>
                  <td className={`${cellClass} text-center font-medium`}>{r.srNo}</td>
                  <td className={cellClass}>{r.sampleId}</td>
                  <td className={`${cellClass} text-center`}>{isProtocol ? '' : r.amountUsedMg}</td>
                  <td className={`${cellClass} text-center`}>{isProtocol ? '' : r.buretteReadingMl}</td>
                  <td className={`${cellClass} text-center font-semibold text-blue-900`}>
                    {isProtocol ? '' : r.contentPercentLA}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td colSpan={4} className={`${cellClass} text-right`}>
                  Mean
                </td>
                <td className={`${cellClass} text-center`}>
                  {isProtocol ? '' : `${data.precision.meanContentPercent} %`}
                </td>
              </tr>
              <tr className="bg-gray-50 font-bold">
                <td colSpan={4} className={`${cellClass} text-right`}>
                  RSD (NMT 2.0 %)
                </td>
                <td className={`${cellClass} text-center text-emerald-800`}>
                  {isProtocol ? '' : `${data.precision.rsdContentPercent} %`}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION 9.0 INTERMEDIATE PRECISION */}
        <div className="mb-8">
          <h3 className={`text-sm font-bold uppercase mb-1 ${headerTextClass}`}>
            9. INTERMEDIATE PRECISION
          </h3>
          <p className="text-xs text-gray-700 mb-2 whitespace-pre-line text-justify">
            {data.intermediatePrecision.explanatoryText}
          </p>
          <p className="text-xs font-bold text-gray-900 mb-1">
            Table 5 — {data.productName}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className={headerBgClass}>
                  <th rowSpan={2} className={`${cellClass} text-center w-12 align-middle`}>
                    Sr.
                  </th>
                  <th colSpan={3} className={`${cellClass} text-center font-bold`}>
                    Analyst : 1
                  </th>
                  <th colSpan={3} className={`${cellClass} text-center font-bold`}>
                    Analyst : 2
                  </th>
                </tr>
                <tr className={headerBgClass}>
                  <th className={`${cellClass} text-center`}>Amount used (mg)</th>
                  <th className={`${cellClass} text-center`}>Burette (ml)</th>
                  <th className={`${cellClass} text-center font-semibold`}>Content (% LA)</th>
                  <th className={`${cellClass} text-center`}>Amount used (mg)</th>
                  <th className={`${cellClass} text-center`}>Burette (ml)</th>
                  <th className={`${cellClass} text-center font-semibold`}>Content (% LA)</th>
                </tr>
              </thead>
              <tbody>
                {data.intermediatePrecision.rows.map((r) => (
                  <tr key={r.srNo}>
                    <td className={`${cellClass} text-center font-medium`}>{r.srNo}</td>
                    <td className={`${cellClass} text-center`}>
                      {isProtocol ? '' : r.analyst1.amountUsedMg}
                    </td>
                    <td className={`${cellClass} text-center`}>
                      {isProtocol ? '' : r.analyst1.buretteReadingMl}
                    </td>
                    <td className={`${cellClass} text-center font-medium`}>
                      {isProtocol ? '' : r.analyst1.contentPercentLA}
                    </td>
                    <td className={`${cellClass} text-center`}>
                      {isProtocol ? '' : r.analyst2.amountUsedMg}
                    </td>
                    <td className={`${cellClass} text-center`}>
                      {isProtocol ? '' : r.analyst2.buretteReadingMl}
                    </td>
                    <td className={`${cellClass} text-center font-medium`}>
                      {isProtocol ? '' : r.analyst2.contentPercentLA}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-bold">
                  <td colSpan={3} className={`${cellClass} text-right`}>
                    Mean
                  </td>
                  <td className={`${cellClass} text-center`}>
                    {isProtocol ? '' : `${data.intermediatePrecision.analyst1Stats.mean} %`}
                  </td>
                  <td colSpan={2} className={`${cellClass} text-right`}>
                    Mean
                  </td>
                  <td className={`${cellClass} text-center`}>
                    {isProtocol ? '' : `${data.intermediatePrecision.analyst2Stats.mean} %`}
                  </td>
                </tr>
                <tr className="bg-gray-50 font-bold">
                  <td colSpan={3} className={`${cellClass} text-right`}>
                    RSD (NMT 2.0 %)
                  </td>
                  <td className={`${cellClass} text-center text-emerald-800`}>
                    {isProtocol ? '' : `${data.intermediatePrecision.analyst1Stats.rsd} %`}
                  </td>
                  <td colSpan={2} className={`${cellClass} text-right`}>
                    RSD (NMT 2.0 %)
                  </td>
                  <td className={`${cellClass} text-center text-emerald-800`}>
                    {isProtocol ? '' : `${data.intermediatePrecision.analyst2Stats.rsd} %`}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 10.0 ACCURACY (RECOVERY) */}
        <div className="mb-8">
          <h3 className={`text-sm font-bold uppercase mb-1 ${headerTextClass}`}>
            10. ACCURACY (RECOVERY)
          </h3>
          <p className="text-xs text-gray-700 mb-2 whitespace-pre-line text-justify">
            {data.accuracy.explanatoryText}
          </p>
          <p className="text-xs font-bold text-gray-900 mb-1">
            Table 6 — {data.productName}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className={headerBgClass}>
                  <th className={`${cellClass} text-center w-10`}>Sr.</th>
                  <th className={`${cellClass} text-left`}>Sample ID</th>
                  <th className={`${cellClass} text-center w-16`}>Level (%)</th>
                  <th className={`${cellClass} text-center`}>Amount Spiked (mg)</th>
                  <th className={`${cellClass} text-center`}>Burette (ml)</th>
                  <th className={`${cellClass} text-center`}>Recovered (mg)</th>
                  <th className={`${cellClass} text-center font-bold`}>Recovery (%)</th>
                  <th className={`${cellClass} text-left w-28`}>Evaluation</th>
                </tr>
              </thead>
              <tbody>
                {data.accuracy.rows.map((r, idx) => {
                  let evalNode = <span className="text-gray-400">—</span>;
                  const lvlStat = data.accuracy.levelStats.find((s) => s.levelPercent === r.levelPercent);
                  if (!isProtocol && lvlStat) {
                    if (idx === 0 || idx === 3 || idx === 6) evalNode = <span>Mean = {lvlStat.meanRecovery} %</span>;
                    else if (idx === 1 || idx === 4 || idx === 7) (
                      evalNode = <span className="font-semibold text-emerald-800">RSD = {lvlStat.rsdRecovery} %</span>
                    );
                    else evalNode = <span className="text-[10px] text-gray-500">(NMT 2.0 %)</span>;
                  } else {
                    if (idx === 0 || idx === 3 || idx === 6) evalNode = <span>Mean =</span>;
                    else if (idx === 1 || idx === 4 || idx === 7) evalNode = <span>RSD =</span>;
                    else evalNode = <span className="text-[10px] text-gray-400">(NMT 2.0 %)</span>;
                  }

                  return (
                    <tr key={r.srNo}>
                      <td className={`${cellClass} text-center font-medium`}>{r.srNo}</td>
                      <td className={cellClass}>{r.sampleId}</td>
                      <td className={`${cellClass} text-center font-semibold`}>{r.levelPercent} %</td>
                      <td className={`${cellClass} text-center`}>{isProtocol ? '' : r.spikedMg}</td>
                      <td className={`${cellClass} text-center`}>{isProtocol ? '' : r.buretteReadingMl}</td>
                      <td className={`${cellClass} text-center`}>{isProtocol ? '' : r.recoveredMg}</td>
                      <td className={`${cellClass} text-center font-bold text-blue-900`}>
                        {isProtocol ? '' : `${r.recoveryPercent} %`}
                      </td>
                      <td className={cellClass}>{evalNode}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Page Break Line */}
        <div className="border-t-2 border-dashed border-gray-300 my-8 relative text-center">
          <span className="bg-white px-3 text-[10px] text-gray-400 uppercase tracking-widest relative -top-2">
            Page 6 Begins
          </span>
        </div>

        {/* SECTION 11.0 OVERALL CONCLUSION */}
        <div className="mb-8">
          <h3 className={`text-sm font-bold uppercase mb-2 ${headerTextClass}`}>
            11. OVERALL CONCLUSION
          </h3>
          <p className="text-xs leading-relaxed text-gray-800 text-justify">
            {isProtocol ? data.overallConclusionProtocol : data.overallConclusionReport}
          </p>
          {isProtocol && (
            <div className="mt-6 border-b border-gray-400 pt-8 pb-1 text-center">
              <span className="text-[11px] text-gray-500 italic">
                (Conclusion to be recorded by the Analyst &amp; QC Supervisor after completion of experimental testing)
              </span>
            </div>
          )}
        </div>

        {/* SECTION 12.0 REVIEW CHECKLIST & COMPLETION RECORD */}
        <div className="mb-8">
          <h3 className={`text-sm font-bold uppercase mb-2 ${headerTextClass}`}>
            12. REVIEW CHECKLIST &amp; COMPLETION RECORD
          </h3>
          <table className="w-full text-xs border-collapse">
            <tbody>
              <tr>
                <td className={`${cellClass} font-semibold w-2/3`}>
                  Raw data &amp; titration records reviewed
                </td>
                <td className={cellClass}>
                  {isProtocol ? (
                    '[ ] Yes   [ ] No    Initials: ________'
                  ) : (
                    <span className="font-semibold text-emerald-800">
                      [✓] Yes   [ ] No    Initials: {data.reviewChecklist.rawRecordsInitials}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className={`${cellClass} font-semibold`}>
                  Calculation &amp; statistical evaluation verified
                </td>
                <td className={cellClass}>
                  {isProtocol ? (
                    '[ ] Yes   [ ] No    Initials: ________'
                  ) : (
                    <span className="font-semibold text-emerald-800">
                      [✓] Yes   [ ] No    Initials: {data.reviewChecklist.calcInitials}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className={`${cellClass} font-semibold`}>Deviation / OOS raised</td>
                <td className={cellClass}>
                  {isProtocol ? (
                    '[ ] None   [ ] Ref No: ____________'
                  ) : (
                    <span>[✓] None   Ref No: {data.reviewChecklist.deviationRefNo}</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className={`${cellClass} font-semibold`}>Annexures attached</td>
                <td className={cellClass}>
                  {isProtocol ? (
                    '_____ of _____ pages'
                  ) : (
                    <span>{data.reviewChecklist.annexuresPages} of 04 pages</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION 13.0 LIST OF ABBREVIATIONS */}
        <div className="mb-8">
          <h3 className={`text-sm font-bold uppercase mb-2 ${headerTextClass}`}>
            13. LIST OF ABBREVIATIONS
          </h3>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className={headerBgClass}>
                <th className={`${cellClass} text-center w-28`}>Abbreviation</th>
                <th className={`${cellClass} text-left`}>Full Form / Expansion</th>
              </tr>
            </thead>
            <tbody>
              {data.abbreviations.map((a) => (
                <tr key={a.abbreviation}>
                  <td className={`${cellClass} text-center font-bold text-gray-900`}>
                    {a.abbreviation}
                  </td>
                  <td className={cellClass}>{a.fullForm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Document End Footer */}
        <div className="text-center pt-8 border-t border-gray-300 text-xs text-gray-500 font-semibold uppercase tracking-wider">
          — END OF DOCUMENT —
        </div>

        {/* Bottom Page Footer emulation */}
        <div className="mt-8 pt-2 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400">
          <span>Format No. {data.formatNo}</span>
          <span>Page 1 of 7</span>
          <span>Effective: {data.protocolDate}</span>
        </div>
      </div>
    </div>
  );
};
