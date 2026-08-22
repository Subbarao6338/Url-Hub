/**
 * Copy text to clipboard using navigator.clipboard or document.execCommand fallback.
 * @param {string} text - The text to copy.
 * @param {function} [onComplete] - Callback function called after copying.
 */
export const copyToClipboard = (text, onComplete) => {
  if (!text) return;

  const handleComplete = () => {
    if (typeof onComplete === 'function') {
      onComplete();
    }
  };

  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    navigator.clipboard.writeText(text).then(handleComplete).catch(() => {
      fallbackCopyToClipboard(text, handleComplete);
    });
  } else {
    fallbackCopyToClipboard(text, handleComplete);
  }
};

const fallbackCopyToClipboard = (text, onComplete) => {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    if (successful && onComplete) {
      onComplete();
    }
  } catch (err) {
    console.error('Fallback copy failed', err);
  }
};

/**
 * Download content as a file.
 * @param {string|Blob} content - The content to download.
 * @param {string} filename - The name of the file.
 * @param {string} type - The MIME type of the file.
 */
export const downloadFile = async (content, filename, type) => {
  let blob;
  if (content instanceof Blob) {
    blob = content;
  } else {
    if (type === 'pdf') {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      const splitText = doc.splitTextToSize(content, 180);
      const pageHeight = doc.internal.pageSize.height;
      let y = 10;

      for (let i = 0; i < splitText.length; i++) {
          if (y + 10 > pageHeight) {
              doc.addPage();
              y = 10;
          }
          doc.text(splitText[i], 10, y);
          y += 7;
      }
      blob = doc.output('blob');
    } else {
      blob = new Blob([content], { type: type === 'md' ? 'text/markdown' : 'text/plain' });
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith(`.${type}`) ? filename : `${filename}.${type}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
