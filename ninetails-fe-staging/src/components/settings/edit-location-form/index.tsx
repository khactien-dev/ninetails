import { RecordTypes } from '@/interfaces/settings';
import { Col, Form, Input, Row } from 'antd';

import * as S from './index.style';

interface EditFormProps {
  record: RecordTypes;
  onSave: (value: RecordTypes) => void;
}

const EditLocationForm = ({ record, onSave }: EditFormProps) => {
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
            <Form.Item label="지역 이름" name="email">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="설명" name="password">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="동선거리(m)" name="name">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="평균수거시간(m)" name="contact">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="평균수거량(ea)" name="department">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="동선버전" name="position">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="갱신시점" name="role">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="상태" name="status">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row justify="center">
          <S.BtnSave onClick={handleSave}>저장</S.BtnSave>
        </Row>
      </Form>
    </S.EditTableFormWrap>
  );
};

export default EditLocationForm;
