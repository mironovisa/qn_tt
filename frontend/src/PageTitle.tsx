import { useEffect } from 'react';

interface PageTitleProps {
  title: string;
  description?: string;
}

export const PageTitle = ({ title, description }: PageTitleProps) => {
  useEffect(() => {
    document.title = `${title} - QuickNotes`;
    
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }
    
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', `${title} - QuickNotes`);
    }
    
    let twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', `${title} - QuickNotes`);
    }
  }, [title, description]);

  return null;
};