import { useState } from 'react';

export default function useModeConfig() {
  const [editing, setEditing] = useState<boolean>(false);

  return {
    editing,
    setEditing,
  };
}
