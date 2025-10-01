import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CreateNoteDto } from './api';

const noteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  content: z.string().min(1, 'Content is required').max(5000, 'Content too long'),
  tags: z.string().optional(),
});

type NoteFormData = z.infer<typeof noteSchema>;

interface NoteFormProps {
  initialData?: CreateNoteDto;
  onSubmit: (data: CreateNoteDto) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  submitText: string;
}

export const NoteForm = ({ initialData, onSubmit, onCancel, isLoading, submitText }: NoteFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      tags: initialData?.tags?.join(', ') || '',
    },
  });

  const onFormSubmit = async (data: NoteFormData) => {
    const tags = data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    await onSubmit({
      title: data.title,
      content: data.content,
      tags,
    });
  };

  return (
    <form className="modal-form" onSubmit={handleSubmit(onFormSubmit)}>
      <div className="form-field">
        <input
          {...register('title')}
          type="text"
          className={`modal-input ${errors.title ? 'error' : ''}`}
          placeholder="Note title"
        />
        {errors.title && <span className="error-message">{errors.title.message}</span>}
      </div>
      
      <div className="form-field">
        <textarea
          {...register('content')}
          className={`modal-input modal-textarea ${errors.content ? 'error' : ''}`}
          placeholder="Write your note here..."
          rows={6}
        />
        {errors.content && <span className="error-message">{errors.content.message}</span>}
      </div>
      
      <div className="form-field">
        <input
          {...register('tags')}
          type="text"
          className="modal-input"
          placeholder="Tags (comma separated)"
        />
      </div>
      
      <div className="modal-actions">
        <button
          type="button"
          className="cancel-button"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="save-button"
          disabled={isLoading || isSubmitting}
        >
          {isLoading || isSubmitting ? 'Saving...' : submitText}
        </button>
      </div>
    </form>
  );
};