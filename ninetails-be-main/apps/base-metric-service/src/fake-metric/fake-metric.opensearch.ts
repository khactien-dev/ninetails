import { Inject, Injectable } from '@nestjs/common';
var { Client } = require('@opensearch-project/opensearch');

@Injectable()
export class FakeMetricOpensearch {
  private client;
  constructor() {
    this.client = new Client({
      node: process.env.OPENSEARCH_SERVER,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  async index(index, data) {
    const response = await this.client.index({
      // id: data.data.dispatch_no,
      index: index,
      body: data,
      refresh: true,
    });

    return response;
  }

  async update(index, id, input) {
    // const input = {
    //   field1: 'new_value1',
    //   field2: 'new_value2',
    // };
    const response = await this.client.update({
      index: index,
      id: id,
      body: {
        doc: input,
      },
    });

    return response;
  }

  async delete(index, id) {
    const response = await this.client.delete({
      index: index,
      id: id,
    });
    return response;
  }

  async deleteDocument(index) {
    const response = await this.client.indices.delete({
      index: index,
    });
    return response;
  }

  async exists(index) {
    const indexExistsResponse = await this.client.indices.exists({
      index: index,
    });
    if (indexExistsResponse.statusCode === 200) {
      return true;
    }
    return false;
  }

  async createDocument(index) {
    const indexExistsResponse = await this.client.indices.create({
      index: index,
    });

    return indexExistsResponse;
  }
}
