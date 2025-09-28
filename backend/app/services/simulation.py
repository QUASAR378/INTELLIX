from typing import Dict, Any
from app.models.minigrid import MiniGridSimulation, SimulationResult
import uuid
from datetime import datetime

class SimulationService:
    def __init__(self):
        self.simulations: Dict[str, SimulationResult] = {}
    
    async def run_simulation(self, simulation: MiniGridSimulation) -> SimulationResult:
        """Run mini-grid simulation"""
        simulation_id = str(uuid.uuid4())
        
        # Simple simulation logic
        total_cost = self._calculate_cost(simulation)
        payback_period = self._calculate_payback(simulation)
        energy_generated = self._calculate_energy_generation(simulation)
        co2_saved = self._calculate_co2_savings(energy_generated)
        
        result = SimulationResult(
            simulation_id=simulation_id,
            county_id=simulation.county_id,
            total_cost=total_cost,
            payback_period=payback_period,
            energy_generated=energy_generated,
            co2_saved=co2_saved,
            status="completed"
        )
        
        self.simulations[simulation_id] = result
        return result
    
    def _calculate_cost(self, simulation: MiniGridSimulation) -> float:
        """Calculate total system cost"""
        base_cost = 50000  # KES per kW
        capacity = simulation.current_demand * 1.2  # 20% buffer
        return base_cost * capacity
    
    def _calculate_payback(self, simulation: MiniGridSimulation) -> int:
        """Calculate payback period in years"""
        return 5  # Simplified calculation
    
    def _calculate_energy_generation(self, simulation: MiniGridSimulation) -> float:
        """Calculate annual energy generation"""
        capacity = simulation.current_demand * 1.2
        return capacity * simulation.solar_irradiance * 365
    
    def _calculate_co2_savings(self, energy_generated: float) -> float:
        """Calculate CO2 savings in tons"""
        # Assume 0.5 kg CO2 per kWh saved
        return energy_generated * 0.5 / 1000
    
    async def get_simulation_result(self, simulation_id: str) -> SimulationResult:
        """Get simulation result by ID"""
        if simulation_id not in self.simulations:
            raise ValueError(f"Simulation {simulation_id} not found")
        return self.simulations[simulation_id]