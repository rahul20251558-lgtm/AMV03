const fs = require('fs');

let file = fs.readFileSync('src/components/FPSExtractorModal.tsx', 'utf8');
const replacement = `
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = \`//cdnjs.cloudflare.com/ajax/libs/pdf.js/\${pdfjsLib.version}/pdf.worker.min.js\`;

  useEffect(() => {
    if (isOpen && fileData) {
      if (fileData.mimeType === 'application/pdf') {
        extractPdfText(fileData.base64);
      } else if (fileData.mimeType.startsWith('image/')) {
        extractText(fileData.base64);
      }
    }
  }, [isOpen, fileData]);

  const extractPdfText = async (base64: string) => {
    setIsExtracting(true);
    try {
      const binary = atob(base64);
      const array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
      }
      const pdf = await pdfjsLib.getDocument({ data: array }).promise;
      let fullText = '';
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\\n';
      }
      setExtractedText(fullText);
      parseExtractedText(fullText);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  };
`;

// we can write a full replacement of the modal component logic
