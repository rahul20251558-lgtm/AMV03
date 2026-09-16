import React from 'react';
import { FooterSignOffData, DataMode, ThemeFormat } from '../types';

export const DEFAULT_FOOTER_SIGN_OFF: FooterSignOffData = {
  preparedBy: { title: 'Prepared By', name: 'Prepared By', designation: 'QC. Chemist', date: '09/07/2024' },
  checkedBy: { title: 'Checked By', name: 'Checked By', designation: 'QC. In-charge', date: '09/07/2024' },
  qaInCharge: { title: 'QA In-charge', name: 'QA In-charge', designation: 'QA In-charge', date: '09/07/2024' },
  plantHead: { title: 'Plant Head', name: 'Plant Head', designation: 'Plant Head', date: '09/07/2024' },
  formatNo: 'WC/QC/01/0F01',
};

interface SignOffFooterProps {
  pageNum: number;
  totalPages: number;
  dataMode?: DataMode;
  footerData?: FooterSignOffData;
  onUpdateFooterData?: (d: FooterSignOffData) => void;
  isReport?: boolean;
  theme?: ThemeFormat;
}

export const SignOffFooter: React.FC<SignOffFooterProps> = ({
  pageNum,
  totalPages,
  dataMode = 'template',
  theme,
  footerData = DEFAULT_FOOTER_SIGN_OFF
}) => {
  const isWestcoast = theme === 'westcoast';

  if (isWestcoast) {
    return (
      <div className="mt-8 pt-4 flex flex-col items-center justify-center text-[12pt] font-serif text-black w-full">
        {dataMode === 'DEMO' && (
          <div className="font-bold text-[#b58900] mb-2 tracking-wide uppercase text-sm">
            DEMO / FORMAT-DEMONSTRATION ONLY — NOT FOR GMP USE
          </div>
        )}
        <table className="w-full border-collapse border border-black text-center" style={{ tableLayout: 'fixed' }}>
          <tbody>
            <tr>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1 font-semibold">Prepared By</td>
              <td className="border border-black p-1 font-semibold">Checked By</td>
              <td className="border border-black p-1 font-semibold" colSpan={2}>Approved By</td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-semibold text-left pl-2 h-8">Signature</td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-semibold text-left pl-2">Date</td>
              <td className="border border-black p-1">{footerData?.preparedBy?.date || ''}</td>
              <td className="border border-black p-1">{footerData?.checkedBy?.date || ''}</td>
              <td className="border border-black p-1">{footerData?.qaInCharge?.date || ''}</td>
              <td className="border border-black p-1">{footerData?.plantHead?.date || ''}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-semibold text-left pl-2">Designation</td>
              <td className="border border-black p-1">{footerData?.preparedBy?.designation || ''}</td>
              <td className="border border-black p-1">{footerData?.checkedBy?.designation || ''}</td>
              <td className="border border-black p-1">{footerData?.qaInCharge?.designation || ''}</td>
              <td className="border border-black p-1">{footerData?.plantHead?.designation || ''}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-4 flex flex-col items-center justify-center text-[13px] font-serif text-black w-full">
      {dataMode === 'DEMO' && (
        <div className="font-bold text-[#b58900] mb-2 tracking-wide uppercase">
          DEMO / FORMAT-DEMONSTRATION ONLY — NOT FOR GMP USE
        </div>
      )}
      <div>Page {pageNum} of {totalPages}</div>
    </div>
  );
};
