"""
County Energy Planning Model - Production Ready Implementation
Designed for seamless integration with existing systems
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler, LabelEncodercoun
from sklearn.cluster import KMeans
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import logging
from typing import Dict, List, Tuple, Optional, Union
from datetime import datetime
import json
from pathlib import Path
import warnings
import sqlalchemy as db
warnings.filterwarnings('ignore')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('county_planner.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class CountyEnergyPlanner:
    def __init__(self, config=None, db_connection=None):
        """
        Production-ready County Energy Planning Model
        
        Features:
        - Robust error handling and validation
        - Model persistence and versioning
        - Comprehensive logging
        - Flexible configuration
        - Integration-friendly API
        """
        def __init__(self, config: Optional[Dict] = None):
            """Initialize the County Energy Planner with configuration"""
            self.config = self._load_default_config()
            if config:
                self.config.update(config)
            
            # Initialize models
            self.priority_model = RandomForestRegressor(
                n_estimators=self.config['model']['n_estimators'],
                random_state=self.config['model']['random_state'],
                max_depth=self.config['model']['max_depth'],
                min_samples_split=self.config['model']['min_samples_split']
            )
            
            self.scaler = StandardScaler()
            self.cluster_model = KMeans(
                n_clusters=self.config['clustering']['n_clusters'],
                random_state=self.config['model']['random_state']
            )
            
            # Model metadata
            self.model_version = "1.0.0"
            self.last_trained = None
            self.feature_columns = None
            self.is_trained = False
            
            # Results cache for performance
            self._results_cache = {}
            self._cache_timestamp = None
            
            logger.info(f"CountyEnergyPlanner initialized with version {self.model_version}")
        
        def _load_default_config(self) -> Dict:
            """Load default configuration"""
            return {
                'model': {
                    'n_estimators': 100,
                    'random_state': 42,
                    'max_depth': 10,
                    'min_samples_split': 5
                },
                'clustering': {
                    'n_clusters': 3
                },
                'data': {
                    'required_columns': [
                        'county_name', 'population', 'hospitals', 'schools',
                        'blackout_freq', 'economic_activity', 'grid_distance',
                        'current_kwh'
                    ],
                    'energy_per_capita': 50,
                    'cache_duration_minutes': 30
                },
                'recommendations': {
                    'solar_threshold': 15,  # km from grid
                    'grid_extension_threshold': 10,  # km from grid
                    'top_counties_count': 10
                }
            }
            

        
        def validate_input_data(self, data: pd.DataFrame) -> Tuple[bool, List[str]]:
            """Validate input data structure and content"""
            errors = []
            
            # Check if DataFrame is empty
            if data.empty:
                errors.append("Input data is empty")
                return False, errors
            
            # Check required columns
            required_cols = self.config['data']['required_columns']
            missing_cols = [col for col in required_cols if col not in data.columns]
            if missing_cols:
                errors.append(f"Missing required columns: {missing_cols}")
            
            # Check data types and ranges
            numeric_cols = ['population', 'hospitals', 'schools', 'blackout_freq', 
                        'economic_activity', 'grid_distance', 'current_kwh']
            
            for col in numeric_cols:
                if col in data.columns:
                    if not pd.api.types.is_numeric_dtype(data[col]):
                        errors.append(f"Column {col} must be numeric")
                    
                    if data[col].min() < 0:
                        errors.append(f"Column {col} contains negative values")
            
            # Check for duplicate counties
            if 'county_name' in data.columns:
                duplicates = data['county_name'].duplicated().sum()
                if duplicates > 0:
                    errors.append(f"Found {duplicates} duplicate county names")
            
            return len(errors) == 0, errors
        
        def preprocess_data(self, county_data: pd.DataFrame, fit_scaler: bool = True) -> Tuple[pd.DataFrame, List[str]]:
            """
            Preprocess county data with robust error handling
            
            Args:
                county_data: Raw county data
                fit_scaler: Whether to fit the scaler (True for training, False for prediction)
            
            Returns:
                Preprocessed data and feature columns
            """
            try:
                # Validate input
                is_valid, errors = self.validate_input_data(county_data)
                if not is_valid:
                    raise ValueError(f"Data validation failed: {errors}")
                
                # Create a copy to avoid modifying original data
                data = county_data.copy()
                
                # Handle missing values with different strategies
                numeric_columns = data.select_dtypes(include=[np.number]).columns
                
                # For critical columns, use median; for others, use mean
                critical_cols = ['population', 'current_kwh']
                for col in numeric_columns:
                    if col in critical_cols:
                        data[col].fillna(data[col].median(), inplace=True)
                    else:
                        data[col].fillna(data[col].mean(), inplace=True)
                
                # Calculate energy deficit
                data['energy_deficit'] = self.calculate_energy_deficit(data)
                
                # Define feature columns for model
                feature_columns = [
                    'population', 'hospitals', 'schools', 'blackout_freq',
                    'economic_activity', 'grid_distance', 'energy_deficit'
                ]
                
                # Ensure all feature columns exist
                for col in feature_columns:
                    if col not in data.columns:
                        logger.warning(f"Missing feature column {col}, filling with zeros")
                        data[col] = 0
                
                # Scale features
                if fit_scaler:
                    scaled_features = self.scaler.fit_transform(data[feature_columns])
                    self.feature_columns = feature_columns
                else:
                    if self.feature_columns is None:
                        raise ValueError("Model must be trained before making predictions")
                    # Ensure same feature order as training
                    scaled_features = self.scaler.transform(data[self.feature_columns])
                
                # Create scaled DataFrame
                scaled_df = pd.DataFrame(scaled_features, columns=feature_columns, index=data.index)
                
                # Add non-scaled columns back
                for col in ['county_name']:
                    if col in data.columns:
                        scaled_df[col] = data[col].values
                
                logger.info(f"Data preprocessing completed for {len(data)} counties")
                return scaled_df, feature_columns
                
            except Exception as e:
                logger.error(f"Error in data preprocessing: {str(e)}")
                raise
        
        def calculate_energy_deficit(self, county_data: pd.DataFrame) -> pd.Series:
            """Calculate energy deficit with improved formula"""
            try:
                # Base energy need per capita
                per_capita_need = self.config['data']['energy_per_capita']
                
                # Calculate total energy need
                base_need = county_data['population'] * per_capita_need
                
                # Adjust for infrastructure (hospitals, schools need more energy)
                infrastructure_multiplier = 1 + (county_data['hospitals'] + county_data['schools']) / 100
                
                # Adjust for economic activity
                economic_multiplier = 1 + county_data['economic_activity'] / 100
                
                # Total energy need
                total_need = base_need * infrastructure_multiplier * economic_multiplier
                
                # Energy deficit
                deficit = total_need - county_data['current_kwh']
                
                # Ensure non-negative deficit
                deficit = deficit.clip(lower=0)
                
                return deficit
                
            except Exception as e:
                logger.error(f"Error calculating energy deficit: {str(e)}")
                raise
        
        def train_model(self, training_data: pd.DataFrame) -> Dict:
            """
            Train the county prioritization model with validation
            
            Returns:
                Training metrics and model performance
            """
            try:
                logger.info("Starting model training...")
                
                # Preprocess data
                processed_data, feature_cols = self.preprocess_data(training_data, fit_scaler=True)
                
                # Prepare features and target
                X = processed_data[feature_cols]
                y = processed_data['energy_deficit']
                
                # Split data for validation
                X_train, X_test, y_train, y_test = train_test_split(
                    X, y, test_size=0.2, random_state=self.config['model']['random_state']
                )
                
                # Train priority model
                self.priority_model.fit(X_train, y_train)
                
                # Train clustering model
                self.cluster_model.fit(X)
                
                # Validate model
                train_score = self.priority_model.score(X_train, y_train)
                test_score = self.priority_model.score(X_test, y_test)
                
                # Cross-validation
                cv_scores = cross_val_score(self.priority_model, X, y, cv=5)
                
                # Predictions for metrics
                y_pred = self.priority_model.predict(X_test)
                mse = mean_squared_error(y_test, y_pred)
                rmse = np.sqrt(mse)
                
                # Update model metadata
                self.last_trained = datetime.now()
                self.is_trained = True
                
                # Training metrics
                metrics = {
                    'train_r2': train_score,
                    'test_r2': test_score,
                    'cv_mean': cv_scores.mean(),
                    'cv_std': cv_scores.std(),
                    'rmse': rmse,
                    'feature_importance': dict(zip(feature_cols, self.priority_model.feature_importances_)),
                    'training_samples': len(X_train),
                    'test_samples': len(X_test)
                }
                
                logger.info(f"Model training completed. Test R² Score: {test_score:.3f}")
                logger.info(f"Cross-validation Score: {cv_scores.mean():.3f} (±{cv_scores.std():.3f})")
                
                return metrics
                
            except Exception as e:
                logger.error(f"Error during model training: {str(e)}")
                raise
        
        def prioritize_counties(self, county_data: pd.DataFrame, use_cache: bool = True) -> Dict:
            """
            Generate county prioritization with caching for performance
            
            Args:
                county_data: County data for analysis
                use_cache: Whether to use cached results if available
            
            Returns:
                Dictionary containing recommendations and priority rankings
            """
            try:
                # Check cache
                if use_cache and self._is_cache_valid():
                    logger.info("Using cached results")
                    return self._results_cache
                
                if not self.is_trained:
                    raise ValueError("Model must be trained before making predictions")
                
                logger.info(f"Prioritizing {len(county_data)} counties...")
                
                # Preprocess data (don't fit scaler)
                processed_data, _ = self.preprocess_data(county_data, fit_scaler=False)
                
                # Generate predictions
                feature_data = processed_data[self.feature_columns]
                priority_scores = self.priority_model.predict(feature_data)
                clusters = self.cluster_model.predict(feature_data)
                
                # Add results to dataframe
                results_df = county_data.copy()
                results_df['priority_score'] = priority_scores
                results_df['cluster'] = clusters
                results_df['energy_deficit'] = processed_data['energy_deficit'].values
                
                # Generate recommendations by cluster and criteria
                recommendations = self._generate_recommendations(results_df)
                
                # Get top priority counties
                top_counties = results_df.nlargest(
                    self.config['recommendations']['top_counties_count'], 
                    'priority_score'
                )
                
                # Prepare results
                results = {
                    'recommendations': recommendations,
                    'top_counties': top_counties.to_dict('records'),
                    'summary_stats': {
                        'total_counties': len(county_data),
                        'avg_priority_score': float(priority_scores.mean()),
                        'high_priority_counties': int((priority_scores > priority_scores.mean() + priority_scores.std()).sum()),
                        'cluster_distribution': {f'cluster_{i}': int((clusters == i).sum()) 
                                            for i in range(self.config['clustering']['n_clusters'])}
                    },
                    'generated_at': datetime.now().isoformat(),
                    'model_version': self.model_version
                }
                
                # Cache results
                self._results_cache = results
                self._cache_timestamp = datetime.now()
                
                logger.info("County prioritization completed successfully")
                return results
                
            except Exception as e:
                logger.error(f"Error in county prioritization: {str(e)}")
                raise
        
        def _generate_recommendations(self, results_df: pd.DataFrame) -> Dict:
            """Generate technology recommendations based on clustering and criteria"""
            try:
                recommendations = {}
                
                # Solar mini-grid recommendations (remote areas with high energy deficit)
                solar_candidates = results_df[
                    (results_df['grid_distance'] > self.config['recommendations']['solar_threshold']) &
                    (results_df['energy_deficit'] > results_df['energy_deficit'].median())
                ]
                recommendations['solar_minigrid'] = solar_candidates['county_name'].tolist()
                
                # Grid extension recommendations (close to existing grid)
                grid_candidates = results_df[
                    results_df['grid_distance'] <= self.config['recommendations']['grid_extension_threshold']
                ]
                recommendations['grid_extension'] = grid_candidates['county_name'].tolist()
                
                # Hybrid solution recommendations (medium distance, high activity)
                hybrid_candidates = results_df[
                    (results_df['grid_distance'].between(10, 20)) &
                    (results_df['economic_activity'] > results_df['economic_activity'].median())
                ]
                recommendations['hybrid_solution'] = hybrid_candidates['county_name'].tolist()
                
                # Priority intervention (top 20% by priority score)
                priority_threshold = results_df['priority_score'].quantile(0.8)
                recommendations['immediate_intervention'] = results_df[
                    results_df['priority_score'] >= priority_threshold
                ]['county_name'].tolist()
                
                return recommendations
                
            except Exception as e:
                logger.error(f"Error generating recommendations: {str(e)}")
                return {}
        
        def _is_cache_valid(self) -> bool:
            """Check if cached results are still valid"""
            if not self._results_cache or not self._cache_timestamp:
                return False
            
            cache_age = (datetime.now() - self._cache_timestamp).total_seconds() / 60
            return cache_age < self.config['data']['cache_duration_minutes']
        
        def save_model(self, filepath: str) -> None:
            """Save the trained model and metadata"""
            try:
                if not self.is_trained:
                    raise ValueError("Cannot save untrained model")
                
                model_data = {
                    'priority_model': self.priority_model,
                    'scaler': self.scaler,
                    'cluster_model': self.cluster_model,
                    'feature_columns': self.feature_columns,
                    'config': self.config,
                    'model_version': self.model_version,
                    'last_trained': self.last_trained,
                    'metadata': {
                        'saved_at': datetime.now().isoformat(),
                        'python_version': f"{'.'.join(map(str, [3, 8, 0]))}",  # Placeholder
                    }
                }
                
                joblib.dump(model_data, filepath)
                logger.info(f"Model saved successfully to {filepath}")
                
            except Exception as e:
                logger.error(f"Error saving model: {str(e)}")
                raise
        
        def load_model(self, filepath: str) -> None:
            """Load a pre-trained model"""
            try:
                if not Path(filepath).exists():
                    raise FileNotFoundError(f"Model file not found: {filepath}")
                
                model_data = joblib.load(filepath)
                
                # Load model components
                self.priority_model = model_data['priority_model']
                self.scaler = model_data['scaler']
                self.cluster_model = model_data['cluster_model']
                self.feature_columns = model_data['feature_columns']
                self.config.update(model_data.get('config', {}))
                self.model_version = model_data.get('model_version', 'unknown')
                self.last_trained = model_data.get('last_trained')
                self.is_trained = True
                
                logger.info(f"Model loaded successfully from {filepath}")
                logger.info(f"Model version: {self.model_version}, Last trained: {self.last_trained}")
                
            except Exception as e:
                logger.error(f"Error loading model: {str(e)}")
                raise
        
        def get_model_info(self) -> Dict:
            """Get comprehensive model information"""
            return {
                'model_version': self.model_version,
                'is_trained': self.is_trained,
                'last_trained': self.last_trained.isoformat() if self.last_trained else None,
                'feature_columns': self.feature_columns,
                'config': self.config,
                'cache_status': {
                    'has_cache': bool(self._results_cache),
                    'cache_valid': self._is_cache_valid(),
                    'cache_timestamp': self._cache_timestamp.isoformat() if self._cache_timestamp else None
                }
            }
        
        def clear_cache(self) -> None:
            """Clear the results cache"""
            self._results_cache = {}
            self._cache_timestamp = None
            logger.info("Results cache cleared")
            
        self.db_connection = db_connection
    
    def load_data_from_db(self, query: str) -> pd.DataFrame:
        """Load data directly from database"""
        if not self.db_connection:
            raise ValueError("Database connection not configured")
        
        return pd.read_sql(query, self.db_connection)
    

    
    

# Example usage and testing
if __name__ == "__main__":
    # Example usage
    try:
        # Initialize planner
        planner = CountyEnergyPlanner()
        
        # Example data (in production, this would come from your data engineer)
        sample_data = pd.DataFrame({
            'county_name': ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'],
            'population': [4397073, 1208333, 968909, 1603325, 289380],
            'hospitals': [50, 25, 15, 20, 10],
            'schools': [200, 100, 80, 120, 60],
            'blackout_freq': [5, 8, 12, 10, 15],
            'economic_activity': [85, 70, 60, 65, 55],
            'grid_distance': [0, 2, 5, 3, 8],
            'current_kwh': [180000, 80000, 45000, 70000, 12000]
        })
        
        # Train model
        print("Training model...")
        metrics = planner.train_model(sample_data)
        print(f"Training completed with R² score: {metrics['test_r2']:.3f}")
        
        # Generate recommendations
        print("\nGenerating recommendations...")
        results = planner.prioritize_counties(sample_data)
        
        print(f"\nTop priority counties:")
        for county in results['top_counties'][:3]:
            print(f"- {county['county_name']}: Score {county['priority_score']:.2f}")
        
        print(f"\nRecommendations:")
        for tech, counties in results['recommendations'].items():
            if counties:
                print(f"- {tech}: {', '.join(counties[:3])}")
        
        # Save model
        planner.save_model('county_energy_model.pkl')
        print("\nModel saved successfully!")
        
    except Exception as e:
        logger.error(f"Example execution failed: {str(e)}")
        raise