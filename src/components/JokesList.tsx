import Box from '@mui/material/Box';
import { JokeCard } from './JokeCard';
import type { Joke } from '@/types';

export interface JokesListProps {
  jokes: Joke[];
  onDelete?: (id: string) => void;
  onRefresh?: (id: string) => void;
  refreshingIds?: string[];
}

export function JokesList(props: JokesListProps) {
  const { jokes, onDelete, onRefresh, refreshingIds = [] } = props;
  return (
    <Box
      component="ul"
      sx={{
        listStyle: 'none',
        p: 0,
        m: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
        gap: 2,
        alignItems: 'stretch',
      }}
    >
      {jokes.map((joke) => (
        <Box component="li" key={joke.id} sx={{ display: 'flex' }}>
          <JokeCard
            joke={joke}
            onDelete={onDelete}
            onRefresh={onRefresh}
            isRefreshing={refreshingIds.includes(joke.id)}
          />
        </Box>
      ))}
    </Box>
  );
}
