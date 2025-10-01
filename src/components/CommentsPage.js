import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const CommentsPage = () => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch comments on component mount
  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/comments');
      const data = await response.json();
      if (data.success) {
        setComments(data.data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      alert('Please write a comment');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: newComment }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Add new comment to the beginning of the list
        setComments([data.data, ...comments]);
        setNewComment(''); // Clear the input
        alert('Comment submitted successfully!');
      } else {
        alert('Error submitting comment: ' + data.error);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Error submitting comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await fetch(`/api/comments?id=${commentId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        // Remove comment from the list
        setComments(comments.filter(comment => comment.id !== commentId));
        alert('Comment deleted successfully!');
      } else {
        alert('Error deleting comment: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Error deleting comment');
    }
  };

  return (
    <Container>
      <Header>
        <Title>Comments</Title>
        <Subtitle>Share your thoughts and feedback</Subtitle>
      </Header>

      <CommentForm onSubmit={handleSubmit}>
        <FormGroup>
          <CommentInput
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitting}
          />
          <SubmitButton type="submit" disabled={submitting || !newComment.trim()}>
            {submitting ? 'Submitting...' : 'Submit'}
          </SubmitButton>
        </FormGroup>
      </CommentForm>

      <CommentsSection>
        <SectionTitle>All Comments ({comments.length})</SectionTitle>
        
        {loading ? (
          <LoadingMessage>Loading comments...</LoadingMessage>
        ) : comments.length === 0 ? (
          <EmptyMessage>No comments yet. Be the first to comment!</EmptyMessage>
        ) : (
          <CommentsList>
            {comments.map((comment) => (
              <CommentItem key={comment.id}>
                <CommentText>{comment.comment}</CommentText>
                <CommentMeta>
                  <CommentDate>
                    {new Date(comment.created_at).toLocaleString()}
                  </CommentDate>
                  <DeleteButton onClick={() => handleDelete(comment.id)}>
                    Delete
                  </DeleteButton>
                </CommentMeta>
              </CommentItem>
            ))}
          </CommentsList>
        )}
      </CommentsSection>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin: 0;
`;

const CommentForm = styled.form`
  background: #f8f9fa;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 40px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  display: flex;
  gap: 15px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const CommentInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #3ABEF9;
  }
  
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, #3ABEF9, #3572EF);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(59, 190, 249, 0.3);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const CommentsSection = styled.div`
  margin-top: 40px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 20px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 1.1rem;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 1.1rem;
  background: #f8f9fa;
  border-radius: 8px;
`;

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const CommentItem = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e1e5e9;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
`;

const CommentText = styled.p`
  margin: 0 0 10px 0;
  font-size: 1rem;
  line-height: 1.5;
  color: #333;
`;

const CommentMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #666;
`;

const CommentDate = styled.span`
  color: #999;
`;

const DeleteButton = styled.button`
  background: #ff4757;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background: #ff3742;
  }
`;

export default CommentsPage;
