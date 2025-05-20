import { useSwipeable } from 'react-swipeable';
import React, { useEffect, useState } from 'react';
import { article } from '@/api';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Package,
  DollarSign,
  AlertCircle,
  Gauge,
  Tag,
  AlertTriangle,
  Star
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { format, subYears } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Spinner } from '@/components/common/Spinner';
import { useTranslation } from 'react-i18next';

const COLORS = ['#0f172a', '#1e293b', '#334155', '#475569', '#64748b', '#94a3b8'];
const STATUS_COLORS: Record<string, string> = {
  'draft': '#94a3b8',
  'active': '#10b981',
  'inactive': '#64748b',
  'archived': '#8b5cf6',
  'out_of_stock': '#ef4444',
  'pending_review': '#f59e0b'
};

export const ArticleDashboard = ({ firmId }: { firmId: number }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subYears(new Date(), 1),
    to: new Date()
  });
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          simpleStats,
          stockAlerts,
          statusOverview,
          qualityScores,
          suspiciousArticles,
          priceTrends,
          stockHealth,
          simplifiedStock,
          topValuedArticles,
          averagePriceByStatus
        ] = await Promise.all([
          article.getSimpleStats(),
          article.getStockAlerts(),
          article.getStatusOverview(),
          article.getQualityScores(),
          article.getSuspiciousArticles(),
          article.getPriceTrends(),
          article.getStockHealth(),
          article.getSimplifiedStockStatus(),
          article.getTopValuedArticles(),
          article.getAveragePriceByStatus()
        ]);

        setStats({
          simpleStats,
          stockAlerts,
          statusOverview,
          qualityScores,
          suspiciousArticles,
          priceTrends,
          stockHealth,
          simplifiedStock,
          topValuedArticles,
          averagePriceByStatus
        });
      } catch (err) {
        console.error('Failed to load article data:', err);
        setError(t('Erreur lors du chargement des données'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [firmId, dateRange, t]);

  const currencyFormatter = (value: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value || 0);

  const percentFormatter = (value: number) => 
    `${(value * 100).toFixed(1)}%`;

  const prepareChartData = () => {
    const statusData = stats.statusOverview?.counts
      ? Object.entries(stats.statusOverview.counts).map(([name, value]) => ({
          name: t(`article.status.${name}`),
          value,
          color: STATUS_COLORS[name] || COLORS[0]
        }))
      : [];

    const stockStatusData = stats.simplifiedStock
      ? [
          { name: t('Sain'), value: stats.simplifiedStock.healthy, color: '#10b981' },
          { name: t('Avertissement'), value: stats.simplifiedStock.warning, color: '#f59e0b' },
          { name: t('Danger'), value: stats.simplifiedStock.danger, color: '#ef4444' },
          { name: t('Inactif'), value: stats.simplifiedStock.inactive, color: '#9ca3af' }
        ]
      : [];

    return { statusData, stockStatusData };
  };

  const { statusData, stockStatusData } = prepareChartData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="medium" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="p-4 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="h-8 px-4 text-sm"
          >
            {t('Réessayer')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-180px)]">
      <div className="container py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t('Tableau de bord des articles')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('Vue d\'ensemble de votre inventaire')}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-8 px-4 text-sm"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                        {format(dateRange.to, "dd/MM/yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy")
                    )
                  ) : (
                    <span>{t('Sélectionner une période')}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            title={t('Total articles')}
            value={stats.simpleStats?.totalArticles || 0}
            icon={<Package className="h-4 w-4" />}
          />
          <SummaryCard
            title={t('Alertes actives')}
            value={
              (stats.stockAlerts?.outOfStock?.length || 0) + 
              (stats.stockAlerts?.lowStock?.length || 0)
            }
            icon={<AlertTriangle className="h-4 w-4 text-yellow-600" />}
          />
          <SummaryCard
            title={t('En rupture')}
            value={stats.simpleStats?.outOfStockCount || 0}
            icon={<AlertCircle className="h-4 w-4 text-red-600" />}
          />
          <SummaryCard
            title={t('Santé stock')}
            value={(stats.stockHealth?.activePercentage || 0) / 100}
            change={stats.stockHealth?.change}
            icon={<Gauge className="h-4 w-4 text-blue-600" />}
            formatter={percentFormatter}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('Répartition par statut')}</CardTitle>
              <CardDescription>
                {t('Distribution des articles par statut')}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} articles`, 'Quantité']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">
                    {t('Aucune donnée disponible')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('État du stock')}</CardTitle>
              <CardDescription>
                {t('Répartition des articles par état de stock')}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {stockStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stockStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" name="Articles">
                      {stockStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">
                    {t('Aucune donnée disponible')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('Alertes stock')}</CardTitle>
              <CardDescription>
                {t('Articles en rupture ou stock faible')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {t('En rupture')} ({stats.stockAlerts?.outOfStock?.length || 0})
                </h3>
                <div className="mt-2 space-y-2">
                  {stats.stockAlerts?.outOfStock?.slice(0, 3).map((item: any) => (
                    <div key={item.reference} className="p-3 border rounded-lg">
                      <p className="font-medium">{item.reference}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.daysOutOfStock} {t('jours sans stock')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="font-medium flex items-center gap-2 text-yellow-600">
                  <AlertCircle className="h-4 w-4" />
                  {t('Stock faible')} ({stats.stockAlerts?.lowStock?.length || 0})
                </h3>
                <div className="mt-2 space-y-2">
                  {stats.stockAlerts?.lowStock?.slice(0, 3).map((item: any) => (
                    <div key={item.reference} className="p-3 border rounded-lg">
                      <p className="font-medium">{item.reference}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.remainingStock} {t('unités restantes')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('Articles les plus valorisés')}</CardTitle>
              <CardDescription>
                {t('Top 5 des articles avec la plus grande valeur en stock')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.topValuedArticles?.slice(0, 5).map((article: any, index: number) => (
                <div key={article.reference} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{article.reference}</p>
                      <p className="text-sm text-muted-foreground">{article.title}</p>
                    </div>
                    <Badge variant="outline">
                      {currencyFormatter(article.totalValue)}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
};

const SummaryCard = ({
  title,
  value,
  change,
  icon,
  formatter = (val: any) => val,
}: {
  title: string;
  value: number;
  change?: number;
  icon?: React.ReactNode;
  formatter?: (val: any) => string;
}) => {
  const isPositive = change && change >= 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatter(value)}</div>
        {change !== undefined && (
          <p className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{change}% vs période précédente
          </p>
        )}
      </CardContent>
    </Card>
  );
};