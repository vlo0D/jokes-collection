import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

export interface LoadMoreButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
  noMoreJokes: boolean;
}

export function LoadMoreButton(props: LoadMoreButtonProps) {
  const { onClick, isLoading, disabled, noMoreJokes } = props;
  return (
    <Stack spacing={1} sx={{ alignItems: 'center' }}>
      <Button
        variant="contained"
        onClick={onClick}
        disabled={disabled}
        startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : undefined}
      >
        {isLoading ? 'Loading…' : 'Load more'}
      </Button>
      {noMoreJokes && (
        <Typography variant="caption" color="text.secondary">
          No more jokes from the source.
        </Typography>
      )}
    </Stack>
  );
}
