import React from 'react';

const StatCard = ({ label, value, IconComp, iconColor, trend, trendPositive, accentColor, bgAccent, delay = 0, isMobile = false }) => {
  const radius = isMobile ? 14 : 16;
  const shadow = isMobile
    ? '0 1px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)'
    : '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)';
  return (
    <div
      style={{ background:'#fff', border:'1px solid #f3f4f6', borderRadius:radius,
        padding: isMobile ? '18px 18px 16px' : '24px 24px 20px',
        boxShadow:shadow, position:'relative', overflow:'hidden',
        transition:'box-shadow 0.2s ease, transform 0.2s ease',
        animation:`fadeUp 0.5s ease ${delay}s both`,
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow='0 4px 6px rgba(0,0,0,0.05), 0 12px 32px rgba(0,0,0,0.08)'; e.currentTarget.style.transform='translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow=shadow; e.currentTarget.style.transform='translateY(0)'; }}
    >
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:accentColor, borderRadius:`${radius}px ${radius}px 0 0` }}/>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:isMobile?12:11, fontWeight:600, color:'#9ca3af', textTransform:isMobile?'none':'uppercase', letterSpacing:isMobile?0:'0.7px', marginBottom:isMobile?6:10 }}>{label}</p>
          <p style={{ fontSize:isMobile?32:38, fontWeight:800, color:'#111827', lineHeight:1, marginBottom:isMobile?10:8, fontFamily:"'Plus Jakarta Sans', sans-serif" }}>{value}</p>
          {trend && (
            <p style={{ fontSize:12, color:trendPositive===false?'#dc2626':'#16a34a', fontWeight:500, display:'flex', alignItems:'center', gap:4 }}>
              {trend}
            </p>
          )}
        </div>
        <div style={{ width:isMobile?44:48, height:isMobile?44:48, borderRadius:isMobile?12:13, background:bgAccent, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginLeft:12, marginTop:2 }}>
          <IconComp size={isMobile?20:22} color={iconColor}/>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
