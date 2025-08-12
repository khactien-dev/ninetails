import GraphBuildForm from '@/components/analysis/graph-builder/graph-builder-form';
import React, { ReactNode, useState } from 'react';
import { v4 as uuid } from 'uuid';

type PowerGraphType = {
  id: string;
  form: ReactNode;
};

export default function useGraphBuilder() {
  const [forms, setForms] = useState<PowerGraphType[]>([]);
  const [isActiveKey, setIsActiveKey] = useState('3');

  const handleChangeKey = (value: string) => {
    setIsActiveKey(value);
  };

  const handleAddForm = () => {
    const id = uuid();
    setForms([...forms, { id, form: <GraphBuildForm idChart={id} /> }]);
  };

  const handleDeleteForm = (id: string) => {
    const newForms = [...forms].filter((form) => form.id !== id);
    setForms(newForms);
  };

  return {
    handleAddForm,
    handleDeleteForm,
    isActiveKey,
    handleChangeKey,
    forms,
  };
}
