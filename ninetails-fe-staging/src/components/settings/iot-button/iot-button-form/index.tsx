import { usePermissions } from '@/hooks/usePermissions';
import { IotButtonTableItem } from '@/interfaces/settings';
import { Col, Form, Row } from 'antd';

import * as S from './index.style';

interface EditIotFormProps {
  record: IotButtonTableItem;
  onSave: (value: IotButtonTableItem) => void;
}

const EditIotForm = ({ record, onSave }: EditIotFormProps) => {
  const [form] = Form.useForm();
  const permissions = usePermissions();

  const handleSave = () => {
    form.validateFields().then((values) => {
      onSave({ ...record, ...values });
    });
  };

  return (
    <S.EditTableFormWrap>
      <Form form={form} initialValues={record} layout="vertical" disabled={permissions.updateAble}>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="버튼 이름" name="buttonName">
              <S.StyledInput />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="SW버전(앱)" name="swVersion">
              <S.StyledInput />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="HW모델" name="hwModel">
              <S.StyledInput />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="호스트폰" name="hostPhone">
              <S.StyledInput />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="전송주기" name="transmissionFrequency">
              <S.StyledSelect />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Identifier" name="identifier">
              <S.StyledInputPassword />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="GPS_X" name="gps_x">
              <S.StyledInput />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="GPS_Y" name="gps_y">
              <S.StyledInput />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="배터리" name="battery">
              <S.StyledInput />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="페어링" name="pairing">
              <S.StyledInput />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Secure Key" name="secureKey">
              <S.StyledInputPassword />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="최종리포트" name="finalReport">
              <S.StyledInput />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="최종시그널" name="finalSignal">
              <S.StyledInput />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="버튼#" name="button">
              <S.StyledInput />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="세션" name="session">
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

export default EditIotForm;
