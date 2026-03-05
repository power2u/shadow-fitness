import * as pdfjsLib from 'pdfjs-dist';

// Set worker source for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
).toString();

/**
 * Extract text from a PDF file page-by-page
 * @param {File} file - PDF file object
 * @param {Function} onProgress - callback(pageNum, totalPages)
 * @returns {Promise<{pages: Array<{pageNum: number, text: string}>, title: string, totalPages: number}>}
 */
export async function parsePDF(file, onProgress = () => { }) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdf.numPages;
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items
            .map(item => item.str)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

        if (text.length > 10) {
            pages.push({ pageNum: i, text });
        }
        onProgress(i, totalPages);
    }

    const title = file.name.replace(/\.pdf$/i, '');
    return { pages, title, totalPages };
}

/**
 * Split extracted pages into ~500-word chunks with 50-word overlap
 * @param {Array} pages - from parsePDF
 * @param {string} title - document title
 * @param {number} chunkSize - target words per chunk
 * @returns {Array<{content, chunk_index, page_start, page_end, document_title}>}
 */
export function chunkPages(pages, title, chunkSize = 500) {
    const chunks = [];
    let currentChunk = '';
    let currentPageStart = pages[0]?.pageNum || 1;
    let currentPageEnd = currentPageStart;
    let chunkIndex = 0;

    for (const page of pages) {
        const words = page.text.split(/\s+/);
        const currentWords = currentChunk.split(/\s+/).filter(Boolean);

        if (currentWords.length + words.length > chunkSize && currentChunk.length > 50) {
            // Save current chunk
            chunks.push({
                document_title: title,
                chunk_index: chunkIndex,
                content: currentChunk.trim(),
                page_start: currentPageStart,
                page_end: currentPageEnd,
            });
            chunkIndex++;

            // Overlap: keep last 50 words
            const overlapWords = currentWords.slice(-50);
            currentChunk = overlapWords.join(' ') + ' ' + page.text;
            currentPageStart = page.pageNum;
        } else {
            currentChunk += ' ' + page.text;
        }
        currentPageEnd = page.pageNum;
    }

    // Final chunk
    if (currentChunk.trim().length > 50) {
        chunks.push({
            document_title: title,
            chunk_index: chunkIndex,
            content: currentChunk.trim(),
            page_start: currentPageStart,
            page_end: currentPageEnd,
        });
    }

    return chunks;
}

/**
 * Full pipeline: file → pages → chunks
 */
export async function processBook(file, onProgress = () => { }) {
    const { pages, title, totalPages } = await parsePDF(file, onProgress);
    const chunks = chunkPages(pages, title);
    return { title, totalPages, chunks, extractedPages: pages.length };
}
