export async function loadTemplate(file) {
  return new Promise((resolve, reject) => {
    if (file.type === 'application/pdf') {
      loadPdfTemplate(file).then(resolve).catch(reject);
    } else if (file.type.startsWith('image/')) {
      loadImageTemplate(file).then(resolve).catch(reject);
    } else {
      reject(new Error('Format non supporté. Utilisez PDF, PNG ou JPG.'));
    }
  });
}

async function loadPdfTemplate(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdfBytes = new Uint8Array(arrayBuffer);
  const freshBytes = () => new Uint8Array(pdfBytes);

  const pdfjsLib = await getPdfjsLib();
  const pdf = await pdfjsLib.getDocument({ data: freshBytes() }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 2 });

  const canvas = document.createElement('canvas');
  canvas.width  = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport }).promise;

  return {
    type: 'pdf',
    fileName: file.name,
    previewURL: canvas.toDataURL('image/png'),
    previewWidth: viewport.width,
    previewHeight: viewport.height,
    get pdfBytes() { return new Uint8Array(arrayBuffer); },
  };
}

async function loadImageTemplate(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          type: 'image',
          fileName: file.name,
          previewURL: e.target.result,
          dataURL: e.target.result,
          width: img.naturalWidth,
          height: img.naturalHeight,
          previewWidth: img.naturalWidth,
          previewHeight: img.naturalHeight,
        });
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getPdfjsLib() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(window.pdfjsLib);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
