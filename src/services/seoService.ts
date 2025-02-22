
import { SEOAnalysis } from '@/store/seoStore';
import { supabase } from "@/integrations/supabase/client";

export interface SEOMetadata {
  title: string;
  description: string;
  h1: string;
  h2s: string[];
  h3s: string[];
  h4s: string[];
  visibleText: string[];
  internalLinks: string[];
  externalLinks: string[];
  brokenLinks: string[];
}

export const downloadTableAsCSV = (data: SEOAnalysis[]) => {
  if (!data || data.length === 0) return;

  const headers = [
    'URL',
    'Entreprise',
    'Titre actuel',
    'Description actuelle',
    'H1 actuel',
    'Titre suggéré',
    'Description suggérée',
    'H1 suggéré',
    'Vitesse de chargement'
  ];

  const csvContent = [
    headers.join(','),
    ...data.map(row => [
      row.url,
      row.company || '',
      `"${(row.current_title || '').replace(/"/g, '""')}"`,
      `"${(row.current_description || '').replace(/"/g, '""')}"`,
      `"${(row.current_h1 || '').replace(/"/g, '""')}"`,
      `"${(row.suggested_title || '').replace(/"/g, '""')}"`,
      `"${(row.suggested_description || '').replace(/"/g, '""')}"`,
      `"${(row.suggested_h1 || '').replace(/"/g, '""')}"`,
      row.page_load_speed || ''
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `seo_analysis_${new Date().toISOString()}.csv`);
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const extractSEOMetadata = async (url: string): Promise<SEOMetadata> => {
  console.log('Extraction des métadonnées SEO pour:', url);
  
  try {
    const { data: seoData, error } = await supabase.functions.invoke('extract-seo', {
      body: { url }
    });

    if (error) {
      console.error('Erreur lors de l\'appel à extract-seo:', error);
      throw error;
    }

    return seoData;
  } catch (error) {
    console.error('Erreur lors de l\'extraction des métadonnées:', error);
    throw error;
  }
};
