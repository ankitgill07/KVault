import type { InvoiceData } from "../api/paymentApi";

interface InvoiceTemplateProps {
  data: InvoiceData;
}

export function InvoiceTemplate({ data }: InvoiceTemplateProps) {
  return (
    <div className="invoice-container">
      <div className="header">
        <h1>INVOICE</h1>
        <div className="invoice-number">{data.invoiceNumber}</div>
        <div className={`status ${data.invoiceStatus.toLowerCase()}`}>
          {data.invoiceStatus}
        </div>
      </div>

      <div className="section">
        <h2>Student Information</h2>
        <div className="info-grid">
          <div>
            <div className="info-item">
              <div className="info-label">Name</div>
              <div className="info-value">{data.student.name}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Email</div>
              <div className="info-value">{data.student.email}</div>
            </div>
            {data.student.phone && (
              <div className="info-item">
                <div className="info-label">Phone</div>
                <div className="info-value">{data.student.phone}</div>
              </div>
            )}
          </div>
          <div>
            <div className="info-item">
              <div className="info-label">Invoice Date</div>
              <div className="info-value">
                {new Date(data.invoiceDate).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
            <div className="info-item">
              <div className="info-label">Enrollment Date</div>
              <div className="info-value">
                {new Date(data.enrollmentDate).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <h2>Course Details</h2>
        <div className="course-details">
          <div className="info-item">
            <div className="info-label">Course Name</div>
            <div className="info-value" style={{ fontSize: "16px", fontWeight: "bold" }}>
              {data.course.title}
            </div>
          </div>
          {data.course.description && (
            <div className="info-item">
              <div className="info-label">Description</div>
              <div className="info-value">{data.course.description}</div>
            </div>
          )}
          {data.instructor && (
            <div className="info-item">
              <div className="info-label">Instructor</div>
              <div className="info-value">{data.instructor.name}</div>
            </div>
          )}
        </div>
      </div>

      <div className="section">
        <h2>Payment Details</h2>
        <div className="payment-details">
          <div className="info-grid">
            <div>
              <div className="info-item">
                <div className="info-label">Payment Method</div>
                <div className="info-value" style={{ textTransform: "capitalize" }}>
                  {data.payment.method}
                </div>
              </div>
              <div className="info-item">
                <div className="info-label">Transaction ID</div>
                <div className="info-value" style={{ fontFamily: "monospace" }}>
                  {data.payment.transactionId || "N/A"}
                </div>
              </div>
              <div className="info-item">
                <div className="info-label">Payment Date</div>
                <div className="info-value">
                  {new Date(data.payment.paymentDate).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
            <div>
              <div className="info-item">
                <div className="info-label">Amount Paid</div>
                <div className="amount">₹{data.payment.amount.toFixed(2)}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Currency</div>
                <div className="info-value">{data.payment.currency}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Status</div>
                <div className="info-value" style={{ color: "#10b981", fontWeight: "bold" }}>
                  {data.payment.status}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer">
        <p>Thank you for your purchase!</p>
        <p>This is a computer-generated invoice and does not require a signature.</p>
        <p style={{ marginTop: "10px" }}>
          © {new Date().getFullYear()} KVault. All rights reserved.
        </p>
      </div>

      <style>{`
        .invoice-container {
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
          .invoice-container {
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
}