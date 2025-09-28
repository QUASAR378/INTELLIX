// Map styling utilities
export const getCountyColor = (priorityScore) => {
  if (priorityScore < 0.3) return '#90EE90'; // Light green
  if (priorityScore < 0.7) return '#FFD700'; // Gold
  return '#FF4500'; // Orange red
};

export const getCountyStyle = (county, isSelected = false) => {
  const baseStyle = {
    fillColor: getCountyColor(county?.priority_score || 0.2),
    weight: isSelected ? 3 : 1,
    opacity: 1,
    color: isSelected ? '#FF6B35' : 'white',
    fillOpacity: 0.7,
  };
  
  return baseStyle;
};

export const getTooltipContent = (county) => {
  if (!county) return 'No data available';
  
  return `
    <strong>${county.county_name}</strong><br/>
    Priority: ${((county.priority_score || 0) * 100).toFixed(0)}%<br/>
    Population: ${(county.population || 0).toLocaleString()}<br/>
    Current kWh: ${(county.current_kwh || 0).toLocaleString()}
  `;
};