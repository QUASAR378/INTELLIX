# Kenya Energy Dashboard - User Guide

## Overview

The Kenya Energy Dashboard is an interactive web application that provides AI-powered insights for renewable energy allocation and mini-grid optimization across Kenya's 47 counties. This guide will help you navigate and utilize all features effectively.

## Getting Started

### Accessing the Dashboard

1. **Web Browser**: Open your preferred web browser (Chrome, Firefox, Safari, Edge)
2. **URL**: Navigate to the dashboard URL
   - Development: `http://localhost:5173`
   - Production: `https://your-dashboard-domain.com`
3. **Loading**: Wait for the dashboard to load (typically 2-5 seconds)

### Dashboard Overview

The main dashboard consists of three primary views:
- **📊 Overview**: Main county analysis and visualization
- **📈 Real-Time Monitoring**: Live system metrics and alerts  
- **⚡ Mini-Grid Simulation**: Interactive energy system modeling

## Navigation Guide

### 1. Overview Dashboard

The Overview dashboard is your starting point for county-level energy analysis.

#### Key Metrics Cards
- **Counties Analyzed**: Shows progress of analysis coverage
- **Energy Deficit**: Total energy shortfall across counties
- **Households Served**: Potential beneficiaries of proposed solutions
- **Investment Needed**: Total funding requirements

#### Interactive Kenya Map
- **County Markers**: Color-coded circles showing energy deficit levels
  - 🔴 Red: High deficit (>10 GWh)
  - 🟡 Yellow: Medium deficit (5-10 GWh)  
  - 🟢 Green: Low deficit (<5 GWh)
- **Solution Icons**: 
  - ☀️ Solar Mini-grid
  - 🔌 Grid Extension
  - ⚡ Hybrid Solution
  - 🔧 Grid Optimization
- **Click Interaction**: Click any county marker to view detailed information
- **Map Controls**: 
  - 🏠 Reset View: Returns to default Kenya view
  - 🎯 Priority Areas: Focuses on high-priority counties

#### Priority Counties Panel
- Lists top 5 counties by priority score
- Shows priority ranking and score (0-100)
- Click any county to view detailed analysis

#### Implementation Progress
- Shows project status across different phases
- Tracks planning, in-progress, completed, and on-hold projects

#### Environmental Impact
- Displays CO₂ reduction potential
- Highlights environmental benefits of proposed solutions

### 2. Real-Time Monitoring

Monitor live system performance and receive alerts.

#### System Status Controls
- **Live Toggle**: Start/stop real-time data updates
- **Connection Status**: Shows API connectivity (Live/Error/Offline)
- **Auto-refresh**: Updates every 3 seconds when live mode is active

#### Key Metrics
- **Total Generation**: Current power generation across all mini-grids
- **Current Demand**: Real-time energy demand
- **Active Mini-Grids**: Number of operational systems
- **Grid Stability**: Overall system reliability percentage

#### Charts and Visualizations
- **System Status Chart**: Doughnut chart showing generation vs. demand
- **Regional Performance**: Bar chart of efficiency by region
- **Regional Status Grid**: Individual region performance cards

#### Alerts and Notifications
- **Priority Levels**: High (red), Medium (yellow), Low (blue)
- **Alert Types**: Maintenance, Performance, System issues
- **Timestamps**: Shows when alerts were generated
- **Dismiss**: Click to remove alerts from view

### 3. Mini-Grid Simulation

Design and optimize mini-grid systems for specific scenarios.

#### Configuration Panel

**Quick Presets**
- 🏠 Small Village (50kW): 50 households, basic rural setup
- 🏢 Trading Center (100kW): Mixed residential/commercial
- 🏥 Health Center (75kW): Healthcare facility with critical loads
- 🏫 School Complex (125kW): Educational institution

**Manual Configuration**
- **Solar Capacity**: Adjust from 10-200 kW using slider
- **Battery Capacity**: Set storage from 50-500 kWh
- **Households Served**: Configure population from 25-300 homes
- **Location**: Select from dropdown of Kenya counties

#### Simulation Controls
- **🚀 Run Simulation**: Execute analysis with current settings
- **▶️ Live Mode**: Enable real-time hour-by-hour animation
- **⏹️ Stop Live**: Disable real-time updates

#### Results Visualization

**24-Hour Energy Chart**
- Yellow line: Solar generation throughout the day
- Red line: Energy demand curve
- Green line: Battery state of charge (%)
- Interactive tooltips show exact values

**Performance Metrics**
- **System Efficiency**: Overall performance percentage
- **Daily Savings**: Cost comparison vs. diesel generation
- **Daily Generation**: Total kWh produced
- **Homes Powered**: Impact on households

**Live Status Panel** (when Live Mode is active)
- Current time indicator
- Real-time generation, demand, and battery levels
- Status indicator (Energy Surplus/Deficit)

