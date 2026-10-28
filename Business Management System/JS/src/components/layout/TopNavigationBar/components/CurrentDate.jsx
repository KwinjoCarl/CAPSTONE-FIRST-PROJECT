import { useEffect, useState } from 'react';
import IconifyIcon from '@/components/wrapper/IconifyIcon';

const CurrentDate = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatted = now.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="topbar-item d-none d-md-flex">
      <span className="topbar-button d-flex align-items-center gap-2 text-muted">
        <IconifyIcon icon="solar:calendar-outline" width={18} height={18} className="align-middle" />
        <span className="fw-semibold">{formatted}</span>
      </span>
    </div>
  );
};

export default CurrentDate;
