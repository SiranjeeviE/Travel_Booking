
export interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  rating: number;
  pricePerNight: number;
  imageUrl: string;
  tags: string[];
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: {
    time: string;
    activity: string;
    location: string;
    description: string;
  }[];
}

export interface TravelPlan {
  destination: string;
  duration: number;
  budget: 'Budget' | 'Moderate' | 'Luxury';
  itinerary: ItineraryDay[];
  recommendations: string[];
}

export interface UserSession {
  user: {
    name: string;
    email: string;
    avatar: string;
  } | null;
  isAuthenticated: boolean;
}
