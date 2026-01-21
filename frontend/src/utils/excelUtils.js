import * as XLSX from 'xlsx';

/**
 * Generate and download an Excel template for tasks.
 */
export const downloadTaskTemplate = () => {
    const headers = [
        ['Task Name', 'Start Date (YYYY-MM-DD)', 'End Date (YYYY-MM-DD)', 'Status', 'Completion %', 'Assigned To']
    ];
    const ws = XLSX.utils.aoa_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tasks Template");
    XLSX.writeFile(wb, "ISTMO_Task_Template.xlsx");
};

/**
 * Generate and download an Excel template for payments.
 */
export const downloadPaymentTemplate = () => {
    const headers = [
        ['Deliverable', 'Phase', 'Plan Date (YYYY-MM-DD)', 'Planned Amount', 'Category', 'Remarks']
    ];
    const ws = XLSX.utils.aoa_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payments Template");
    XLSX.writeFile(wb, "ISTMO_Payment_Template.xlsx");
};

/**
 * Parse an Excel file and return data.
 * @param {File} file 
 */
export const parseExcelFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);
                resolve(json);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
};
