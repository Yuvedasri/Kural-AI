export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
}

export class LocationService {
  async getCurrentLocation(): Promise<LocationData> {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser');
    }

    return new Promise((resolve, reject) => {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };

          try {
            const address = await this.reverseGeocode(locationData.latitude, locationData.longitude);
            locationData.address = address;
          } catch (error) {
            console.warn('Failed to get address:', error);
          }

          resolve(locationData);
        },
        (error) => {
          let message = 'Failed to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out';
              break;
          }
          reject(new Error(message));
        },
        options
      );
    });
  }

  private async reverseGeocode(lat: number, lon: number): Promise<string> {
    try {
      // Using a free geocoding service (OpenStreetMap Nominatim)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'KuralAI/1.0'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.display_name || 'Unknown location';
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    
    return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  }

  formatCoordinates(lat: number, lon: number): string {
    return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  }
}