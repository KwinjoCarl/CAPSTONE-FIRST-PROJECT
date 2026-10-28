import IconifyIcon from '@/components/wrapper/IconifyIcon';
import { Dropdown } from 'react-bootstrap';

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const DATE_PRESETS = [
  {
    key: 'today',
    label: 'Today',
    getRange: () => {
      const now = new Date();
      return { start: formatDate(now), end: formatDate(now) };
    }
  },
  {
    key: 'yesterday',
    label: 'Yesterday',
    getRange: () => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return { start: formatDate(d), end: formatDate(d) };
    }
  },
  {
    key: 'last_7_days',
    label: 'Last 7 Days',
    getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 6);
      return { start: formatDate(start), end: formatDate(end) };
    }
  },
  {
    key: 'last_30_days',
    label: 'Last 30 Days',
    getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 29);
      return { start: formatDate(start), end: formatDate(end) };
    }
  },
  {
    key: 'this_month',
    label: 'This Month',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start: formatDate(start), end: formatDate(end) };
    }
  },
  {
    key: 'last_month',
    label: 'Last Month',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: formatDate(start), end: formatDate(end) };
    }
  },
  {
    key: 'this_month_last_year',
    label: 'This month last year',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      const end = new Date(now.getFullYear() - 1, now.getMonth() + 1, 0);
      return { start: formatDate(start), end: formatDate(end) };
    }
  },
  {
    key: 'this_year',
    label: 'This Year',
    getRange: () => {
      const now = new Date();
      return {
        start: formatDate(new Date(now.getFullYear(), 0, 1)),
        end: formatDate(new Date(now.getFullYear(), 11, 31))
      };
    }
  },
  {
    key: 'last_year',
    label: 'Last Year',
    getRange: () => {
      const now = new Date();
      return {
        start: formatDate(new Date(now.getFullYear() - 1, 0, 1)),
        end: formatDate(new Date(now.getFullYear() - 1, 11, 31))
      };
    }
  }
];

const DateFilter = ({ value, onChange }) => {
  const selected = DATE_PRESETS.find((p) => p.key === value) || DATE_PRESETS[0];
  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="light" className="border d-flex align-items-center gap-2">
        <IconifyIcon icon="solar:calendar-outline" width={18} height={18} />
        <span>Filter by date{value ? `: ${selected.label}` : ''}</span>
        <IconifyIcon icon="bx:chevron-down" width={16} height={16} />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {DATE_PRESETS.map((preset) => (
          <Dropdown.Item
            key={preset.key}
            active={preset.key === value}
            onClick={() => onChange(preset.key, preset.getRange())}
          >
            {preset.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default DateFilter;
