import { useState, useEffect, useCallback } from 'react';
import { notesApi } from './api';

interface SearchFiltersProps {
  onSearchChange: (search: string) => void;
  onTagsChange: (tags: string) => void;
  onSortChange: (sortBy: string, sortOrder: string) => void;
}

export const SearchFilters = ({ onSearchChange, onTagsChange, onSortChange }: SearchFiltersProps) => {
  const [search, setSearch] = useState('');
  const [tags, setTags] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  useEffect(() => {
    const loadTags = async () => {
      try {
        const response = await notesApi.getTags();
        setAvailableTags(response.data);
      } catch (error) {
        console.error('Failed to load tags:', error);
      }
    };
    loadTags();
  }, []);

  const debouncedSearchChange = useCallback(() => {
    const timeoutId = setTimeout(() => {
      onSearchChange(search);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [search, onSearchChange]);

  const debouncedTagsChange = useCallback(() => {
    const timeoutId = setTimeout(() => {
      onTagsChange(tags);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [tags, onTagsChange]);

  useEffect(debouncedSearchChange, [debouncedSearchChange]);
  useEffect(debouncedTagsChange, [debouncedTagsChange]);

  const handleSortChange = (field: string) => {
    let newSortBy = field;
    let newSortOrder = 'DESC';
    
    if (field === sortBy) {
      newSortOrder = sortOrder === 'ASC' ? 'DESC' : 'ASC';
    }
    
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    onSortChange(newSortBy, newSortOrder);
  };

  const handleTagSuggestionClick = (tag: string) => {
    const currentTags = tags.split(',').map(t => t.trim()).filter(t => t);
    if (!currentTags.includes(tag)) {
      const newTags = [...currentTags, tag].join(', ');
      setTags(newTags);
    }
    setShowTagSuggestions(false);
  };

  const filteredSuggestions = availableTags.filter(tag => 
    tag.toLowerCase().includes(tags.toLowerCase()) && 
    !tags.split(',').map(t => t.trim()).includes(tag)
  );

  return (
    <div className="search-filters">
      <div className="search-row">
        <input
          type="text"
          className="search-input"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="tag-input-container">
          <input
            type="text"
            className="filter-input"
            placeholder="Filter by tags..."
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            onFocus={() => setShowTagSuggestions(true)}
            onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
          />
          {showTagSuggestions && filteredSuggestions.length > 0 && (
            <div className="tag-suggestions">
              {filteredSuggestions.map((tag) => (
                <button
                  key={tag}
                  className="tag-suggestion"
                  onMouseDown={() => handleTagSuggestionClick(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="sort-row">
        <span className="sort-label">Sort by:</span>
        <button
          className={`sort-button ${sortBy === 'createdAt' ? 'active' : ''}`}
          onClick={() => handleSortChange('createdAt')}
        >
          Created {sortBy === 'createdAt' && (sortOrder === 'ASC' ? '↑' : '↓')}
        </button>
        <button
          className={`sort-button ${sortBy === 'updatedAt' ? 'active' : ''}`}
          onClick={() => handleSortChange('updatedAt')}
        >
          Updated {sortBy === 'updatedAt' && (sortOrder === 'ASC' ? '↑' : '↓')}
        </button>
        <button
          className={`sort-button ${sortBy === 'title' ? 'active' : ''}`}
          onClick={() => handleSortChange('title')}
        >
          Title {sortBy === 'title' && (sortOrder === 'ASC' ? '↑' : '↓')}
        </button>
      </div>
    </div>
  );
};