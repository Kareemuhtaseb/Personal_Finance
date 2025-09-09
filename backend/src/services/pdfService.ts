import puppeteer from 'puppeteer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  dueDate: string;
  paidDate?: string;
  description?: string;
  project: {
    name: string;
    client: string;
  };
  invoiceWorkSessions: Array<{
    workSession: {
      id: string;
      startTime: string;
      endTime: string;
      description?: string;
      workHours: number;
    };
  }>;
  partialPayments: Array<{
    amount: number;
    paymentDate: string;
    description?: string;
  }>;
  user: {
    name: string;
    email: string;
  };
}

export class PDFInvoiceService {
  static async generateInvoicePDF(invoiceId: string): Promise<Buffer> {
    // Fetch invoice data with all related information
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        project: true,
        invoiceWorkSessions: {
          include: {
            workSession: true
          }
        },
        partialPayments: true,
        user: true
      }
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Calculate work hours for each session
    const workSessionsWithHours = invoice.invoiceWorkSessions.map(iws => {
      const session = iws.workSession;
      let workHours = 0;
      if (session.endTime) {
        const totalMinutes = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60));
        const workMinutes = totalMinutes - session.breakDuration;
        workHours = workMinutes / 60;
      }
      return {
        ...session,
        workHours: workHours.toFixed(2)
      };
    });

    // Calculate totals
    const totalWorkHours = workSessionsWithHours.reduce((sum, session) => sum + parseFloat(session.workHours), 0);
    const totalPaid = invoice.partialPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const remainingAmount = invoice.amount - totalPaid;

    const invoiceData: InvoiceData = {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount / 100,
      status: invoice.status,
      dueDate: invoice.dueDate.toISOString().split('T')[0],
      paidDate: invoice.paidDate?.toISOString().split('T')[0],
      description: invoice.description || '',
      project: {
        name: invoice.project.name,
        client: invoice.project.client
      },
      invoiceWorkSessions: workSessionsWithHours.map(session => ({
        workSession: {
          id: session.id,
          startTime: session.startTime.toISOString(),
          endTime: session.endTime?.toISOString() || '',
          description: session.description || '',
          workHours: parseFloat(session.workHours)
        }
      })),
      partialPayments: invoice.partialPayments.map(payment => ({
        amount: payment.amount / 100,
        paymentDate: payment.paymentDate.toISOString().split('T')[0],
        description: payment.description || ''
      })),
      user: {
        name: invoice.user.name,
        email: invoice.user.email
      }
    };

    // Generate HTML for the invoice
    const html = this.generateInvoiceHTML(invoiceData, totalWorkHours, totalPaid / 100, remainingAmount / 100);

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        }
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  private static generateInvoiceHTML(
    invoice: InvoiceData, 
    totalWorkHours: number, 
    totalPaid: number, 
    remainingAmount: number
  ): string {
    const currentDate = new Date().toLocaleDateString();
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 40px;
                padding-bottom: 20px;
                border-bottom: 2px solid #e0e0e0;
            }
            .invoice-title {
                font-size: 32px;
                font-weight: bold;
                color: #2563eb;
                margin: 0;
            }
            .invoice-number {
                font-size: 18px;
                color: #666;
                margin: 5px 0;
            }
            .invoice-details {
                text-align: right;
                font-size: 14px;
            }
            .client-info {
                margin-bottom: 30px;
                padding: 20px;
                background-color: #f8fafc;
                border-radius: 8px;
            }
            .client-info h3 {
                margin: 0 0 10px 0;
                color: #1e40af;
            }
            .work-sessions {
                margin-bottom: 30px;
            }
            .work-sessions h3 {
                color: #1e40af;
                margin-bottom: 15px;
            }
            .sessions-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            .sessions-table th,
            .sessions-table td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #e0e0e0;
            }
            .sessions-table th {
                background-color: #f1f5f9;
                font-weight: 600;
                color: #374151;
            }
            .sessions-table tr:hover {
                background-color: #f8fafc;
            }
            .totals {
                background-color: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
            }
            .totals h3 {
                margin: 0 0 15px 0;
                color: #1e40af;
            }
            .total-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 16px;
            }
            .total-row.final {
                font-weight: bold;
                font-size: 18px;
                color: #1e40af;
                border-top: 2px solid #e0e0e0;
                padding-top: 10px;
                margin-top: 10px;
            }
            .payment-status {
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
                text-align: center;
                font-weight: bold;
            }
            .status-paid {
                background-color: #dcfce7;
                color: #166534;
                border: 1px solid #bbf7d0;
            }
            .status-pending {
                background-color: #fef3c7;
                color: #92400e;
                border: 1px solid #fde68a;
            }
            .status-overdue {
                background-color: #fee2e2;
                color: #991b1b;
                border: 1px solid #fecaca;
            }
            .partial-payments {
                margin-bottom: 30px;
            }
            .partial-payments h3 {
                color: #1e40af;
                margin-bottom: 15px;
            }
            .payments-table {
                width: 100%;
                border-collapse: collapse;
            }
            .payments-table th,
            .payments-table td {
                padding: 10px;
                text-align: left;
                border-bottom: 1px solid #e0e0e0;
            }
            .payments-table th {
                background-color: #f1f5f9;
                font-weight: 600;
                color: #374151;
            }
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e0e0e0;
                text-align: center;
                color: #666;
                font-size: 12px;
            }
            .description {
                margin-bottom: 20px;
                padding: 15px;
                background-color: #f8fafc;
                border-radius: 8px;
                border-left: 4px solid #2563eb;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div>
                <h1 class="invoice-title">INVOICE</h1>
                <div class="invoice-number">${invoice.invoiceNumber}</div>
            </div>
            <div class="invoice-details">
                <div><strong>Date:</strong> ${currentDate}</div>
                <div><strong>Due Date:</strong> ${invoice.dueDate}</div>
                ${invoice.paidDate ? `<div><strong>Paid Date:</strong> ${invoice.paidDate}</div>` : ''}
            </div>
        </div>

        <div class="client-info">
            <h3>Bill To:</h3>
            <div><strong>${invoice.project.client}</strong></div>
            <div>Project: ${invoice.project.name}</div>
        </div>

        ${invoice.description ? `
        <div class="description">
            <strong>Description:</strong> ${invoice.description}
        </div>
        ` : ''}

        <div class="work-sessions">
            <h3>Work Sessions</h3>
            <table class="sessions-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Hours</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoice.invoiceWorkSessions.map(session => `
                    <tr>
                        <td>${new Date(session.workSession.startTime).toLocaleDateString()}</td>
                        <td>${new Date(session.workSession.startTime).toLocaleTimeString()}</td>
                        <td>${session.workSession.endTime ? new Date(session.workSession.endTime).toLocaleTimeString() : 'In Progress'}</td>
                        <td>${session.workSession.workHours}</td>
                        <td>${session.workSession.description || '-'}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="totals">
            <h3>Invoice Summary</h3>
            <div class="total-row">
                <span>Total Work Hours:</span>
                <span>${totalWorkHours.toFixed(2)} hours</span>
            </div>
            <div class="total-row">
                <span>Total Amount:</span>
                <span>$${invoice.amount.toFixed(2)}</span>
            </div>
            ${totalPaid > 0 ? `
            <div class="total-row">
                <span>Total Paid:</span>
                <span>$${totalPaid.toFixed(2)}</span>
            </div>
            <div class="total-row final">
                <span>Remaining Balance:</span>
                <span>$${remainingAmount.toFixed(2)}</span>
            </div>
            ` : `
            <div class="total-row final">
                <span>Amount Due:</span>
                <span>$${invoice.amount.toFixed(2)}</span>
            </div>
            `}
        </div>

        ${invoice.partialPayments.length > 0 ? `
        <div class="partial-payments">
            <h3>Payment History</h3>
            <table class="payments-table">
                <thead>
                    <tr>
                        <th>Payment Date</th>
                        <th>Amount</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoice.partialPayments.map(payment => `
                    <tr>
                        <td>${payment.paymentDate}</td>
                        <td>$${payment.amount.toFixed(2)}</td>
                        <td>${payment.description || '-'}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        <div class="payment-status ${invoice.status.toLowerCase()}">
            Status: ${invoice.status}
        </div>

        <div class="footer">
            <p>Generated by ${invoice.user.name} (${invoice.user.email})</p>
            <p>Generated on ${currentDate}</p>
        </div>
    </body>
    </html>
    `;
  }
}
