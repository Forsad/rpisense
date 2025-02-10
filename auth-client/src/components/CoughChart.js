import { useState, useEffect } from 'react';

function CoughChart({ location, onClose }) {
  // Mock data for 24 hours (one entry per hour)
  const [hourlyData] = useState(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      coughs: Math.floor(Math.random() * 10) // Random number of coughs (0-9)
    }));
  });

  const maxCoughs = Math.max(...hourlyData.map(d => d.coughs));

  useEffect(() => {
    const interval = setInterval(() => {
      // Update chart data here if needed
    }, 2000);
    
    return () => clearInterval(interval);
  }, [location]);

  return (
    <div className="chart-overlay">
      <div className="chart-container">
        <div className="chart-header">
          <h2>{location} - Last 24 Hours</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <div className="bar-chart">
          {hourlyData.map((data) => (
            <div key={data.hour} className="bar-container">
              <div 
                className="bar" 
                style={{ 
                  height: `${(data.coughs / maxCoughs) * 100}%`
                }}
              >
                <span className="cough-count">{data.coughs}</span>
              </div>
              <span className="hour-label">
                {data.hour.toString().padStart(2, '0')}:00
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CoughChart; 