import IconPlus from '@/assets/images/svg/icon-plus-2.svg';
import IconTrash from '@/assets/images/svg/icon-trash-3.svg';
import useGraphBuilder from '@/components/analysis/graph-builder/index.utils';
import React from 'react';

import * as S from './index.styles';

const GraphBuilder = () => {
  const { handleAddForm, handleDeleteForm, forms } = useGraphBuilder();

  return (
    <S.Wrapper>
      {forms.map(({ id, form }) => (
        <S.Form key={id}>
          {form}
          <S.Delete onClick={() => handleDeleteForm(id)}>
            <IconTrash />
          </S.Delete>
        </S.Form>
      ))}
      <S.AddCondition onClick={handleAddForm}>
        <IconPlus />새 그래프 작성
      </S.AddCondition>
    </S.Wrapper>
  );
};

export default GraphBuilder;
