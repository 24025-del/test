import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface City {
  id: string;
  name_en: string;
  name_ar: string;
}

export const useCities = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const { data, error } = await supabase
          .from('cities')
          .select('*')
          .order('name_en');

        if (error) throw error;
        setCities(data || []);
      } catch (err) {
        console.error('Error fetching cities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  return { cities, loading };
};
