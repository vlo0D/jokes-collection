import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import type { Joke } from '@/types';

export interface JokeCardProps {
  joke: Joke;
  onDelete?: (id: string) => void;
  onRefresh?: (id: string) => void;
  isRefreshing?: boolean;
}

const ACTIONS_CLASS = 'joke-card-actions';

export function JokeCard(props: JokeCardProps) {
  const { joke, onDelete, onRefresh, isRefreshing = false } = props;
  const hasActions = onDelete !== undefined || onRefresh !== undefined;

  return (
    <Card
      variant="outlined"
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        [`&:hover .${ACTIONS_CLASS}, &:focus-within .${ACTIONS_CLASS}`]: {
          opacity: 1,
          pointerEvents: 'auto',
        },
      }}
    >
      <CardContent sx={{ flex: 1 }}>
        {joke.type !== null && (
          <Chip label={joke.type} size="small" sx={{ mb: 1 }} />
        )}
        <Typography variant="body1" sx={{ mb: 1 }}>
          {joke.setup}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {joke.punchline}
        </Typography>
      </CardContent>
      {hasActions && (
        <CardActions
          className={ACTIONS_CLASS}
          sx={{
            justifyContent: 'flex-end',
            opacity: 0,
            pointerEvents: 'none',
            transition: 'opacity 150ms ease',
          }}
        >
          {onRefresh !== undefined && (
            <Button
              size="small"
              onClick={() => onRefresh(joke.id)}
              disabled={isRefreshing}
            >
              Refresh
            </Button>
          )}
          {onDelete !== undefined && (
            <Button
              size="small"
              color="error"
              onClick={() => onDelete(joke.id)}
              disabled={isRefreshing}
            >
              Delete
            </Button>
          )}
        </CardActions>
      )}
      {isRefreshing && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255,255,255,0.6)',
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}
    </Card>
  );
}
