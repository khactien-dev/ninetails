import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import {
  CreateComboBoxReq,
  SearchComboBoxReq,
  UpdateComboBoxReq,
} from '../dto/combo-box.dto';
import { ComboBoxEntity } from 'libs/entities/combo-box.entity';

@Injectable()
export class ComboBoxService {
  constructor(
    @Inject('COMBO_BOX_REPO')
    private comboBoxEntity: Repository<ComboBoxEntity>,
    @Inject('DATA_SOURCE') private dataSource: DataSource,
  ) {}

  async getAll(data: SearchComboBoxReq) {
    const { entities, raw } = await this.comboBoxEntity
      .createQueryBuilder('combo_box')
      .addSelect(
        `pgp_sym_decrypt(combo_box.data::bytea,'${process.env.ENCRYPT_KEY}')`,
        'data',
      )
      .where('combo_box.field = :field', { field: data.field })
      .orderBy('created_at', 'DESC')
      .getRawAndEntities();
    const boxes = entities.map((item) => {
      const rawItem = raw.find((r) => r.combo_box_id === item.id);
      item.data = rawItem.data;
      return item;
    });
    return boxes;
  }

  async create(createComboBoxReq: CreateComboBoxReq) {
    const comboBoxExits = await this.findOneBy(
      createComboBoxReq.field,
      createComboBoxReq.data,
    );

    if (comboBoxExits) {
      throw new UnprocessableEntityException('ComboBox already exists');
    }
    const select = await this.dataSource.query(
      `select pgp_sym_encrypt('${createComboBoxReq.data.toLowerCase()}','${process.env.ENCRYPT_KEY}')::text as data`,
    );
    await this.comboBoxEntity.save(
      this.comboBoxEntity.create({
        field: createComboBoxReq.field.toLowerCase(),
        data: select[0].data,
      }),
    );
    return await this.findOneBy(
      createComboBoxReq.field,
      createComboBoxReq.data,
    );
  }

  async update(id: number, updateComboBoxReq: UpdateComboBoxReq) {
    const comboBoxById = await this.findOneById(id);

    if (!comboBoxById) {
      throw new NotFoundException("ComboBox doesn't exist");
    }

    const comboBoxByData = await this.findOneBy(
      comboBoxById.field.toLowerCase(),
      updateComboBoxReq.data.toLowerCase(),
    );

    if (comboBoxByData && comboBoxById.id !== comboBoxByData.id) {
      throw new UnprocessableEntityException('ComboBox already exists');
    }

    const updatedData = updateComboBoxReq.data.toLowerCase();

    if (comboBoxById && comboBoxById.data === updatedData) {
      if (comboBoxById.id == id) {
        return 'Update data ComboBox completed.';
      }
      throw new UnprocessableEntityException('ComboBox already exists');
    }

    if (
      comboBoxByData &&
      comboBoxByData.data === updatedData &&
      comboBoxByData.field === comboBoxById.field
    ) {
      throw new UnprocessableEntityException('ComboBox already exists');
    }
    const select = await this.dataSource.query(
      `select pgp_sym_encrypt('${updatedData}','${process.env.ENCRYPT_KEY}')::text as data`,
    );
    await this.comboBoxEntity.update({ id }, { data: select[0].data });

    return 'Update data ComboBox completed.';
  }

  async delete(id: number, schema: string) {
    const comboBoxUser = await this.findUserComboBoxId(id, schema);
    const comboBoxVehicle = await this.findVehicleComboBoxId(id, schema);

    if (comboBoxUser.length > 0 || comboBoxVehicle.length > 0) {
      throw new BadRequestException(
        // 'Fail to delete this option. Please try again!',
        '옵션 삭제에 실패했습니다. 다시 시도해 주세요!',
      );
    }

    const comboBox = await this.findOneById(id);
    if (!comboBox) {
      throw new NotFoundException("ComboBox doesn't exist");
    }
    await this.comboBoxEntity.softDelete(id);
    return 'Deletion data ComboBox completed.';
  }

  async findOneBy(field: string, data: string) {
    const { entities, raw } = await this.comboBoxEntity
      .createQueryBuilder('c')
      .addSelect(
        `pgp_sym_decrypt(c.data::bytea,'${process.env.ENCRYPT_KEY}')`,
        'data',
      )
      .where(
        `pgp_sym_decrypt(c.data::bytea,'${process.env.ENCRYPT_KEY}') = '${data}' and c.field = '${field}'`,
      )
      .getRawAndEntities();
    if (raw.length > 0) {
      const res = entities[0];
      res.data = raw[0].data;
      return entities[0];
    } else {
      return null;
    }
  }

  async findOneById(id) {
    const { entities, raw } = await this.comboBoxEntity
      .createQueryBuilder('c')
      .addSelect(
        `PGP_SYM_DECRYPT(c.data::bytea, '${process.env.ENCRYPT_KEY}')`,
        'data',
      )
      .where(`id = ${id}`)
      .getRawAndEntities();
    const box = entities[0];
    box.data = raw[0].data;
    return box;
  }

  async findUserComboBoxId(id, schema) {
    return await this.dataSource.query(
      `SELECT * FROM "${schema}".users WHERE (department = $1 OR position = $1) AND deleted_at IS NULL`,
      [id],
    );
  }

  async findVehicleComboBoxId(id, schema) {
    return await this.dataSource.query(
      `SELECT * FROM "${schema}".vehicle WHERE (vehicle_type = $1 OR vehicle_model = $1 OR manufacturer = $1 OR special_features = $1 OR max_capacity = $1 OR capacity = $1) AND deleted_at IS NULL`,
      [id],
    );
  }
}
