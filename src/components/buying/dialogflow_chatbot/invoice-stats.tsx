// components/invoice-stats.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, PieChart } from "@/components/ui/charts";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function InvoiceStats({ data }: { data: any }) {
  if (!data || !data.invoices) return null;

  // Préparer les données pour les graphiques
  const statusCounts = data.invoices.reduce((acc: any, invoice: any) => {
    acc[invoice.status] = (acc[invoice.status] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        label: "Factures par statut",
        data: Object.values(statusCounts),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
        ],
      }
    ]
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Répartition par statut</CardTitle>
        </CardHeader>
        <CardContent>
          <PieChart data={chartData} />
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Montants en retard</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart 
            data={{
              labels: data.invoices.map((i: any) => i.invoiceNumber),
              datasets: [{
                label: "Montant restant",
                data: data.invoices.map((i: any) => i.remainingAmount),
                backgroundColor: 'rgba(75, 192, 192, 0.7)',
              }]
            }} 
          />
        </CardContent>
      </Card>

      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Détails des factures</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Montant total</TableHead>
                <TableHead>Montant payé</TableHead>
                <TableHead>Reste</TableHead>
                <TableHead>Date échéance</TableHead>
                <TableHead>Jours de retard</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.invoices.map((invoice: any) => (
                <TableRow key={invoice.invoiceNumber}>
                  <TableCell>{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.amount} {invoice.currency}</TableCell>
                  <TableCell>{invoice.amountPaid} {invoice.currency}</TableCell>
                  <TableCell>{invoice.remainingAmount} {invoice.currency}</TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>{invoice.daysLate}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      invoice.status === 'unpaid' ? 'bg-red-100 text-red-800' :
                      invoice.status === 'partially_paid' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}