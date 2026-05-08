import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import {
  validateAddJokeInput,
  type AddJokeValidationErrors,
  MAX_TEXT_LEN,
  MAX_TYPE_LEN,
} from '@/lib/validateAddJokeInput';

export interface AddJokeSubmitInput {
  setup: string;
  punchline: string;
  type: string | null;
}

export interface AddJokeDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: AddJokeSubmitInput) => void;
  submitting?: boolean;
}

export function AddJokeDialog(props: AddJokeDialogProps) {
  if (!props.open) return null;
  return <AddJokeDialogContent {...props} />;
}

function AddJokeDialogContent(props: AddJokeDialogProps) {
  const { open, onClose, onSubmit, submitting = false } = props;
  const [setup, setSetup] = useState('');
  const [punchline, setPunchline] = useState('');
  const [type, setType] = useState('');
  const [errors, setErrors] = useState<AddJokeValidationErrors>({});

  const handleSubmit = () => {
    const result = validateAddJokeInput({ setup, punchline, type });
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    onSubmit(result.cleaned);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add a joke</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Setup"
            value={setup}
            onChange={(e) => setSetup(e.target.value)}
            error={errors.setup !== undefined}
            helperText={errors.setup}
            fullWidth
            autoFocus
            slotProps={{ htmlInput: { maxLength: MAX_TEXT_LEN } }}
          />
          <TextField
            label="Punchline"
            value={punchline}
            onChange={(e) => setPunchline(e.target.value)}
            error={errors.punchline !== undefined}
            helperText={errors.punchline}
            fullWidth
            slotProps={{ htmlInput: { maxLength: MAX_TEXT_LEN } }}
          />
          <TextField
            label="Type (optional)"
            value={type}
            onChange={(e) => setType(e.target.value)}
            error={errors.type !== undefined}
            helperText={errors.type ?? 'e.g. programming, knock-knock'}
            fullWidth
            slotProps={{ htmlInput: { maxLength: MAX_TYPE_LEN } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}
