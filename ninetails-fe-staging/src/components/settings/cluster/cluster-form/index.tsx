import { ClusterTableItem } from '@/interfaces/settings';
import { Col, Form, Row } from 'antd';

import * as S from './index.style';

interface ClusterFormProps {
  record: ClusterTableItem;
  onSave: (value: ClusterTableItem) => void;
}

const ClusterForm = ({ record, onSave }: ClusterFormProps) => {
  const [form] = Form.useForm();

  const handleSave = () => {
    form.validateFields().then((values) => {
      onSave({ ...record, ...values });
    });
  };

  return (
    <S.EditTableFormWrap>
      <Form form={form} initialValues={record} layout="vertical">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="클러스터 이름" name="clusterName">
              <S.StyledInput />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="설명" name="explanation">
              <S.StyledInput />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="동선거리(m)" name="distance">
              <S.StyledInput />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="혼잡도" name="crowding">
              <S.StyledSelect />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="평균이동속도" name="avrMovementSpeed">
              <S.StyledSelect />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="평균수거량" name="avrCollectionAmount">
              <S.StyledInput />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="상태" name="situation">
              <S.StyledSelect />
            </Form.Item>
          </Col>
        </Row>
        <Row justify={'center'}>
          <S.BtnSave onClick={handleSave}>저장</S.BtnSave>
        </Row>
      </Form>
    </S.EditTableFormWrap>
  );
};

export default ClusterForm;
