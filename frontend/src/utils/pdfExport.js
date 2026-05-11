import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Export dashboard to PDF
 * @param {string} elementId - ID of the element to export
 * @param {string} filename - Name of the PDF file
 */
export const exportDashboardToPDF = async (elementId, filename = 'dashboard.pdf') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with ID ${elementId} not found`);
      return;
    }

    // Create canvas from HTML element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    // Get canvas dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;

    // Add image to PDF
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
  }
};

/**
 * Export chart to PDF
 * @param {string} chartId - ID of the chart element
 * @param {string} filename - Name of the PDF file
 */
export const exportChartToPDF = async (chartId, filename = 'chart.pdf') => {
  try {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) {
      console.error(`Chart element with ID ${chartId} not found`);
      return;
    }

    // Create canvas from chart
    const canvas = await html2canvas(chartElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    // Calculate dimensions to fit on page
    const imgWidth = 190; // Leave margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save(filename);
  } catch (error) {
    console.error('Error exporting chart to PDF:', error);
  }
};

/**
 * Export table data to PDF
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Column definitions
 * @param {string} filename - Name of the PDF file
 */
export const exportTableToPDF = (data, columns, filename = 'table.pdf') => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - 2 * margin;

    let yPosition = margin;
    const lineHeight = 7;
    const columnWidth = contentWidth / columns.length;

    // Add title
    pdf.setFontSize(14);
    pdf.text('Data Export', margin, yPosition);
    yPosition += 10;

    // Add headers
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    columns.forEach((col, index) => {
      pdf.text(col.label, margin + index * columnWidth, yPosition);
    });
    yPosition += lineHeight;

    // Add data rows
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(9);
    data.forEach((row) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }

      columns.forEach((col, index) => {
        const cellText = String(row[col.key] || '');
        pdf.text(cellText, margin + index * columnWidth, yPosition);
      });
      yPosition += lineHeight;
    });

    pdf.save(filename);
  } catch (error) {
    console.error('Error exporting table to PDF:', error);
  }
};
