import { useState, useEffect } from 'react';

export default function SimpleAnalytics() {
  const [stats, setStats] = useState({
    totalMinted: 0,
    totalCheckedIn: 0,
    checkInRate: 0
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real implementation, you'd query your contracts here
      setStats(prev => ({
        ...prev,
        totalMinted: prev.totalMinted + Math.floor(Math.random() * 3),
        totalCheckedIn: prev.totalCheckedIn + Math.floor(Math.random() * 2)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card">
      <h3>
        <span></span>
        Live Analytics (Envio-Style)
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '12px' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#6B7280' }}>Total Minted</h4>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#8B5CF6' }}>
            {stats.totalMinted}
          </p>
        </div>
        
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '12px' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#6B7280' }}>Checked In</h4>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#10B981' }}>
            {stats.totalCheckedIn}
          </p>
        </div>
        
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '12px' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#6B7280' }}>Check-in Rate</h4>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#3B82F6' }}>
            {stats.totalMinted > 0 
              ? Math.round((stats.totalCheckedIn / stats.totalMinted) * 100)
              : 0}%
          </p>
        </div>
      </div>
    </div>
  );
}