#### AI Optimization Insights
- **Energy Management**: Peak generation times and optimization tips
- **Performance Analysis**: System efficiency evaluation
- **Recommendations**: Suggested improvements for battery, solar, and load management

## Advanced Features

### County Detail Analysis

When you click on a county from the map or priority list:

1. **Detailed Metrics**: Population, current energy access, blackout frequency
2. **Energy Profile**: Solar irradiance, grid distance, economic activity
3. **Recommendations**: AI-generated solution suggestions
4. **Investment Analysis**: Cost estimates and expected ROI
5. **Implementation Timeline**: Projected deployment schedule

### Data Export and Sharing

- **Screenshots**: Use browser screenshot tools to capture visualizations
- **Data Download**: API endpoints available for programmatic access
- **Report Generation**: PDF reports can be generated from simulation results

### Mobile Responsiveness

The dashboard is optimized for various screen sizes:
- **Desktop**: Full functionality with side-by-side panels
- **Tablet**: Responsive grid layout with collapsible sections
- **Mobile**: Stacked layout with touch-friendly controls

## Troubleshooting

### Common Issues

**Dashboard Won't Load**
- Check internet connection
- Verify the correct URL
- Clear browser cache and cookies
- Try a different browser

**Map Not Displaying**
- Ensure JavaScript is enabled
- Check for browser ad-blockers
- Verify network connectivity to mapping services

**Real-Time Data Not Updating**
- Click the "Start Live" button
- Check connection status indicator
- Refresh the page if connection shows "Error"

**Simulation Not Running**
- Verify all configuration parameters are set
- Check that values are within valid ranges
- Ensure backend API is accessible

### Performance Optimization

**For Better Performance:**
- Close unnecessary browser tabs
- Use Chrome or Firefox for best compatibility
- Ensure stable internet connection
- Update browser to latest version

**For Slower Connections:**
- Disable real-time monitoring when not needed
- Use simplified chart views
- Reduce simulation frequency

## Best Practices

### Effective Analysis Workflow

1. **Start with Overview**: Get familiar with overall energy landscape
2. **Identify Priorities**: Use the priority counties panel to focus efforts
3. **Detailed Analysis**: Click on specific counties for deep-dive analysis
4. **Simulation Testing**: Use mini-grid simulator to validate solutions
5. **Real-Time Monitoring**: Track implementation progress

### Simulation Best Practices

1. **Use Presets First**: Start with pre-configured scenarios
2. **Gradual Adjustments**: Make incremental changes to parameters
3. **Test Multiple Scenarios**: Compare different configurations
4. **Consider Local Context**: Factor in location-specific constraints
5. **Validate with Data**: Cross-reference with real-world data when available

### Data Interpretation

**Priority Scores (0-100)**
- 90-100: Immediate intervention required
- 70-89: High priority for development
- 50-69: Medium priority, good for expansion
- <50: Lower priority, focus on optimization

**Efficiency Ratings**
- >90%: Excellent performance
- 80-90%: Good performance with room for improvement
- 70-80%: Acceptable but needs optimization
- <70%: Requires significant improvement

## Support and Resources

### Getting Help

- **Documentation**: Comprehensive API documentation available
- **Issues**: Report bugs or request features via GitHub issues
- **Email Support**: Contact support team for technical assistance

### Educational Resources

- **Video Tutorials**: Step-by-step guides for common tasks
- **Case Studies**: Real-world examples of successful implementations
- **Best Practices**: Guidelines for effective energy planning

### API Access

For developers and advanced users:
- **REST API**: Full programmatic access to all dashboard features
- **WebSocket**: Real-time data streaming (planned)
- **SDK**: Software development kit for custom integrations

### System Requirements

**Minimum Requirements:**
- Modern web browser (Chrome 80+, Firefox 75+, Safari 13+)
- 2GB RAM
- Stable internet connection (1 Mbps+)

**Recommended:**
- Chrome or Firefox latest version
- 4GB+ RAM
- High-speed internet (5 Mbps+)
- 1920x1080 screen resolution

---

## Quick Reference

### Keyboard Shortcuts
- `Ctrl + R`: Refresh dashboard
- `F11`: Toggle fullscreen mode
- `Esc`: Exit fullscreen or close dialogs

### Color Coding
- 🔴 Red: High priority/deficit
- 🟡 Yellow: Medium priority/deficit  
- 🟢 Green: Low priority/deficit/good performance
- 🔵 Blue: Information/neutral status

### Contact Information
- **Support Email**: support@energy-dashboard.com
- **Documentation**: docs.energy-dashboard.com
- **GitHub**: github.com/energy-dashboard
- **Status Page**: status.energy-dashboard.com

---

*Last updated: January 2024*
*Version: 1.0.0*