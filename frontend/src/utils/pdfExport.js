import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

/**
 * Export dashboard to PDF using data for a clean professional look
 * @param {Object} stats - The statistics data object
 * @param {string} userRole - The role of the current user
 */
export const exportDashboardToPDF = async (stats, userRole) => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    // --- Header ---
    doc.setFillColor(59, 130, 246); // Primary blue color
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('VEKTOR MANAGEMENT', margin, 15);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`RAPPORT ANALYTIQUE - ${userRole.toUpperCase()}`, margin, 25);
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}`, margin, 32);

    yPos = 50;

    // --- Key Metrics Summary ---
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Résumé des Statistiques', margin, yPos);
    yPos += 10;

    const summaryData = [];
    if (stats.totalAccounts) summaryData.push(['Total des comptes', stats.totalAccounts[0]?.count || 0]);
    if (stats.totalReservations) summaryData.push(['Total des réservations', stats.totalReservations[0]?.count || 0]);
    if (stats.equipementCount) summaryData.push(['Nombre d\'équipements', stats.equipementCount[0]?.count || 0]);
    if (stats.activeReservations) summaryData.push(['Réservations actives', stats.activeReservations[0]?.count || 0]);

    autoTable(doc, {
      startY: yPos,
      margin: { left: margin, right: margin },
      head: [['Métrique', 'Valeur']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10, cellPadding: 5 }
    });

    yPos = doc.lastAutoTable.finalY + 20;

    // --- Detailed Tables ---
    
    // Accounts by Role
    if (stats.accountsByRole && stats.accountsByRole.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Répartition des Comptes par Rôle', margin, yPos);
      yPos += 8;

      const roleMapping = {
        'admin': 'Administrateur',
        '0': 'Administrateur',
        'manager': 'Gestionnaire',
        '1': 'Gestionnaire',
        'user': 'Utilisateur',
        '2': 'Utilisateur'
      };

      autoTable(doc, {
        startY: yPos,
        margin: { left: margin, right: margin },
        head: [['Rôle', 'Nombre de comptes', 'Pourcentage']],
        body: stats.accountsByRole.map(item => {
          const role = roleMapping[item.name?.toLowerCase()] || item.name || item.role;
          const percentage = ((item.count / (stats.totalAccounts[0]?.count || 1)) * 100).toFixed(1) + '%';
          return [role, item.count, percentage];
        }),
        headStyles: { fillColor: [139, 92, 246] }
      });
      yPos = doc.lastAutoTable.finalY + 15;
    }

    // Activity by Department
    if (stats.departmentActivity && stats.departmentActivity.length > 0) {
      if (yPos > 240) { doc.addPage(); yPos = 20; }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Activité par Département', margin, yPos);
      yPos += 8;

      autoTable(doc, {
        startY: yPos,
        margin: { left: margin, right: margin },
        head: [['Département', 'Utilisateurs', 'Réservations']],
        body: stats.departmentActivity.map(item => [
          item.departement || 'Non spécifié',
          item.user_count,
          item.reservation_count
        ]),
        headStyles: { fillColor: [16, 185, 129] }
      });
      yPos = doc.lastAutoTable.finalY + 15;
    }

    // Top Active Users
    if (stats.topActiveUsers && stats.topActiveUsers.length > 0) {
      if (yPos > 220) { doc.addPage(); yPos = 20; }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Utilisateurs les Plus Actifs', margin, yPos);
      yPos += 8;

      autoTable(doc, {
        startY: yPos,
        margin: { left: margin, right: margin },
        head: [['Utilisateur', 'Rôle', 'Réservations', 'Dernière Activité']],
        body: stats.topActiveUsers.map(user => [
          `${user.prenom} ${user.nom}`,
          user.role.toUpperCase(),
          user.reservation_count,
          user.last_activity ? new Date(user.last_activity).toLocaleDateString('fr-FR') : 'N/A'
        ]),
        headStyles: { fillColor: [59, 130, 246] }
      });
    }

    // --- Footer ---
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} sur ${totalPages}`, pageWidth / 2, 287, { align: 'center' });
      doc.text('VEKTOR MANAGEMENT - Système de Réservation Intelligent', margin, 287);
    }

    // Save the PDF
    doc.save(`Rapport_Analyse_Vektor_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
};

/**
 * Export chart to PDF - Keeps screenshot functionality for specific charts
 */
export const exportChartToPDF = async (chartId, filename = 'chart.pdf', title = 'Chart') => {
  try {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) {
      console.error(`Chart element with ID ${chartId} not found`);
      return;
    }

    const canvas = await html2canvas(chartElement, {
      scale: 3,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, 20, 20);
    
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 170;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 20, 30, imgWidth, imgHeight);
    pdf.save(filename);
  } catch (error) {
    console.error('Error exporting chart to PDF:', error);
  }
};

