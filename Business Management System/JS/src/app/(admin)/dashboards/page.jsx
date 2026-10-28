import Footer from '@/components/layout/Footer';
import Cards from './components/Cards';
import Chart from './components/Chart';
import User from './components/User';
import PageTitle from '@/components/PageTitle';
import DateFilter, { DATE_PRESETS } from './components/DateFilter';
import { useState } from 'react';

const page = () => {
  const [filterKey, setFilterKey] = useState('today');
  const [dateRange, setDateRange] = useState(DATE_PRESETS[0].getRange());

  const handleFilterChange = (key, range) => {
    setFilterKey(key);
    setDateRange(range);
  };

  return <>
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <PageTitle subName="Darkone" title="Dashboard" />
        <DateFilter value={filterKey} onChange={handleFilterChange} />
      </div>
      <Cards dateRange={dateRange} />
      <Chart />
      <User />
      <Footer />
    </>;
};
export default page;
