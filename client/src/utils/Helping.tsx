import { Star } from "lucide-react";
import type { InvoiceData } from "../api/paymentApi";

export const renderStars = (rating : number) => {
  const ratings = Math.min(5, Math.max(0, rating || 0));
  const fullStars = Math.floor(rating);
  const hasHalfStar = ratings - fullStars >= 0.5;

  return Array.from({ length: 5 }, (_, i) => {
    if (i < fullStars) {
      return <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />;
    }

    if (i === fullStars && hasHalfStar) {
      return (
        <span key={i} className="relative inline-block w-4 h-4">
          <Star className="absolute inset-0 w-4 h-4 text-gray-300" />
          <span className="absolute inset-0 w-1/2 overflow-hidden">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </span>
        </span>
      );
    }

    return <Star key={i} className="w-4 h-4 text-gray-300" />;
  });
};

 export const generateInvoiceHTML = (data: InvoiceData): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${data.invoiceNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 32px;
          }
          .invoice-number {
            font-size: 18px;
            color: #666;
            margin-top: 10px;
          }
          .status {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            margin-top: 10px;
          }
          .status.pending {
            background: #f59e0b;
          }
          .status.refunded {
            background: #6b7280;
          }
          .section {
            margin-bottom: 30px;
          }
          .section h2 {
            color: #2563eb;
            font-size: 18px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 8px;
            margin-bottom: 15px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          .info-item {
            margin-bottom: 10px;
          }
          .info-label {
            font-weight: bold;
            color: #666;
            font-size: 12px;
            text-transform: uppercase;
          }
          .info-value {
            color: #333;
            font-size: 14px;
            margin-top: 3px;
          }
          .course-details {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
          }
          .payment-details {
            background: #f0fdf4;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #10b981;
          }
          .amount {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INVOICE</h1>
          <div class="invoice-number">${data.invoiceNumber}</div>
          <div class="status ${data.invoiceStatus.toLowerCase()}">${data.invoiceStatus}</div>
        </div>

        <div class="section">
          <h2>Student Information</h2>
          <div class="info-grid">
            <div>
              <div class="info-item">
                <div class="info-label">Name</div>
                <div class="info-value">${data.student.name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${data.student.email}</div>
              </div>
              ${data.student.phone ? `
              <div class="info-item">
                <div class="info-label">Phone</div>
                <div class="info-value">${data.student.phone}</div>
              </div>
              ` : ''}
            </div>
            <div>
              <div class="info-item">
                <div class="info-label">Invoice Date</div>
                <div class="info-value">${new Date(data.invoiceDate).toLocaleDateString("en-IN", { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Enrollment Date</div>
                <div class="info-value">${new Date(data.enrollmentDate).toLocaleDateString("en-IN", { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Course Details</h2>
          <div class="course-details">
            <div class="info-item">
              <div class="info-label">Course Name</div>
              <div class="info-value" style="font-size: 16px; font-weight: bold;">${data.course.title}</div>
            </div>
            ${data.course.description ? `
            <div class="info-item">
              <div class="info-label">Description</div>
              <div class="info-value">${data.course.description}</div>
            </div>
            ` : ''}
            ${data.instructor ? `
            <div class="info-item">
              <div class="info-label">Instructor</div>
              <div class="info-value">${data.instructor.name}</div>
            </div>
            ` : ''}
          </div>
        </div>

        <div class="section">
          <h2>Payment Details</h2>
          <div class="payment-details">
            <div class="info-grid">
              <div>
                <div class="info-item">
                  <div class="info-label">Payment Method</div>
                  <div class="info-value" style="text-transform: capitalize;">${data.payment.method}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Transaction ID</div>
                  <div class="info-value" style="font-family: monospace;">${data.payment.transactionId || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Payment Date</div>
                  <div class="info-value">${new Date(data.payment.paymentDate).toLocaleDateString("en-IN", { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
              </div>
              <div>
                <div class="info-item">
                  <div class="info-label">Amount Paid</div>
                  <div class="amount">₹${data.payment.amount.toFixed(2)}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Currency</div>
                  <div class="info-value">${data.payment.currency}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Status</div>
                  <div class="info-value" style="color: #10b981; font-weight: bold;">${data.payment.status}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your purchase!</p>
          <p>This is a computer-generated invoice and does not require a signature.</p>
          <p style="margin-top: 10px;">© ${new Date().getFullYear()} KVault. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  };