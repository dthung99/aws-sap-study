import { useState, useEffect } from 'react';
import type { AWSService } from '../types';

export function useAWSServices() {
  const [services, setServices] = useState<AWSService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await fetch('/aws_services_note.jsonl');
        if (!response.ok) throw new Error('Failed to load JSONL');
        const jsonlContent = await response.text();
        const lines = jsonlContent.trim().split('\n');
        const parsedServices: AWSService[] = lines
          .filter(line => line.trim())
          .map(line => JSON.parse(line))
          .map(obj => ({
            category: obj.category,
            serviceName: obj.serviceName,
            knowledgeDepth: obj.knowledgeDepth,
            problemSolved: obj.problemSolved,
            scenarioAndSolution: obj.scenarioAndSolution,
            simpleStepByStepUsage: obj.simpleStepByStepUsage,
            qa: obj.qa,
          }));
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
