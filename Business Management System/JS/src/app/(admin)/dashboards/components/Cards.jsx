import IconifyIcon from '@/components/wrapper/IconifyIcon';
import { getDashboardStats } from '@/services/api';
import { getBusinessSettings } from '@/helpers/settings';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardBody, Col, Row, Spinner } from 'react-bootstrap';

const formatMoney = (value) => {
  const { currency } = getBusinessSettings();
  const symbolMap = { USD: '$', EUR: '€', GBP: '£', ZWL: 'Z$', ZAR: 'R', INR: '₹' };
  const symbol = symbolMap[currency] || (currency ? `${currency} ` : '$');
  const num = Number(value || 0);
  if (Math.abs(num) >= 1000) return `${symbol}${(num / 1000).toFixed(1)}k`;
  return `${symbol}${num.toFixed(2)}`;
};

const StatCard = ({ count, icon, series, title }) => {
  const salesChart = {
    chart: {
      type: 'area',
      height: 50,
      sparkline: {
        enabled: true
      }
    },
    series: [{
      data: series
    }],
    stroke: {
      width: 2,
      curve: 'smooth'
    },
    markers: {
      size: 0
    },
    colors: ['#7e67fe'],
    tooltip: {
      fixed: {
        enabled: false
      },
      x: {
        show: false
      },
      y: {
        title: {
          formatter: function () {
            return '';
          }
        }
      },
      marker: {
        show: false
      }
    },
    fill: {
      opacity: [1],
      type: ['gradient'],
      gradient: {
        type: 'vertical',
        inverseColors: false,
        opacityFrom: 0.5,
        opacityTo: 0,
        stops: [0, 100]
      }
    }
  };
  return <Card>
      <CardBody>
        <Row>
          <Col xs={6}>
            <p className="text-muted mb-0 text-truncate">{title}</p>
            <h3 className="text-dark mt-2 mb-0">{count}</h3>
          </Col>
          <Col xs={6}>
            <div className="ms-auto avatar-md bg-soft-primary rounded">
              <IconifyIcon style={{
              padding: '12px'
            }} icon={icon} className="fs-32 avatar-title text-primary" />
            </div>
          </Col>
        </Row>
      </CardBody>
      <ReactApexChart options={salesChart} series={salesChart.series} height={50} type="area" />
    </Card>;
};

const Cards = ({ dateRange }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const params = dateRange ? { start_date: dateRange.start, end_date: dateRange.end } : {};
        const { data } = await getDashboardStats(params);
        setStats(data);
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [dateRange]);

  if (loading && !stats) {
    return (
      <div className="d-flex justify-content-center py-4">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const trendValues = (stats?.sales_trend || []).map((t) => Number(t.total));

  const cardsData = [{
    title: 'Total Sales',
    count: formatMoney(stats?.total_sales),
    icon: 'solar:cart-5-broken',
    series: trendValues.length > 1 ? trendValues : [0, 0]
  }, {
    title: 'Total Purchases',
    count: formatMoney(stats?.total_purchases),
    icon: 'solar:bag-4-broken',
    series: trendValues.length > 1 ? trendValues : [0, 0]
  }, {
    title: 'Total Expenses',
    count: formatMoney(stats?.total_expenses),
    icon: 'solar:wallet-money-broken',
    series: trendValues.length > 1 ? trendValues : [0, 0]
  }, {
    title: 'Net Profit',
    count: formatMoney(stats?.net_profit),
    icon: 'solar:graph-up-broken',
    series: trendValues.length > 1 ? trendValues : [0, 0]
  }];

  return <>
      <Row>
        {cardsData.map((item, idx) => <Col md={6} xl={3} key={idx}>
            <StatCard {...item} />
          </Col>)}
      </Row>
    </>;
};
export default Cards;
