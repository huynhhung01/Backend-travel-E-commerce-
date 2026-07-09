from django.urls import path
from .views import TourReviewAnalysisView

urlpatterns = [
    path('analyze-tour/', TourReviewAnalysisView.as_view(), name='analyze_tour_reviews'),
]