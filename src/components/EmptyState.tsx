import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export interface EmptyStateProps {
  onLoadMore: () => void;
  onAdd: () => void;
}

export function EmptyState(props: EmptyStateProps) {
  return (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        No jokes yet
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Add your own joke or load some from the public source.
      </Typography>
      <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
        <Button variant="contained" onClick={props.onLoadMore}>
          Load more
        </Button>
        <Button variant="outlined" onClick={props.onAdd}>
          Add joke
        </Button>
      </Stack>
    </Box>
  );
}
