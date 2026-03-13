"""
AI Recommendation Engine Module

This module implements machine learning algorithms for API recommendation
based on user preferences, usage patterns, and API characteristics.
It uses collaborative filtering and content-based approaches to provide
personalized API suggestions.

Author: LaraMultiAPI Agent Team
Version: 1.1.0
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Tuple, Optional, Set
from dataclasses import dataclass
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
import logging
from collections import defaultdict
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class UserProfile:
    """Represents a user's API usage profile."""
    user_id: str
    preferred_categories: List[str]
    used_apis: Set[str]
    search_history: List[str]
    rating_history: Dict[str, float]  # api_id -> rating

@dataclass
class APIRecommendation:
    """Represents a single API recommendation with confidence score."""
    api_id: str
    score: float
    reasons: List[str]
    category_match: bool

class AIRecommender:
    """Main class for AI-powered API recommendations."""

    def __init__(self, api_data: List[Dict[str, Any]]):
        self.api_data = api_data
        self.api_features = self._extract_features()
        self.user_profiles: Dict[str, UserProfile] = {}
        self.similarity_matrix = None
        self._build_similarity_matrix()

    def _extract_features(self) -> pd.DataFrame:
        """Extract numerical and textual features from API data."""
        features = []

        for api in self.api_data:
            feature_dict = {
                'id': api.get('id', ''),
                'name': api.get('name', ''),
                'description': api.get('description', ''),
                'category': api.get('category', ''),
                'auth_type': api.get('auth', 'none'),
                'https': 1 if api.get('https', False) else 0,
                'cors': 1 if api.get('cors', 'No') == 'Yes' else 0,
                'text_content': f"{api.get('name', '')} {api.get('description', '')} {api.get('category', '')}"
            }
            features.append(feature_dict)

        df = pd.DataFrame(features)

        # Create TF-IDF vectors for text content
        if not df.empty:
            vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
            tfidf_matrix = vectorizer.fit_transform(df['text_content'])
            tfidf_df = pd.DataFrame(
                tfidf_matrix.toarray(),
                columns=[f'tfidf_{i}' for i in range(tfidf_matrix.shape[1])]
            )
            df = pd.concat([df, tfidf_df], axis=1)

        return df

    def _build_similarity_matrix(self):
        """Build API similarity matrix using content-based filtering."""
        if self.api_features.empty:
            return

        # Use TF-IDF features for similarity calculation
        tfidf_cols = [col for col in self.api_features.columns if col.startswith('tfidf_')]
        if tfidf_cols:
            feature_matrix = self.api_features[tfidf_cols].values
            self.similarity_matrix = cosine_similarity(feature_matrix)
        else:
            # Fallback to basic features
            basic_features = ['https', 'cors']
            if all(col in self.api_features.columns for col in basic_features):
                feature_matrix = self.api_features[basic_features].values
                scaler = StandardScaler()
                scaled_features = scaler.fit_transform(feature_matrix)
                self.similarity_matrix = cosine_similarity(scaled_features)

    def create_user_profile(self, user_id: str, initial_data: Dict[str, Any]) -> UserProfile:
        """
        Create or update a user profile based on their interaction data.

        Args:
            user_id: Unique user identifier
            initial_data: Dictionary containing user preferences and history

        Returns:
            UserProfile: Created user profile
        """
        profile = UserProfile(
            user_id=user_id,
            preferred_categories=initial_data.get('preferred_categories', []),
            used_apis=set(initial_data.get('used_apis', [])),
            search_history=initial_data.get('search_history', []),
            rating_history=initial_data.get('rating_history', {})
        )

        self.user_profiles[user_id] = profile
        logger.info(f"Created user profile for {user_id}")
        return profile

    def _calculate_content_similarity(self, user_profile: UserProfile, api_id: str) -> float:
        """Calculate content-based similarity score."""
        if self.similarity_matrix is None:
            return 0.0

        try:
            api_idx = self.api_features[self.api_features['id'] == api_id].index[0]
            user_categories = set(user_profile.preferred_categories)

            # Find APIs in user's preferred categories
            category_apis = self.api_features[
                self.api_features['category'].isin(user_categories)
            ]

            if category_apis.empty:
                return 0.0

            # Calculate average similarity to preferred category APIs
            similarities = []
            for _, cat_api in category_apis.iterrows():
                cat_idx = cat_api.name
                if cat_idx < len(self.similarity_matrix):
                    sim = self.similarity_matrix[api_idx][cat_idx]
                    similarities.append(sim)

            return np.mean(similarities) if similarities else 0.0

        except (IndexError, KeyError):
            return 0.0

    def _calculate_collaborative_score(self, user_profile: UserProfile, api_id: str) -> float:
        """Calculate collaborative filtering score based on similar users."""
        # Simplified collaborative filtering
        # In a real implementation, this would use matrix factorization or KNN
        similar_users = []

        for other_profile in self.user_profiles.values():
            if other_profile.user_id == user_profile.user_id:
                continue

            # Calculate user similarity based on overlapping preferences
            category_overlap = len(
                set(user_profile.preferred_categories) &
                set(other_profile.preferred_categories)
            )
            api_overlap = len(user_profile.used_apis & other_profile.used_apis)

            similarity = (category_overlap * 0.6) + (api_overlap * 0.4)
            if similarity > 0:
                similar_users.append((other_profile, similarity))

        if not similar_users:
            return 0.0

        # Get ratings from similar users for this API
        api_ratings = []
        for similar_user, user_sim in similar_users:
            if api_id in similar_user.rating_history:
                api_ratings.append(similar_user.rating_history[api_id] * user_sim)

        return np.mean(api_ratings) if api_ratings else 0.0

    def _generate_recommendation_reasons(self, user_profile: UserProfile,
                                       api_data: Dict[str, Any], score: float) -> List[str]:
        """Generate human-readable reasons for the recommendation."""
        reasons = []

        # Category match
        if api_data.get('category') in user_profile.preferred_categories:
            reasons.append(f"Matches your preferred category: {api_data['category']}")

        # Similar to used APIs
        if user_profile.used_apis:
            reasons.append("Similar to APIs you've used before")

        # Features match
        if api_data.get('https'):
            reasons.append("Supports secure HTTPS connections")
        if api_data.get('cors') == 'Yes':
            reasons.append("CORS enabled for web applications")

        # High confidence
        if score > 0.8:
            reasons.append("High confidence recommendation")

        return reasons[:3]  # Limit to top 3 reasons

    def get_recommendations(self, user_id: str, top_k: int = 5) -> List[APIRecommendation]:
        """
        Get personalized API recommendations for a user.

        Args:
            user_id: User identifier
            top_k: Number of recommendations to return

        Returns:
            List[APIRecommendation]: Ranked list of recommendations
        """
        if user_id not in self.user_profiles:
            logger.warning(f"User profile not found for {user_id}")
            return []

        user_profile = self.user_profiles[user_id]
        recommendations = []

        for api in self.api_data:
            api_id = api.get('id', '')
            if api_id in user_profile.used_apis:
                continue  # Skip already used APIs

            # Calculate recommendation score
            content_score = self._calculate_content_similarity(user_profile, api_id)
            collaborative_score = self._calculate_collaborative_score(user_profile, api_id)

            # Weighted combination
            final_score = (content_score * 0.7) + (collaborative_score * 0.3)

            if final_score > 0.1:  # Minimum threshold
                reasons = self._generate_recommendation_reasons(
                    user_profile, api, final_score
                )

                category_match = api.get('category') in user_profile.preferred_categories

                recommendations.append(APIRecommendation(
                    api_id=api_id,
                    score=round(final_score, 3),
                    reasons=reasons,
                    category_match=category_match
                ))

        # Sort by score and return top-k
        recommendations.sort(key=lambda x: x.score, reverse=True)
        return recommendations[:top_k]

    def update_user_feedback(self, user_id: str, api_id: str, rating: float):
        """
        Update user profile with feedback on an API.

        Args:
            user_id: User identifier
            api_id: API identifier
            rating: User rating (0.0 to 5.0)
        """
        if user_id not in self.user_profiles:
            logger.warning(f"User profile not found for {user_id}")
            return

        self.user_profiles[user_id].rating_history[api_id] = rating
        logger.info(f"Updated rating for user {user_id}, API {api_id}: {rating}")

    def get_similar_apis(self, api_id: str, top_k: int = 5) -> List[Tuple[str, float]]:
        """
        Find APIs similar to the given API.

        Args:
            api_id: Reference API identifier
            top_k: Number of similar APIs to return

        Returns:
            List[Tuple[str, float]]: List of (api_id, similarity_score) pairs
        """
        if self.similarity_matrix is None:
            return []

        try:
            api_idx = self.api_features[self.api_features['id'] == api_id].index[0]
            similarities = self.similarity_matrix[api_idx]

            # Get top-k similar APIs (excluding itself)
            similar_indices = np.argsort(similarities)[::-1][1:top_k+1]
            similar_apis = []

            for idx in similar_indices:
                similar_api_id = self.api_features.iloc[idx]['id']
                score = similarities[idx]
                similar_apis.append((similar_api_id, round(float(score), 3)))

            return similar_apis

        except (IndexError, KeyError):
            logger.error(f"Could not find similar APIs for {api_id}")
            return []

    def get_popular_apis(self, category: Optional[str] = None, top_k: int = 10) -> List[str]:
        """
        Get most popular APIs, optionally filtered by category.

        Args:
            category: Optional category filter
            top_k: Number of APIs to return

        Returns:
            List[str]: List of popular API IDs
        """
        # Simplified popularity calculation
        # In a real system, this would use actual usage data
        filtered_apis = self.api_data
        if category:
            filtered_apis = [api for api in self.api_data if api.get('category') == category]

        # Random popularity simulation (replace with real metrics)
        popular_apis = [(api['id'], random.uniform(0.5, 1.0)) for api in filtered_apis]
        popular_apis.sort(key=lambda x: x[1], reverse=True)

        return [api_id for api_id, _ in popular_apis[:top_k]]