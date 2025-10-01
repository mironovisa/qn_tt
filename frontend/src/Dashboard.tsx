import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import type { Note, CreateNoteDto } from './api';
import { notesApi } from './api';
import { PageTitle } from './PageTitle';
import { NoteForm } from './NoteForm';
import { SearchFilters } from './SearchFilters';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [tagsFilter, setTagsFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');

  const loadNotes = useCallback(async (cursor?: string, append = false) => {
    try {
      if (!append) {
        setLoading(true);
      }
      const response = await notesApi.getNotes(
        10, 
        cursor, 
        tagsFilter || undefined, 
        searchQuery || undefined, 
        sortBy, 
        sortOrder
      );
      
      if (append) {
        setNotes(prev => [...prev, ...response.data.data]);
      } else {
        setNotes(response.data.data);
      }
      setNextCursor(response.data.pagination.nextCursor);
      setHasMore(!!response.data.pagination.nextCursor);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, tagsFilter, sortBy, sortOrder]);

  useEffect(() => {
    setNextCursor(null);
    setHasMore(true);
    loadNotes();
  }, [loadNotes]);

  const handleCreateNote = async (noteData: CreateNoteDto) => {
    setCreateLoading(true);
    try {
      await notesApi.createNote(noteData);
      setShowCreateForm(false);
      loadNotes();
    } catch (error) {
      console.error('Failed to create note:', error);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateNote = async (noteData: CreateNoteDto) => {
    if (!editingNote) return;
    
    setUpdateLoading(true);
    try {
      await notesApi.updateNote(editingNote.id, noteData);
      setShowEditForm(false);
      setEditingNote(null);
      loadNotes();
    } catch (error) {
      console.error('Failed to update note:', error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setShowEditForm(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await notesApi.deleteNote(noteId);
      setNotes(notes.filter(note => note.id !== noteId));
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const loadMoreNotes = () => {
    if (nextCursor && hasMore && !loading) {
      loadNotes(nextCursor, true);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
    setNextCursor(null);
  };

  const handleTagsChange = (tags: string) => {
    setTagsFilter(tags);
    setNextCursor(null);
  };

  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setNextCursor(null);
  };

  if (loading && notes.length === 0) {
    return <div className="loading">Loading notes...</div>;
  }

  return (
    <div className="dashboard">
      <PageTitle 
        title="Dashboard" 
        description="Manage your notes and ideas in QuickNotes dashboard"
      />
      <header className="header">
        <h1 className="header-title">QuickNotes</h1>
        <div>
          <span className="header-user">{user?.email}</span>
          <button onClick={logout} className="logout-button">
            Sign Out
          </button>
        </div>
      </header>

      <div className="main-content">
        <div className="notes-section">
          <div className="section-header">
            <h2 className="section-title">My Notes</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="create-button"
            >
              {showCreateForm ? 'Cancel' : 'Create Note'}
            </button>
          </div>

          <SearchFilters
            onSearchChange={handleSearchChange}
            onTagsChange={handleTagsChange}
            onSortChange={handleSortChange}
          />

          {showCreateForm && (
            <div className="modal-overlay">
              <div className="modal">
                <div className="modal-header">
                  <h2 className="modal-title">Create New Note</h2>
                  <button 
                    className="close-button"
                    onClick={() => setShowCreateForm(false)}
                  >
                    ×
                  </button>
                </div>
                <NoteForm
                  onSubmit={handleCreateNote}
                  onCancel={() => setShowCreateForm(false)}
                  isLoading={createLoading}
                  submitText="Create Note"
                />
              </div>
            </div>
          )}

          {notes.length === 0 ? (
            <div className="empty-state">
              <h3>No notes found</h3>
              <p>Try adjusting your search or create a new note.</p>
            </div>
          ) : (
            <>
              <div className="notes-grid">
                {notes.map((note) => (
                  <div key={note.id} className="note-card">
                    <h3 className="note-title">{note.title}</h3>
                    <p className="note-content">{note.content}</p>
                    
                    {note.tags && note.tags.length > 0 && (
                      <div className="note-tags">
                        {note.tags.map((tag, index) => (
                          <span key={index} className="note-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="note-meta">
                      <span className="note-date">
                        Created: {formatDate(note.createdAt)}
                      </span>
                      {note.updatedAt !== note.createdAt && (
                        <span className="note-date">
                          Updated: {formatDate(note.updatedAt)}
                        </span>
                      )}
                    </div>
                    
                    <div className="note-actions">
                      <button
                        onClick={() => handleEditNote(note)}
                        className="edit-button"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {hasMore && (
                <div className="pagination-section">
                  <button
                    onClick={loadMoreNotes}
                    className="load-more-button"
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showEditForm && editingNote && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Edit Note</h2>
              <button 
                className="close-button"
                onClick={() => setShowEditForm(false)}
              >
                ×
              </button>
            </div>
            <NoteForm
              initialData={{
                title: editingNote.title,
                content: editingNote.content,
                tags: editingNote.tags,
              }}
              onSubmit={handleUpdateNote}
              onCancel={() => setShowEditForm(false)}
              isLoading={updateLoading}
              submitText="Update Note"
            />
          </div>
        </div>
      )}
    </div>
  );
};