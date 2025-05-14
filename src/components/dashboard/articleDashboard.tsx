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
  CalendarIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  PackageIcon,
  DollarSignIcon,
  AlertCircleIcon,
  GaugeIcon,
  TagIcon,
  AlertTriangleIcon,
  StarIcon
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { format, subYears } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Palette de couleurs cohérente
const COLORS = ['#0f172a', '#1e293b', '#334155', '#475569', '#64748b', '#94a3b8'];
const STATUS_COLORS: Record<string, string> = {
  'Brouillon': '#94a3b8',
  'Actif': '#0f172a',
  'Inactif': '#475569',
  'Archivé': '#64748b',
  'Rupture': '#ef4444',
  'En revue': '#f59e0b',
  'Supprimé': '#64748b'
};

const translateStatus = (status: string): string => {
  const statusTranslations: Record<string, string> = {
    'draft': 'Brouillon',
    'active': 'Actif',
    'inactive': 'Inactif',
    'archived': 'Archivé',
    'out_of_stock': 'Rupture',
    'pending_review': 'En revue',
    'deleted': 'Supprimé'
  };
  return statusTranslations[status] || status;
};

interface SimpleStats {
  totalArticles: number;
  totalStockValue: number;
  outOfStockCount: number;
}

interface StockAlerts {
  outOfStock: Array<{
    reference: string;
    title?: string;
    daysOutOfStock: number;
  }>;
  lowStock: Array<{
    reference: string;
    title?: string;
    remainingStock: number;
  }>;
}

interface StatusOverview {
  counts: Record<string, number>;
  examples: Record<string, Array<{ reference: string; title?: string }>>;
  activeCount?: number;
}

interface QualityScores {
  scores: Array<{
    id: number;
    reference: string;
    title?: string;
    score: number;
    missingFields: string[];
  }>;
  averageScore?: number;
}

interface SuspiciousArticles {
  zeroPrice: Array<{
    id: number;
    reference: string;
    title?: string;
  }>;
  highStock: Array<{
    id: number;
    reference: string;
    title?: string;
    quantity: number;
  }>;
}

interface PriceTrends {
  oldArticles: {
    count: number;
    averagePrice: number;
  };
  newArticles: {
    count: number;
    averagePrice: number;
  };
}

interface StockHealth {
  activePercentage: number;
  status: 'poor' | 'medium' | 'good';
  details: Record<string, number>;
  change?: number;
}

interface SimplifiedStockStatus {
  healthy: number;
  warning: number;
  danger: number;
  inactive: number;
}

interface TopValuedArticle {
  reference: string;
  title: string;
  totalValue: number;
}

interface AveragePriceByStatus {
  [status: string]: number;
}

