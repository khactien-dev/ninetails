import * as moment from 'moment';
import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { logInfo } from './helper.util';
import { log } from 'console';

@Injectable()
export class EncryptDataService {
  constructor(private dataSource: DataSource) {}

  async encryptByKMS(text: string) {
    const accessKey = process.env.NCLOUD_STORAGE_ACCESS_KEY;
    const kmsTag = process.env.KMS_TAG;
    const timestamp = moment().utc().valueOf().toString();
    const hmac = crypto.createHmac(
      'sha256',
      process.env.NCLOUD_STORAGE_SECRET_ACCESS_KEY,
    );
    hmac.update('POST');
    hmac.update(' ');
    hmac.update(`/keys/v2/${kmsTag}/encrypt`);
    hmac.update('\n');
    hmac.update(timestamp);
    hmac.update('\n');
    hmac.update(accessKey);
    const signature = hmac.digest('base64');
    const callApi = await fetch(
      `https://kms.apigw.ntruss.com/keys/v2/${kmsTag}/encrypt`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'x-ncp-apigw-timestamp': timestamp,
          'x-ncp-iam-access-key': accessKey,
          'x-ncp-apigw-signature-v2': signature,
        },
        body: JSON.stringify({
          plaintext: Buffer.from(text).toString('base64'),
          context: Buffer.from('thisisverystrongkey').toString('base64'),
        }),
      },
    );
    const res = await callApi.json();
    return res?.data?.ciphertext as string;
  }

  async decryptByKMS(text: string) {
    const accessKey = process.env.NCLOUD_STORAGE_ACCESS_KEY;
    const kmsTag = process.env.KMS_TAG;
    const timestamp = moment().utc().valueOf().toString();
    const hmac = crypto.createHmac(
      'sha256',
      process.env.NCLOUD_STORAGE_SECRET_ACCESS_KEY,
    );
    hmac.update('POST');
    hmac.update(' ');
    hmac.update(`/keys/v2/${kmsTag}/decrypt`);
    hmac.update('\n');
    hmac.update(timestamp);
    hmac.update('\n');
    hmac.update(accessKey);
    const signature = hmac.digest('base64');
    const callApi = await fetch(
      `https://kms.apigw.ntruss.com/keys/v2/${kmsTag}/decrypt`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'x-ncp-apigw-timestamp': timestamp,
          'x-ncp-iam-access-key': accessKey,
          'x-ncp-apigw-signature-v2': signature,
        },
        body: JSON.stringify({
          ciphertext: Buffer.from(text).toString('base64'),
          context: Buffer.from('thisisverystrongkey').toString('base64'),
        }),
      },
    );
    const res = await callApi.json();
    return res?.data?.plaintext as string;
  }

  async encryptByPgcrypto(
    schema: string,
    table: string,
    data: {
      email?: string;
      full_name?: string;
      department?: string;
      position?: string;
      phone_number?: string;
      url?: string;
    },
  ) {
    let colsString = ``;
    let valuesStr = ``;
    for (const item in data) {
      colsString += item;
      valuesStr += `PGP_SYM_ENCRYPT('${data[item]}','${process.env.ENCRYPT_KEY}')`;
    }
    const insert = await this.dataSource.query(
      `INSERT INTO "${schema}"."${table}" (${colsString}) VALUES (${valuesStr}) returning id;`,
    );
    return insert[0].id;
  }

  async findByPgcrypto(
    schema: string,
    table: string,
    col: string,
    value: string,
  ) {
    const data = await this.dataSource.query(
      `SELECT PGP_SYM_DECRYPT(${col}::bytea, '${process.env.ENCRYPT_KEY}') as ${col}
      FROM "${schema}"."${table}" 
      where (PGP_SYM_DECRYPT(${col}::bytea, '${process.env.ENCRYPT_KEY}') = '${value}');`,
    );
    return data.length > 0 ? data[0] : null;
  }
}
