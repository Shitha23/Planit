import jsPDF from "jspdf";
import QRCode from "qrcode";

export const generateTicketPDF = async ({
  event,
  quantity,
  price,
  orderDate,
  ticketId,
}) => {
  const doc = new jsPDF();
  const qrText = `Ticket ID: ${ticketId}`;
  const qrDataURL = await QRCode.toDataURL(qrText);

  const logo = "/Images/logo-footer.png";
  const logoImage = new Image();
  logoImage.src = logo;

  return new Promise((resolve) => {
    logoImage.onload = () => {
      doc.addImage(logoImage, "PNG", 150, 10, 40, 20);

      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text("Plan It Event Ticket", 20, 30);

      doc.setFontSize(12);
      doc.text(`Event: ${event.title}`, 20, 50);
      doc.text(
        `Date: ${new Date(event.instanceDate).toLocaleDateString()}`,
        20,
        60
      );
      console.log(event);
      doc.text(`Ticket ID: ${ticketId}`, 20, 80);
      doc.text(`Quantity: ${quantity}`, 20, 90);
      doc.text(`Total Paid: $${(quantity * price).toFixed(2)}`, 20, 100);
      doc.text(
        `Order Date: ${new Date(orderDate).toLocaleDateString()}`,
        20,
        110
      );

      doc.text("Scan QR Code on Entry", 20, 130);
      doc.addImage(qrDataURL, "PNG", 20, 135, 50, 50);

      const pdfBlob = doc.output("blob");
      resolve(pdfBlob);
    };
  });
};
