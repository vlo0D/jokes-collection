import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';

export interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState(props: ErrorStateProps) {
  return (
    <Alert
      severity="error"
      action={
        <Button color="inherit" size="small" onClick={props.onRetry}>
          Retry
        </Button>
      }
    >
      <AlertTitle>Something went wrong</AlertTitle>
      {props.message}
    </Alert>
  );
}
