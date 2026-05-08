import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  selectAllJokes,
  selectJokesError,
  selectJokesStatus,
  selectIsAddOpen,
  selectNoMoreJokes,
  selectRefreshingIds,
  jokesActions,
} from '@/store/jokesSlice';
import {
  initializeJokes,
  loadMoreJokes,
  retryAfterError,
  addUserJoke,
  deleteJoke,
  refreshJoke,
} from '@/store/jokesThunks';
import { JokesList } from '@/components/JokesList';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { LoadMoreButton } from '@/components/LoadMoreButton';
import { AddJokeDialog, type AddJokeSubmitInput } from '@/components/AddJokeDialog';

export function JokesScreen() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectAllJokes);
  const status = useAppSelector(selectJokesStatus);
  const error = useAppSelector(selectJokesError);
  const isAddOpen = useAppSelector(selectIsAddOpen);
  const noMoreJokes = useAppSelector(selectNoMoreJokes);
  const refreshingIds = useAppSelector(selectRefreshingIds);

  useEffect(() => {
    void dispatch(initializeJokes());
  }, [dispatch]);

  const handleOpenAdd = () => dispatch(jokesActions.openAddDialog());
  const handleCloseAdd = () => dispatch(jokesActions.closeAddDialog());
  const handleSubmitAdd = (input: AddJokeSubmitInput) => {
    void dispatch(addUserJoke(input));
  };
  const handleDelete = (id: string) => {
    void dispatch(deleteJoke({ id }));
  };
  const handleRefresh = (id: string) => {
    void dispatch(refreshJoke({ id }));
  };
  const handleLoadMore = () => {
    void dispatch(loadMoreJokes());
  };
  const handleRetry = () => {
    void dispatch(retryAfterError());
  };

  const showInitialLoading = status === 'loading' && items.length === 0;
  const showError = error !== null && items.length === 0;
  const showEmpty = !showInitialLoading && !showError && items.length === 0 && status === 'idle';
  const showList = items.length > 0;
  const isLoadingMore = status === 'loading' && items.length > 0;

  return (
    <Stack spacing={3}>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          rowGap: 1,
        }}
      >
        <Typography variant="h4" component="h1">
          Jokes
        </Typography>
        <Button variant="contained" onClick={handleOpenAdd}>
          Add joke
        </Button>
      </Stack>

      {showError && error !== null && (
        <ErrorState message={error} onRetry={handleRetry} />
      )}

      {error !== null && items.length > 0 && (
        <ErrorState message={error} onRetry={handleRetry} />
      )}

      {showInitialLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {showEmpty && <EmptyState onLoadMore={handleLoadMore} onAdd={handleOpenAdd} />}

      {showList && (
        <>
          <JokesList
            jokes={items}
            onDelete={handleDelete}
            onRefresh={handleRefresh}
            refreshingIds={refreshingIds}
          />
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <LoadMoreButton
              onClick={handleLoadMore}
              isLoading={isLoadingMore}
              disabled={isLoadingMore || noMoreJokes}
              noMoreJokes={noMoreJokes}
            />
          </Box>
        </>
      )}

      <AddJokeDialog
        open={isAddOpen}
        onClose={handleCloseAdd}
        onSubmit={handleSubmitAdd}
      />
    </Stack>
  );
}
