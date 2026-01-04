import { useState, useEffect } from 'react';
import type { AWSService } from '../types';
import { parseAWSServicesCSV } from '../utils/csvParser';

export function useAWSServices() {
  const [services, setServices] = useState<AWSService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await fetch('/aws_services_note.csv');
        if (!response.ok) throw new Error('Failed to load CSV');
        const csvContent = await response.text();
        const parsedServices = parseAWSServicesCSV(csvContent);
        setServices(parsedServices);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  return { services, loading, error };
}
