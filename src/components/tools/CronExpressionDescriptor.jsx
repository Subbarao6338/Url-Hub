import React, { useState, useEffect } from 'react';

// Very basic cron descriptor for offline use
const describeCron = (cron) => {
    try {
        const parts = cron.trim().split(/\s+/);
        if (parts.length < 5) return "Invalid cron expression";

        const [min, hour, dom, month, dow] = parts;

        let description = "At ";

        if (min === '*' && hour === '*') {
            description += "every minute";
        } else if (min.startsWith('*/')) {
            const step = min.split('/')[1];
            description += `every ${step} minutes`;
            if (hour !== '*') description += ` of hour ${hour}`;
        } else if (min === '*') {
            description += `every minute of hour ${hour}`;
        } else if (hour === '*') {
            description += `minute ${min} of every hour`;
        } else {
            description += `${hour.padStart(2, '0')}:${min.padStart(2, '0')}`;
        }

        if (dom !== '*' || month !== '*' || dow !== '*') {
            description += ", ";
            if (dom !== '*') description += `on day of month ${dom} `;
            if (month !== '*') description += `in month ${month} `;
            if (dow !== '*') {
                const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                description += `on ${dow.split(',').map(d => days[parseInt(d)] || d).join(', ')}`;
            }
        }

        return description;
    } catch (e) {
        return "Error parsing cron expression";
    }
};

const CronExpressionDescriptor = ({ onResultChange }) => {
  const [cron, setCron] = useState('*/5 * * * *');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const desc = describeCron(cron);
    setDescription(desc);
    onResultChange({
      text: `${cron}\n${desc}`,
      filename: 'cron_description.txt'
    });
  }, [cron]);

  const presets = [
    { name: 'Every 5 mins', val: '*/5 * * * *' },
    { name: 'Every hour', val: '0 * * * *' },
    { name: 'Daily at midnight', val: '0 0 * * *' },
    { name: 'Weekly (Sun)', val: '0 0 * * 0' },
    { name: 'Monthly (1st)', val: '0 0 1 * *' },
  ];

  return (
    <div className="tool-form">
      <div className="form-group">
        <label>Cron Expression</label>
        <input
          type="text"
          value={cron}
          onChange={(e) => setCron(e.target.value)}
          placeholder="* * * * *"
          style={{ fontSize: '1.2rem', textAlign: 'center', fontWeight: 'bold' }}
        />
      </div>
      <div className="pill-group" style={{ marginBottom: '1.5rem', justifyContent: 'center' }}>
        {presets.map(p => (
            <button key={p.name} className="pill" onClick={() => setCron(p.val)} style={{ fontSize: '0.8rem', padding: '8px 12px' }}>{p.name}</button>
        ))}
      </div>
      <div className="tool-result" style={{ textAlign: 'center', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '16px', padding: '20px' }}>
        <div style={{ fontSize: '1.4rem', fontWeight: '600', color: 'var(--primary)' }}>{description}</div>
      </div>
    </div>
  );
};

export default CronExpressionDescriptor;