export const ArticleDashboard = ({ firmId }: { firmId: number }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subYears(new Date(), 1),
    to: new Date()
  });
  const [stats, setStats] = useState<{
    simpleStats?: SimpleStats;
    stockAlerts?: StockAlerts;
    statusOverview?: StatusOverview;
    qualityScores?: QualityScores;
    suspiciousArticles?: SuspiciousArticles;
    priceTrends?: PriceTrends;
    stockHealth?: StockHealth;
    categoryDistribution?: {
      categories: any[];
      totalCategories: number;
    };
    simplifiedStock?: SimplifiedStockStatus;
    topValuedArticles?: TopValuedArticle[];
    averagePriceByStatus?: AveragePriceByStatus;
  }>({});

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
          categoryDistribution: {
            categories: [],
            totalCategories: 0
          },
          simplifiedStock,
          topValuedArticles,
          averagePriceByStatus
        });
      } catch (err) {
        console.error('Failed to load article data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [firmId, dateRange]);

  const currencyFormatter = (value: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value || 0);

  const percentFormatter = (value: number) => 
    `${(value * 100).toFixed(1)}%`;

  const prepareChartData = () => {
    const statusData = stats.statusOverview?.counts
      ? Object.entries(stats.statusOverview.counts)
          .filter(([_, value]) => value > 0)
          .map(([name, value]) => ({
            name: translateStatus(name),
            value,
            color: STATUS_COLORS[translateStatus(name)] || COLORS[0]
          }))
      : [];

    const stockStatusData = stats.simplifiedStock
      ? [
          { name: 'Sain', value: stats.simplifiedStock.healthy, color: COLORS[1] },
          { name: 'Avertissement', value: stats.simplifiedStock.warning, color: '#f59e0b' },
          { name: 'Danger', value: stats.simplifiedStock.danger, color: '#ef4444' },
          { name: 'Inactif', value: stats.simplifiedStock.inactive, color: COLORS[3] }
        ]
      : [];

    const averagePriceData = stats.averagePriceByStatus
      ? Object.entries(stats.averagePriceByStatus).map(([status, price]) => ({
          status: translateStatus(status),
          price,
          color: STATUS_COLORS[translateStatus(status)] || COLORS[0]
        }))
      : [];

    return {
      statusData,
      stockStatusData,
      averagePriceData
    };
  };

  const { 
    statusData, 
    stockStatusData,
    averagePriceData
  } = prepareChartData();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-100px)]">
      <div className="space-y-4 p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord des articles</h1>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className="w-[260px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Sélectionner une période</span>
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
            <Badge variant="outline" className="px-3 py-1 bg-gray-50 text-gray-600">
              {dateRange?.from ? format(dateRange.from, 'dd MMM yyyy') : ''} - {dateRange?.to ? format(dateRange.to, 'dd MMM yyyy') : ''}
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              title="Total articles"
              value={stats.simpleStats?.totalArticles || 0}
              icon={<PackageIcon className="h-4 w-4 text-gray-600" />}
              onClick={() => {
                window.location.href = '/article/article-Lists';
              }}
            />
            <SummaryCard
              title="Alertes actives"
              value={
                (stats.stockAlerts?.outOfStock?.length || 0) + 
                (stats.stockAlerts?.lowStock?.length || 0) +
                (stats.suspiciousArticles?.zeroPrice?.length || 0) +
                (stats.suspiciousArticles?.highStock?.length || 0)
              }
              icon={<AlertTriangleIcon className="h-4 w-4 text-yellow-600" />}
            />
            <SummaryCard
              title="En rupture"
              value={stats.simpleStats?.outOfStockCount || 0}
              icon={<AlertCircleIcon className="h-4 w-4 text-red-600" />}
            />
            <SummaryCard
              title="Santé stock"
              value={(stats.stockHealth?.activePercentage || 0) / 100}
              change={stats.stockHealth?.change}
              icon={<GaugeIcon className="h-4 w-4 text-blue-600" />}
              formatter={percentFormatter}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">Répartition par statut</CardTitle>
                <CardDescription className="text-gray-500">Distribution des articles par statut</CardDescription>
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
                        labelLine={false}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} articles`, 'Quantité']}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.375rem',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          padding: '0.5rem'
                        }}
                        itemStyle={{
                          color: '#1f2937',
                          fontSize: '0.875rem'
                        }}
                      />
                      <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        wrapperStyle={{
                          paddingLeft: '20px'
                        }}
                        formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400">Aucune donnée de statut disponible</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
  <CardHeader>
    <CardTitle className="text-gray-900">État du stock simplifié</CardTitle>
    <CardDescription className="text-gray-500">
      Répartition des articles par état de stock

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#4b5563] mr-2"></div>
          <span>Sain: Stock optimal</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#d97706] mr-2"></div>
          <span>Avertissement: Niveau bas</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#7f1d1d] mr-2"></div>
          <span>Danger: Rupture</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#9ca3af] mr-2"></div>
          <span>Inactif: Non vendable</span>
        </div>
      </div>
    </CardDescription>
  </CardHeader>

  <CardContent className="h-80">
    {stockStatusData.length > 0 ? (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={stockStatusData.map(item => ({
            ...item,
            color:
              item.name === 'Sain' ? '#4b5563' :
              item.name === 'Avertissement' ? '#d97706' :
              item.name === 'Danger' ? '#7f1d1d' :
              '#9ca3af'
          }))}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" stroke="#6b7280" />
          <YAxis
            dataKey="name"
            type="category"
            width={100}
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value) => [`${value} articles`, 'Quantité']}
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              padding: '0.5rem'
            }}
          />
          <Bar dataKey="value" name="Articles" radius={[0, 4, 4, 0]}>
            {stockStatusData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    ) : (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Aucune donnée d'état de stock disponible</p>
      </div>
    )}
  </CardContent>
</Card>

   
          </div>

          <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Articles les plus valorisés</CardTitle>
              <CardDescription className="text-gray-500">Top 5 des articles avec la plus grande valeur en stock</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.topValuedArticles?.length ? (
                <div className="space-y-3">
                  {stats.topValuedArticles.map((article, index) => (
                    <div 
                      key={article.reference} 
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`flex-shrink-0 p-3 rounded-full ${
                          index === 0 ? 'bg-yellow-100 text-yellow-600' : 
                          index === 1 ? 'bg-gray-100 text-gray-600' : 
                          index === 2 ? 'bg-amber-100 text-amber-600' : 'bg-gray-50 text-gray-500'
                        }`}>
                          <StarIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{article.reference}</p>
                          <p className="text-sm text-gray-500">{article.title}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{currencyFormatter(article.totalValue)}</p>
                        <p className="text-xs text-gray-500">#{index + 1} en valeur</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <p className="text-gray-400">Aucun article valorisé disponible</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">Alertes stock</CardTitle>
                <CardDescription className="text-gray-500">Articles en rupture ou stock faible</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-red-600 flex items-center gap-2">
                      <AlertCircleIcon className="h-4 w-4" />
                      En rupture ({stats.stockAlerts?.outOfStock?.length || 0})
                    </h3>
                    <div className="mt-2 space-y-2">
                      {stats.stockAlerts?.outOfStock?.slice(0, 3).map((item) => (
                        <div 
                          key={item.reference} 
                          className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{item.reference}</p>
                            <p className="text-sm text-gray-500">
                              {item.daysOutOfStock} jours sans stock
                            </p>
                          </div>
                          <Badge variant="destructive" className="bg-red-100 text-red-800">Rupture</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-gray-200" />

                  <div>
                    <h3 className="font-medium text-yellow-600 flex items-center gap-2">
                      <AlertCircleIcon className="h-4 w-4" />
                      Stock faible ({stats.stockAlerts?.lowStock?.length || 0})
                    </h3>
                    <div className="mt-2 space-y-2">
                      {stats.stockAlerts?.lowStock?.slice(0, 3).map((item) => (
                        <div 
                          key={item.reference} 
                          className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{item.reference}</p>
                            <p className="text-sm text-gray-500">
                              {item.remainingStock} unités restantes
                            </p>
                          </div>
                          <Badge variant="warning" className="bg-yellow-100 text-yellow-800">Faible</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">Articles suspects</CardTitle>
                <CardDescription className="text-gray-500">Anomalies détectées</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-red-600 flex items-center gap-2">
                      <AlertCircleIcon className="h-4 w-4" />
                      Prix à 0 ({stats.suspiciousArticles?.zeroPrice?.length || 0})
                    </h3>
                    <div className="mt-2 space-y-2">
                      {stats.suspiciousArticles?.zeroPrice?.slice(0, 3).map((item) => (
                        <div 
                          key={item.id} 
                          className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <p className="font-medium text-gray-900">{item.reference}</p>
                          <Badge variant="destructive" className="bg-red-100 text-red-800">Erreur</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-gray-200" />

                  <div>
                    <h3 className="font-medium text-yellow-600 flex items-center gap-2">
                      <AlertCircleIcon className="h-4 w-4" />
                      Stock élevé ({stats.suspiciousArticles?.highStock?.length || 0})
                    </h3>
                    <div className="mt-2 space-y-2">
                      {stats.suspiciousArticles?.highStock?.slice(0, 3).map((item) => (
                        <div 
                          key={item.id} 
                          className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{item.reference}</p>
                            <p className="text-sm text-gray-500">
                              {item.quantity} unités
                            </p>
                          </div>
                          <Badge variant="warning" className="bg-yellow-100 text-yellow-800">Anomalie</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
  onClick
}: {
  title: string;
  value: number;
  change?: number;
  icon?: React.ReactNode;
  formatter?: (val: any) => string;
  onClick?: () => void;
}) => {
  const isPositive = change && change >= 0;

  return (
    <Card 
      onClick={onClick} 
      className={`bg-white rounded-lg border border-gray-200 shadow-sm ${onClick ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <div className="p-2 rounded-full bg-gray-100">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{formatter(value)}</div>
        {change !== undefined && (
          <p className={`text-xs flex items-center mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? (
              <ArrowUpIcon className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDownIcon className="h-3 w-3 mr-1" />
            )}
            {Math.abs(change)}% vs période précédente
          </p>
        )}
      </CardContent>
    </Card>
  );
};