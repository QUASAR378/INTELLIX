// utils/geoHelpers.js

// Return approximate center of Kenya
export const getKenyaCenter = () => {
    return [0.0236, 37.9062]; // lat, lng
  };
  
  // Validate that a GeoJSON feature has geometry + properties
  export const isValidFeature = (feature) => {
    return (
      feature &&
      feature.type === "Feature" &&
      feature.geometry &&
      feature.properties &&
      feature.properties.COUNTY_NAM
    );
  };
  
  // Find county object in your JSON by name (case-insensitive)
  export const findCountyByName = (counties, countyName) => {
    if (!counties || counties.length === 0) return null;
    return counties.find(
      (c) => c.county_name.toLowerCase() === countyName.toLowerCase()
    );
  };
  