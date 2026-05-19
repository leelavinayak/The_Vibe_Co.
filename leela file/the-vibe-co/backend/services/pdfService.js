const PDFDocument = require('pdfkit');

/**
 * Generates an ultra-premium, white-and-gold luxury PDF Receipt/Invoice buffer in memory.
 * @param {Object} contact - The booking inquiry/contact document
 * @param {Object} providerInfo - The other party's details (User or Provider)
 * @param {Boolean} isForUser - If true, formats for the User. If false, formats for the Provider.
 * @returns {Promise<Buffer>} Buffer containing PDF data
 */
const generatePDFBuffer = (contact, providerInfo, isForUser = true) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4',
        info: {
          Title: isForUser ? `THE VIBE CO. - Invoice Receipt` : `THE VIBE CO. - Client Work Dossier`,
          Author: 'THE VIBE CO. Selection Committee'
        }
      });
      
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // 1. Sleek Pure White Background
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ffffff');

      // 2. High-end Double Gold Ornamental Border
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).lineWidth(1).strokeColor('#C9A84C').stroke();
      doc.rect(26, 26, doc.page.width - 52, doc.page.height - 52).lineWidth(0.5).strokeColor('#C9A84C').stroke();

      // 3. Brand Header Logo & Tagline
      doc.fillColor('#C9A84C')
        .font('Times-Bold')
        .fontSize(32)
        .text('THE VIBE CO.', { align: 'center', charSpacing: 8 });

      doc.moveDown(0.15);
      doc.fillColor('#444444')
        .font('Helvetica')
        .fontSize(8)
        .text('THE PINNACLE OF LUXURY EVENT ORCHESTRATION', { align: 'center', characterSpacing: 3.5 });

      doc.moveDown(2);

      // 4. Dossier Title
      doc.fillColor('#1a1a1a')
        .fontSize(18)
        .font('Times-Bold')
        .text(isForUser ? 'EXQUISITE SERVICE INVOICE RECEIPT' : 'PARTNER CLIENT WORK DOSSIER', { align: 'center', characterSpacing: 2 });
      
      doc.moveDown(0.3);
      doc.moveTo(160, doc.y).lineTo(doc.page.width - 160, doc.y).lineWidth(1).strokeColor('#C9A84C').stroke();
      doc.moveDown(1.8);

      // 5. Grid Layout - Client & Partner Metadata
      const startY = doc.y;
      
      // LEFT COLUMN: Client / User Details (always on the left for consistency)
      doc.fillColor('#C9A84C').font('Helvetica-Bold').fontSize(10).text('CLIENT DETAILS (USER)', 60, startY);
      doc.moveDown(0.4);
      doc.fillColor('#1a1a1a').font('Helvetica').fontSize(12).text(contact.name);
      doc.fillColor('#444444').font('Helvetica').fontSize(10).text(`Email: ${contact.email}`);
      doc.text(`Phone: ${contact.phone || 'N/A'}`);

      // RIGHT COLUMN: Service Member / Provider Details (always on the right for consistency)
      doc.fillColor('#C9A84C').font('Helvetica-Bold').fontSize(10).text('SERVICE MEMBER (PROVIDER)', 320, startY);
      doc.moveDown(0.4);
      doc.fillColor('#1a1a1a').font('Helvetica').fontSize(12).text(providerInfo.name, 320);
      doc.fillColor('#444444').font('Helvetica').fontSize(10).text(`Email: ${providerInfo.email}`, 320);
      doc.text(`Phone: ${providerInfo.phone || 'N/A'}`, 320);

      doc.moveDown(2);
      
      // Reset alignment
      doc.x = 60; 

      // 6. Event Details Divider
      doc.moveTo(60, doc.y).lineTo(doc.page.width - 60, doc.y).lineWidth(0.5).strokeColor('rgba(201,168,76,0.25)').stroke();
      doc.moveDown(1.2);

      // 7. Event Metadata Table
      const metaY = doc.y;
      doc.fillColor('#C9A84C').font('Helvetica-Bold').fontSize(10).text('EVENT SPECIFICATION', 60, metaY);
      doc.fillColor('#1a1a1a').font('Helvetica').fontSize(11).text(`Type: ${contact.eventType.toUpperCase()}`, 60, metaY + 18);
      doc.fillColor('#444444').font('Helvetica').fontSize(10).text(`Date: ${contact.eventDate ? new Date(contact.eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'To Be Determined'}`, 60, metaY + 34);

      if (contact._id) {
        doc.fillColor('#C9A84C').font('Helvetica-Bold').fontSize(10).text('DOSSIER REFERENCE', 320, metaY);
        doc.fillColor('#1a1a1a').font('Helvetica').fontSize(10).text(`Inquiry ID: ${contact._id.toString()}`, 320, metaY + 18);
        doc.fillColor('#444444').font('Helvetica').text(`Closed On: ${new Date().toLocaleDateString('en-US')}`, 320, metaY + 34);
      }

      doc.moveDown(3);
      doc.x = 60;

      // 8. Billing Ledger Table
      doc.fillColor('#C9A84C').font('Helvetica-Bold').fontSize(11).text('BILLING LEDGER STATEMENT', 60);
      doc.moveDown(0.5);

      const tableHeaderY = doc.y;
      doc.moveTo(60, tableHeaderY).lineTo(doc.page.width - 60, tableHeaderY).lineWidth(1).strokeColor('#C9A84C').stroke();
      doc.moveDown(0.4);

      // Header Column labels
      doc.fillColor('#1a1a1a').font('Helvetica-Bold').fontSize(10).text('Description', 70);
      doc.text('Amount (INR)', doc.page.width - 160, tableHeaderY + 5, { align: 'right', width: 100 });
      doc.moveDown(0.4);
      
      const tableBorderY1 = doc.y;
      doc.moveTo(60, tableBorderY1).lineTo(doc.page.width - 60, tableBorderY1).lineWidth(0.5).strokeColor('rgba(201,168,76,0.3)').stroke();
      doc.moveDown(0.8);

      // Fetch items or default to standard line item
      const items = (contact.billing && contact.billing.items && contact.billing.items.length > 0)
        ? contact.billing.items 
        : [{ description: `${contact.eventType.toUpperCase()} Luxury Services`, amount: contact.finalPrice || parseFloat(contact.budget.replace(/[^0-9.]/g, '')) || 0 }];

      let computedTotal = 0;
      items.forEach((item) => {
        const itemY = doc.y;
        doc.fillColor('#1a1a1a').font('Helvetica').fontSize(11).text(item.description, 70, itemY);
        doc.fillColor('#444444').font('Helvetica').text(`Rs. ${item.amount.toLocaleString()}`, doc.page.width - 160, itemY, { align: 'right', width: 100 });
        doc.moveDown(1.4);
        computedTotal += item.amount;
      });

      const tableBorderY2 = doc.y;
      doc.moveTo(60, tableBorderY2).lineTo(doc.page.width - 60, tableBorderY2).lineWidth(1).strokeColor('#C9A84C').stroke();
      doc.moveDown(0.8);

      // Ledger Totals
      const totalY = doc.y;
      doc.fillColor('#C9A84C').font('Helvetica-Bold').fontSize(12).text('TOTAL SERVICE COST', 70, totalY);
      doc.fillColor('#C9A84C').font('Helvetica-Bold').text(`Rs. ${computedTotal.toLocaleString()}`, doc.page.width - 160, totalY, { align: 'right', width: 100 });

      // Amount paid and Balance handling
      if (contact.billing) {
        const paidAmount = contact.billing.amountPaid || 0;
        doc.moveDown(1);
        const paidY = doc.y;
        doc.fillColor('#28a745').font('Helvetica-Bold').fontSize(11).text('AMOUNT SETTLED', 70, paidY);
        doc.fillColor('#28a745').text(`Rs. ${paidAmount.toLocaleString()}`, doc.page.width - 160, paidY, { align: 'right', width: 100 });

        doc.moveDown(1);
        const balanceY = doc.y;
        const balance = computedTotal - paidAmount;
        doc.fillColor(balance <= 0 ? '#28a745' : '#d32f2f').font('Helvetica-Bold').fontSize(11).text(balance <= 0 ? 'BALANCE REMAINING (FULLY PAID)' : 'BALANCE OUTSTANDING', 70, balanceY);
        doc.fillColor(balance <= 0 ? '#28a745' : '#d32f2f').text(`Rs. ${Math.max(0, balance).toLocaleString()}`, doc.page.width - 160, balanceY, { align: 'right', width: 100 });
      }

      // 9. Premium Footer
      const footerY = doc.page.height - 85;
      doc.moveTo(50, footerY).lineTo(doc.page.width - 50, footerY).lineWidth(0.5).strokeColor('rgba(201,168,76,0.2)').stroke();
      doc.fillColor('#C9A84C')
        .font('Times-Bold')
        .fontSize(11)
        .text('EXPERIENCE THE EXTRAORDINARY', 50, footerY + 12, { align: 'center', characterSpacing: 4.5 });
      
      doc.moveDown(0.2);
      doc.fillColor('#555577')
        .font('Helvetica')
        .fontSize(7)
        .text('THE VIBE CO. LUXURY ORCHESTRATION PLATFORM | CONFIDENTIAL FINANCIAL DOSSIER', { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  generatePDFBuffer
};
